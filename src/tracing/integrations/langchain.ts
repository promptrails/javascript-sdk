/** LangChain integration — a callback handler that turns LangChain runs into
 * PromptRails spans.
 *
 * @example
 * import { Tracer } from "@promptrails/sdk/tracing";
 * import { PromptRailsCallbackHandler } from "@promptrails/sdk/tracing/integrations/langchain";
 *
 * const tracer = new Tracer({ apiKey: "pr_..." });
 * const handler = new PromptRailsCallbackHandler(tracer);
 * await chain.invoke({ q: "hi" }, { callbacks: [handler] });
 *
 * Implements LangChain's `CallbackHandlerMethods` (duck-typed, so no compile-time
 * dependency on `@langchain/core`). The span tree is built from
 * `runId`/`parentRunId`, so it is correct under concurrent runs. */

import { Span } from "../span";
import { Tracer } from "../tracer";

interface Serialized {
  name?: string;
  id?: string[];
}

export class PromptRailsCallbackHandler {
  readonly name = "promptrails";
  private readonly spans = new Map<string, Span>();

  constructor(
    private readonly tracer: Tracer,
    private readonly options: { sessionId?: string } = {},
  ) {}

  private start(
    runId: string,
    parentRunId: string | undefined,
    name: string,
    kind: string,
    input?: unknown,
  ): Span {
    const parent = parentRunId ? this.spans.get(parentRunId) : undefined;
    const span = this.tracer.startSpan(name, {
      kind,
      parent,
      sessionId: this.options.sessionId,
    });
    if (input !== undefined) span.setInput(input);
    this.spans.set(runId, span);
    return span;
  }

  private finish(runId: string, output?: unknown): void {
    const span = this.spans.get(runId);
    if (!span) return;
    this.spans.delete(runId);
    if (output !== undefined) span.setOutput(output);
    span.end();
  }

  private fail(runId: string, error: unknown): void {
    const span = this.spans.get(runId);
    if (!span) return;
    this.spans.delete(runId);
    span.setError(error);
    span.end();
  }

  // -- chains ----------------------------------------------------------

  handleChainStart(
    chain: Serialized,
    inputs: unknown,
    runId: string,
    parentRunId?: string,
  ): void {
    this.start(runId, parentRunId, nameOf(chain, "chain"), "chain", inputs);
  }
  handleChainEnd(outputs: unknown, runId: string): void {
    this.finish(runId, outputs);
  }
  handleChainError(err: unknown, runId: string): void {
    this.fail(runId, err);
  }

  // -- LLMs ------------------------------------------------------------

  handleLLMStart(
    llm: Serialized,
    prompts: string[],
    runId: string,
    parentRunId?: string,
    extraParams?: Record<string, unknown>,
  ): void {
    const span = this.start(runId, parentRunId, nameOf(llm, "llm"), "llm", {
      prompts,
    });
    applyModel(span, extraParams);
  }
  handleChatModelStart(
    llm: Serialized,
    messages: unknown,
    runId: string,
    parentRunId?: string,
    extraParams?: Record<string, unknown>,
  ): void {
    const span = this.start(runId, parentRunId, nameOf(llm, "llm"), "llm", {
      messages,
    });
    applyModel(span, extraParams);
  }
  handleLLMEnd(output: LLMResult, runId: string): void {
    const span = this.spans.get(runId);
    if (span) applyLLMOutput(span, output);
    this.finish(runId, llmText(output));
  }
  handleLLMError(err: unknown, runId: string): void {
    this.fail(runId, err);
  }

  // -- tools -----------------------------------------------------------

  handleToolStart(
    tool: Serialized,
    input: string,
    runId: string,
    parentRunId?: string,
  ): void {
    this.start(runId, parentRunId, nameOf(tool, "tool"), "tool", { input });
  }
  handleToolEnd(output: unknown, runId: string): void {
    this.finish(runId, { output: String(output) });
  }
  handleToolError(err: unknown, runId: string): void {
    this.fail(runId, err);
  }

  // -- retrievers ------------------------------------------------------

  handleRetrieverStart(
    retriever: Serialized,
    query: string,
    runId: string,
    parentRunId?: string,
  ): void {
    this.start(
      runId,
      parentRunId,
      nameOf(retriever, "retriever"),
      "datasource",
      { query },
    );
  }
  handleRetrieverEnd(documents: unknown[], runId: string): void {
    this.finish(runId, {
      documents: Array.isArray(documents) ? documents.length : 0,
    });
  }
  handleRetrieverError(err: unknown, runId: string): void {
    this.fail(runId, err);
  }
}

interface LLMResult {
  llmOutput?: {
    tokenUsage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
    modelName?: string;
  };
  generations?: Array<Array<{ text?: string }>>;
}

function nameOf(serialized: Serialized | undefined, fallback: string): string {
  if (!serialized) return fallback;
  if (serialized.name) return serialized.name;
  if (Array.isArray(serialized.id) && serialized.id.length > 0) {
    return serialized.id[serialized.id.length - 1];
  }
  return fallback;
}

function applyModel(span: Span, extraParams?: Record<string, unknown>): void {
  const invocation = extraParams?.invocation_params as
    | Record<string, unknown>
    | undefined;
  const model = invocation?.model ?? invocation?.model_name;
  if (typeof model === "string") span.setModel(model);
}

function applyLLMOutput(span: Span, output: LLMResult): void {
  const usage = output.llmOutput?.tokenUsage;
  if (
    usage &&
    (usage.promptTokens !== undefined || usage.completionTokens !== undefined)
  ) {
    span.setUsage(
      usage.promptTokens,
      usage.completionTokens,
      usage.totalTokens,
    );
  }
  if (output.llmOutput?.modelName) span.setModel(output.llmOutput.modelName);
}

function llmText(output: LLMResult): { text: string } | undefined {
  const text = output.generations?.[0]?.[0]?.text;
  return text !== undefined ? { text } : undefined;
}
