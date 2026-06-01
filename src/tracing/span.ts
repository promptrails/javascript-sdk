/** A single span within a trace. Build it with the chainable setters, then call
 * `end()` (or use the tracer's `span()` helper, which ends it for you). */

import { generateSpanId, generateTraceId } from "./ids";

export type SpanStatus = "ok" | "error";
export type SpanLevel = "debug" | "default" | "warning" | "error";

export interface SpanOptions {
  kind?: string;
  traceId?: string;
  parentSpanId?: string;
  sessionId?: string;
  onEnd?: (span: Span) => void;
}

export interface SpanPayload {
  trace_id: string;
  span_id: string;
  parent_span_id?: string;
  name: string;
  kind: string;
  status: SpanStatus;
  level: SpanLevel;
  started_at: string;
  ended_at?: string;
  input?: unknown;
  output?: unknown;
  attributes?: Record<string, unknown>;
  tags?: string[];
  model_name?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost?: number;
  session_id?: string;
  error_message?: string;
  error_type?: string;
}

export class Span {
  readonly traceId: string;
  readonly spanId: string;
  readonly parentSpanId?: string;
  name: string;
  kind: string;
  status: SpanStatus = "ok";
  level: SpanLevel = "default";

  private input?: unknown;
  private output?: unknown;
  private attributes: Record<string, unknown> = {};
  private tags: string[] = [];
  private modelName?: string;
  private promptTokens?: number;
  private completionTokens?: number;
  private totalTokens?: number;
  private cost?: number;
  sessionId?: string;
  private errorMessage?: string;
  private errorType?: string;

  private readonly startedAt = new Date();
  private endedAt?: Date;
  private readonly onEnd?: (span: Span) => void;
  private ended = false;

  constructor(name: string, options: SpanOptions = {}) {
    this.name = name;
    this.kind = options.kind ?? "chain";
    this.traceId = options.traceId ?? generateTraceId();
    this.spanId = generateSpanId();
    this.parentSpanId = options.parentSpanId;
    this.sessionId = options.sessionId;
    this.onEnd = options.onEnd;
  }

  setInput(value: unknown): this {
    this.input = value;
    return this;
  }

  setOutput(value: unknown): this {
    this.output = value;
    return this;
  }

  setAttributes(attrs: Record<string, unknown>): this {
    Object.assign(this.attributes, attrs);
    return this;
  }

  setTags(...tags: string[]): this {
    this.tags.push(...tags);
    return this;
  }

  setModel(model: string): this {
    this.modelName = model;
    return this;
  }

  setUsage(
    promptTokens?: number,
    completionTokens?: number,
    totalTokens?: number,
  ): this {
    this.promptTokens = promptTokens;
    this.completionTokens = completionTokens;
    if (
      totalTokens === undefined &&
      promptTokens !== undefined &&
      completionTokens !== undefined
    ) {
      totalTokens = promptTokens + completionTokens;
    }
    this.totalTokens = totalTokens;
    return this;
  }

  setCost(cost: number): this {
    this.cost = cost;
    return this;
  }

  setSession(sessionId: string): this {
    this.sessionId = sessionId;
    return this;
  }

  setError(error: unknown): this {
    this.status = "error";
    this.level = "error";
    if (error instanceof Error) {
      this.errorMessage = error.message;
      this.errorType = error.name;
    } else {
      this.errorMessage = String(error);
    }
    return this;
  }

  /** Finalize the span and hand it to the exporter. Idempotent. */
  end(): void {
    if (this.ended) return;
    this.ended = true;
    this.endedAt = new Date();
    this.onEnd?.(this);
  }

  toPayload(): SpanPayload {
    const payload: SpanPayload = {
      trace_id: this.traceId,
      span_id: this.spanId,
      name: this.name,
      kind: this.kind,
      status: this.status,
      level: this.level,
      started_at: this.startedAt.toISOString(),
    };
    if (this.parentSpanId) payload.parent_span_id = this.parentSpanId;
    if (this.endedAt) payload.ended_at = this.endedAt.toISOString();
    if (this.input !== undefined) payload.input = this.input;
    if (this.output !== undefined) payload.output = this.output;
    if (Object.keys(this.attributes).length > 0)
      payload.attributes = this.attributes;
    if (this.tags.length > 0) payload.tags = this.tags;
    if (this.modelName) payload.model_name = this.modelName;
    if (this.promptTokens !== undefined)
      payload.prompt_tokens = this.promptTokens;
    if (this.completionTokens !== undefined)
      payload.completion_tokens = this.completionTokens;
    if (this.totalTokens !== undefined) payload.total_tokens = this.totalTokens;
    if (this.cost !== undefined) payload.cost = this.cost;
    if (this.sessionId) payload.session_id = this.sessionId;
    if (this.errorMessage) payload.error_message = this.errorMessage;
    if (this.errorType) payload.error_type = this.errorType;
    return payload;
  }
}
