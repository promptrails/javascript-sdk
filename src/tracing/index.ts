/** PromptRails tracing — send spans to PromptRails from any code, without
 * managing your prompts or agents on the platform. Requires an API key with the
 * `traces:write` scope. */

export type { ExporterOptions } from "./exporter";
export { INGEST_PATH, SpanExporter } from "./exporter";
export { generateSpanId, generateTraceId } from "./ids";
export type { SpanLevel, SpanOptions, SpanPayload, SpanStatus } from "./span";
export { Span } from "./span";
export type { StartSpanOptions, TracerOptions } from "./tracer";
export { Tracer } from "./tracer";
