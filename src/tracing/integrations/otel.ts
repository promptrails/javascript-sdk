/** OpenTelemetry bridge — export OTel spans to PromptRails.
 *
 * @example
 * import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
 * import { PromptRailsSpanExporter } from "@promptrails/sdk/tracing/integrations/otel";
 *
 * provider.addSpanProcessor(
 *   new BatchSpanProcessor(new PromptRailsSpanExporter({ apiKey: "pr_..." }))
 * );
 *
 * Implements the OTel `SpanExporter` interface (duck-typed, so no compile-time
 * dependency on `@opentelemetry/*`). `gen_ai.*` semantic-convention attributes
 * are mapped onto the PromptRails span model. */

import { ClientOptions, resolveConfig } from "../../config";
import { HTTPClient } from "../../http";
import { INGEST_PATH } from "../exporter";
import { SpanPayload } from "../span";

// [seconds, nanoseconds]
type HrTime = [number, number];

interface ReadableSpan {
  name: string;
  spanContext(): { traceId: string; spanId: string };
  parentSpanId?: string;
  parentSpanContext?: { spanId: string };
  startTime: HrTime;
  endTime: HrTime;
  attributes: Record<string, unknown>;
  status: { code: number };
}

// ExportResultCode: SUCCESS = 0, FAILED = 1
type ExportResult = { code: number };

const GENAI_OP = "gen_ai.operation.name";
const GENAI_REQ_MODEL = "gen_ai.request.model";
const GENAI_RESP_MODEL = "gen_ai.response.model";
const GENAI_IN_TOKENS = "gen_ai.usage.input_tokens";
const GENAI_OUT_TOKENS = "gen_ai.usage.output_tokens";

export interface PromptRailsSpanExporterOptions extends Partial<ClientOptions> {
  http?: HTTPClient;
}

export class PromptRailsSpanExporter {
  private readonly http: HTTPClient;

  constructor(options: PromptRailsSpanExporterOptions = {}) {
    if (options.http) {
      this.http = options.http;
    } else {
      if (!options.apiKey) {
        throw new Error("PromptRailsSpanExporter requires an apiKey (or http)");
      }
      this.http = new HTTPClient(resolveConfig(options as ClientOptions));
    }
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void,
  ): void {
    const payloads = spans.map(otelSpanToPayload);
    this.http
      .post(INGEST_PATH, { json: { spans: payloads } })
      .then(() => resultCallback({ code: 0 }))
      .catch(() => resultCallback({ code: 1 }));
  }

  async shutdown(): Promise<void> {
    // Nothing buffered locally; the HTTP client is stateless.
  }

  async forceFlush(): Promise<void> {
    // No-op: export() sends immediately.
  }
}

export function otelSpanToPayload(span: ReadableSpan): SpanPayload {
  const ctx = span.spanContext();
  const attributes = { ...span.attributes };

  const payload: SpanPayload = {
    trace_id: ctx.traceId,
    span_id: ctx.spanId,
    name: span.name,
    kind: kindOf(attributes),
    status: span.status?.code === 2 ? "error" : "ok",
    level: "default",
    started_at: hrToIso(span.startTime),
    attributes,
  };

  const parentSpanId = span.parentSpanContext?.spanId ?? span.parentSpanId;
  if (parentSpanId) payload.parent_span_id = parentSpanId;
  if (span.endTime) payload.ended_at = hrToIso(span.endTime);

  const model = attributes[GENAI_RESP_MODEL] ?? attributes[GENAI_REQ_MODEL];
  if (typeof model === "string") payload.model_name = model;
  const prompt = toNumber(attributes[GENAI_IN_TOKENS]);
  const completion = toNumber(attributes[GENAI_OUT_TOKENS]);
  if (prompt !== undefined) payload.prompt_tokens = prompt;
  if (completion !== undefined) payload.completion_tokens = completion;
  if (prompt !== undefined && completion !== undefined) {
    payload.total_tokens = prompt + completion;
  }
  return payload;
}

function kindOf(attributes: Record<string, unknown>): string {
  switch (attributes[GENAI_OP]) {
    case "chat":
    case "text_completion":
    case "completion":
    case "generate_content":
      return "llm";
    case "execute_tool":
    case "tool":
      return "tool";
    case "embeddings":
    case "embedding":
      return "embedding";
    default:
      return "chain";
  }
}

function hrToIso(time: HrTime): string {
  const [seconds, nanos] = time;
  return new Date(seconds * 1000 + nanos / 1e6).toISOString();
}

function toNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}
