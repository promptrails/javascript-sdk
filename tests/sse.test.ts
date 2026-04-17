import { parseSSEStream } from "../src/sse";
import type { StreamEvent } from "../src/types";

/**
 * Build a Response whose body streams the given text in chunks. Each chunk
 * is yielded on a separate microtask so the parser sees partial frames the
 * same way it would on a real network connection.
 */
function sseResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });
}

async function collect(
  response: Response,
  signal?: AbortSignal,
): Promise<StreamEvent[]> {
  const events: StreamEvent[] = [];
  for await (const e of parseSSEStream(response, signal)) {
    events.push(e);
  }
  return events;
}

describe("parseSSEStream", () => {
  it("parses execution + content + done frames", async () => {
    const resp = sseResponse([
      `event: execution\ndata: {"execution_id":"e1","user_message_id":"m1"}\n\n`,
      `event: content\ndata: {"content":"Hello"}\n\n`,
      `event: content\ndata: {"content":" world"}\n\n`,
      `event: done\ndata: {"output":{"content":"Hello world"},"token_usage":{"total_tokens":5}}\n\n`,
    ]);
    const events = await collect(resp);
    expect(events).toEqual([
      { type: "execution", executionId: "e1", userMessageId: "m1" },
      { type: "content", content: "Hello" },
      { type: "content", content: " world" },
      {
        type: "done",
        output: { content: "Hello world" },
        tokenUsage: { total_tokens: 5 },
      },
    ]);
  });

  it("parses tool_start and tool_end", async () => {
    const resp = sseResponse([
      `event: tool_start\ndata: {"id":"t1","name":"search"}\n\n`,
      `event: tool_end\ndata: {"id":"t1","name":"search","summary":"3 results"}\n\n`,
    ]);
    const events = await collect(resp);
    expect(events).toEqual([
      { type: "tool_start", id: "t1", name: "search" },
      {
        type: "tool_end",
        id: "t1",
        name: "search",
        summary: "3 results",
      },
    ]);
  });

  it("handles frames split across chunks", async () => {
    const resp = sseResponse([
      `event: conte`,
      `nt\ndata: {"cont`,
      `ent":"hi"}\n\n`,
      `event: done\ndata: {}\n\n`,
    ]);
    const events = await collect(resp);
    expect(events).toEqual([
      { type: "content", content: "hi" },
      { type: "done", output: undefined, tokenUsage: undefined },
    ]);
  });

  it("skips unknown event types silently", async () => {
    const resp = sseResponse([
      `event: ping\ndata: {"ok":true}\n\n`,
      `event: content\ndata: {"content":"x"}\n\n`,
    ]);
    const events = await collect(resp);
    expect(events).toEqual([{ type: "content", content: "x" }]);
  });

  it("maps error frames to error events", async () => {
    const resp = sseResponse([
      `event: error\ndata: {"message":"quota exceeded"}\n\n`,
    ]);
    const events = await collect(resp);
    expect(events).toEqual([{ type: "error", message: "quota exceeded" }]);
  });

  it("stops when the signal aborts", async () => {
    const encoder = new TextEncoder();
    const ctrl = new AbortController();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(
          encoder.encode(`event: content\ndata: {"content":"a"}\n\n`),
        );
        ctrl.abort();
        // queue a second chunk that should never be yielded
        controller.enqueue(
          encoder.encode(`event: content\ndata: {"content":"b"}\n\n`),
        );
        controller.close();
      },
    });
    const resp = new Response(stream);
    const events = await collect(resp, ctrl.signal);
    expect(events.length).toBeLessThanOrEqual(1);
  });
});
