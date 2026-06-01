/** Buffers finished spans and ships them to the ingest API in batches.
 *
 * Spans are flushed on a timer, when the buffer fills, and (in Node) before the
 * process exits. Export is best-effort: failures are logged and dropped rather
 * than thrown into the caller's code, and the buffer is bounded. */

import { HTTPClient } from "../http";
import { SpanPayload } from "./span";

export const INGEST_PATH = "/api/v1/traces/ingest";

export interface ExporterOptions {
  maxBatchSize?: number;
  flushIntervalMs?: number;
  maxQueueSize?: number;
}

export class SpanExporter {
  private buffer: SpanPayload[] = [];
  private readonly maxBatchSize: number;
  private readonly maxQueueSize: number;
  private readonly timer?: ReturnType<typeof setInterval>;
  private flushing = false;

  constructor(
    private readonly http: HTTPClient,
    options: ExporterOptions = {},
  ) {
    this.maxBatchSize = options.maxBatchSize ?? 100;
    this.maxQueueSize = options.maxQueueSize ?? 10_000;

    const intervalMs = options.flushIntervalMs ?? 1000;
    this.timer = setInterval(() => {
      void this.flush();
    }, intervalMs);
    // Don't keep a Node process alive just for the flush timer.
    (this.timer as { unref?: () => void }).unref?.();

    if (typeof process !== "undefined" && typeof process.once === "function") {
      process.once("beforeExit", () => {
        void this.flush();
      });
    }
  }

  /** Queue a span payload. Drops it (with a warning) if the buffer is full so a
   * stalled endpoint never blocks the caller. */
  submit(payload: SpanPayload): void {
    if (this.buffer.length >= this.maxQueueSize) {
      console.warn("promptrails tracing buffer full; dropping span");
      return;
    }
    this.buffer.push(payload);
    if (this.buffer.length >= this.maxBatchSize) {
      void this.flush();
    }
  }

  /** Send buffered spans. Resolves once the current buffer is drained. */
  async flush(): Promise<void> {
    if (this.flushing) return;
    this.flushing = true;
    try {
      while (this.buffer.length > 0) {
        const batch = this.buffer.splice(0, this.maxBatchSize);
        await this.send(batch);
      }
    } finally {
      this.flushing = false;
    }
  }

  async shutdown(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    await this.flush();
  }

  private async send(spans: SpanPayload[]): Promise<void> {
    if (spans.length === 0) return;
    try {
      await this.http.post(INGEST_PATH, { json: { spans } });
    } catch (err) {
      console.warn(
        `promptrails trace export failed (${spans.length} spans):`,
        err,
      );
    }
  }
}
