/** Anthropic integration — wrap a client so each Messages call is traced
 * automatically (model, token usage, latency, output).
 *
 * @example
 * import Anthropic from "@anthropic-ai/sdk";
 * import { Tracer } from "@promptrails/sdk/tracing";
 * import { traceAnthropic } from "@promptrails/sdk/tracing/integrations/anthropic";
 *
 * const tracer = new Tracer({ apiKey: "pr_..." });
 * const client = traceAnthropic(new Anthropic(), tracer);
 * await client.messages.create({ model: "claude-sonnet-4-5", max_tokens: 1024, messages: [...] });
 *
 * Duck-typed: it patches `client.messages.create` and reads `model`/`usage`/
 * `content` off the response. */

import { Span } from "../span";
import { Tracer } from "../tracer";

interface AnthropicUsage {
  input_tokens?: number;
  output_tokens?: number;
}

interface AnthropicResponse {
  model?: string;
  usage?: AnthropicUsage;
  content?: Array<{ text?: unknown }>;
}

type CreateFn = (params: {
  model?: string;
  messages?: unknown;
  system?: unknown;
}) => Promise<AnthropicResponse>;

interface AnthropicLike {
  messages: { create: CreateFn };
}

export function traceAnthropic<T extends AnthropicLike>(
  client: T,
  tracer: Tracer,
  options: { spanName?: string } = {},
): T {
  const messages = client.messages;
  const original = messages.create.bind(messages);
  const spanName = options.spanName ?? "anthropic.messages";

  messages.create = (params) =>
    tracer.span(spanName, { kind: "llm" }, async (span) => {
      if (params.model) span.setModel(params.model);
      if (params.messages !== undefined) {
        span.setInput({ messages: params.messages, system: params.system });
      }
      const response = await original(params);
      applyResponse(span, response);
      return response;
    });

  return client;
}

function applyResponse(span: Span, response: AnthropicResponse): void {
  const usage = response.usage;
  if (
    usage &&
    (usage.input_tokens !== undefined || usage.output_tokens !== undefined)
  ) {
    span.setUsage(usage.input_tokens, usage.output_tokens);
  }
  if (response.model) span.setModel(response.model);
  const text = response.content?.find(
    (block) => block?.text !== undefined,
  )?.text;
  if (text !== undefined) span.setOutput({ content: text });
}
