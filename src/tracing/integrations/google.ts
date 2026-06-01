/** Google GenAI integration — wrap a client so each generateContent call is
 * traced automatically (model, token usage, latency, output).
 *
 * @example
 * import { GoogleGenAI } from "@google/genai";
 * import { Tracer } from "@promptrails/sdk/tracing";
 * import { traceGoogle } from "@promptrails/sdk/tracing/integrations/google";
 *
 * const tracer = new Tracer({ apiKey: "pr_..." });
 * const client = traceGoogle(new GoogleGenAI({ apiKey: "..." }), tracer);
 * await client.models.generateContent({ model: "gemini-2.0-flash", contents: "Hello" });
 *
 * Targets the unified `@google/genai` SDK (`client.models.generateContent`).
 * Duck-typed: it reads `usageMetadata` and `text` off the response. */

import { Span } from "../span";
import { Tracer } from "../tracer";

interface GoogleUsage {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

interface GoogleResponse {
  text?: unknown;
  modelVersion?: string;
  usageMetadata?: GoogleUsage;
}

type GenerateFn = (params: {
  model?: string;
  contents?: unknown;
}) => Promise<GoogleResponse>;

interface GoogleLike {
  models: { generateContent: GenerateFn };
}

export function traceGoogle<T extends GoogleLike>(
  client: T,
  tracer: Tracer,
  options: { spanName?: string } = {},
): T {
  const models = client.models;
  const original = models.generateContent.bind(models);
  const spanName = options.spanName ?? "google.generateContent";

  models.generateContent = (params) =>
    tracer.span(spanName, { kind: "llm" }, async (span) => {
      if (params.model) span.setModel(params.model);
      if (params.contents !== undefined)
        span.setInput({ contents: params.contents });
      const response = await original(params);
      applyResponse(span, response, params.model);
      return response;
    });

  return client;
}

function applyResponse(
  span: Span,
  response: GoogleResponse,
  requestModel?: string,
): void {
  const usage = response.usageMetadata;
  if (
    usage &&
    (usage.promptTokenCount !== undefined ||
      usage.candidatesTokenCount !== undefined)
  ) {
    span.setUsage(
      usage.promptTokenCount,
      usage.candidatesTokenCount,
      usage.totalTokenCount,
    );
  }
  const model = response.modelVersion ?? requestModel;
  if (model) span.setModel(model);
  if (response.text !== undefined) span.setOutput({ text: response.text });
}
