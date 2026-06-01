/** Tracer — entry point for producing PromptRails traces.
 *
 * @example
 * const tracer = new Tracer({ apiKey: "pr_..." });
 * await tracer.span("agent-run", { kind: "agent" }, async (root) => {
 *   root.setInput({ q: "weather?" });
 *   await tracer.span("llm", { kind: "llm" }, async (llm) => {
 *     llm.setModel("gpt-4o").setUsage(120, 30);
 *   });
 * });
 * await tracer.flush();
 */

import { ClientOptions, resolveConfig } from "../config";
import { HTTPClient } from "../http";
import { ExporterOptions, SpanExporter } from "./exporter";
import { Span } from "./span";

export interface TracerOptions extends Partial<ClientOptions>, ExporterOptions {
  /** Reuse an existing HTTP client instead of building one from apiKey. */
  http?: HTTPClient;
  /** Reuse an existing exporter. */
  exporter?: SpanExporter;
}

export interface StartSpanOptions {
  kind?: string;
  sessionId?: string;
  /** Explicit parent; defaults to the currently-active span. */
  parent?: Span;
}

export class Tracer {
  private readonly exporter: SpanExporter;
  // Active-span stack for implicit parent linking. Correct for sequential
  // (awaited) nesting; pass `parent` explicitly for concurrent spans.
  private readonly stack: Span[] = [];

  constructor(options: TracerOptions = {}) {
    if (options.exporter) {
      this.exporter = options.exporter;
    } else {
      let http = options.http;
      if (!http) {
        if (!options.apiKey) {
          throw new Error("Tracer requires an apiKey (or an http/exporter)");
        }
        http = new HTTPClient(resolveConfig(options as ClientOptions));
      }
      this.exporter = new SpanExporter(http, options);
    }
  }

  /** Create a span without a callback block. The caller must call `span.end()`.
   * Parent and trace ID are inherited from the active span unless `parent` is given. */
  startSpan(name: string, options: StartSpanOptions = {}): Span {
    const parent = options.parent ?? this.stack[this.stack.length - 1];
    return new Span(name, {
      kind: options.kind,
      sessionId: options.sessionId ?? parent?.sessionId,
      traceId: parent?.traceId,
      parentSpanId: parent?.spanId,
      onEnd: (s) => this.exporter.submit(s.toPayload()),
    });
  }

  /** Run `fn` inside a span: the span becomes the active parent for the block,
   * is ended on completion, and records thrown errors. */
  async span<T>(
    name: string,
    options: StartSpanOptions,
    fn: (span: Span) => Promise<T> | T,
  ): Promise<T> {
    const span = this.startSpan(name, options);
    this.stack.push(span);
    try {
      return await fn(span);
    } catch (err) {
      span.setError(err);
      throw err;
    } finally {
      this.stack.pop();
      span.end();
    }
  }

  /** Wrap a function so each call runs inside a span. */
  traced<A extends unknown[], R>(
    fn: (...args: A) => Promise<R> | R,
    options: StartSpanOptions & { name?: string } = {},
  ): (...args: A) => Promise<R> {
    const name = options.name ?? fn.name ?? "fn";
    return (...args: A) => this.span(name, options, () => fn(...args));
  }

  currentSpan(): Span | undefined {
    return this.stack[this.stack.length - 1];
  }

  flush(): Promise<void> {
    return this.exporter.flush();
  }

  shutdown(): Promise<void> {
    return this.exporter.shutdown();
  }
}
