/** PromptRails tracing — send spans to PromptRails from any code, without
 * managing your prompts or agents on the platform. Requires an API key with the
 * `traces:write` scope. */

export { Tracer } from "./tracer";
export type { TracerOptions, StartSpanOptions } from "./tracer";
export { Span } from "./span";
export type { SpanOptions, SpanPayload, SpanStatus, SpanLevel } from "./span";
export { SpanExporter, INGEST_PATH } from "./exporter";
export type { ExporterOptions } from "./exporter";
export { generateTraceId, generateSpanId } from "./ids";
