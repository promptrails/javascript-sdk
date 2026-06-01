/** OpenAI / Anthropic integration — wrap a client so each completion call is
 * traced automatically (model, token usage, latency, output).
 *
 * @example
 * import OpenAI from "openai";
 * import { Tracer } from "@promptrails/sdk/tracing";
 * import { traceOpenAI } from "@promptrails/sdk/tracing/integrations/openai";
 *
 * const tracer = new Tracer({ apiKey: "pr_..." });
 * const client = traceOpenAI(new OpenAI(), tracer);
 * await client.chat.completions.create({ model: "gpt-4o", messages: [...] });
 *
 * Duck-typed: it patches `client.chat.completions.create` and reads
 * `model`/`usage`/`choices` off the response, so it works with any
 * API-compatible client. */

import { Span } from "../span";
import { Tracer } from "../tracer";

interface Usage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  input_tokens?: number;
  output_tokens?: number;
}

interface ChatResponse {
  model?: string;
  usage?: Usage;
  choices?: Array<{ message?: { content?: unknown }; text?: unknown }>;
}

// Minimal shape we patch — kept loose so any OpenAI-compatible client works.
type CreateFn = (params: {
  model?: string;
  messages?: unknown;
}) => Promise<ChatResponse>;
interface OpenAILike {
  chat: { completions: { create: CreateFn } };
}

export function traceOpenAI<T extends OpenAILike>(
  client: T,
  tracer: Tracer,
  options: { spanName?: string } = {},
): T {
  const completions = client.chat.completions;
  const original = completions.create.bind(completions);
  const spanName = options.spanName ?? "openai.chat";

  completions.create = (params) =>
    tracer.span(spanName, { kind: "llm" }, async (span) => {
      if (params.model) span.setModel(params.model);
      if (params.messages !== undefined)
        span.setInput({ messages: params.messages });
      const response = await original(params);
      applyResponse(span, response);
      return response;
    });

  return client;
}

function applyResponse(span: Span, response: ChatResponse): void {
  const usage = response.usage;
  if (usage) {
    const prompt = usage.prompt_tokens ?? usage.input_tokens;
    const completion = usage.completion_tokens ?? usage.output_tokens;
    if (prompt !== undefined || completion !== undefined) {
      span.setUsage(prompt, completion, usage.total_tokens);
    }
  }
  if (response.model) span.setModel(response.model);
  const choice = response.choices?.[0];
  const content = choice?.message?.content ?? choice?.text;
  if (content !== undefined) span.setOutput({ content });
}
