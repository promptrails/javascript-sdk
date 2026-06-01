import { HTTPClient } from "../src/http";
import { Span } from "../src/tracing/span";
import { Tracer } from "../src/tracing/tracer";

function mockHttp() {
  return {
    post: jest.fn().mockResolvedValue({ data: { ingested: 1 } }),
    get: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    request: jest.fn(),
  } as unknown as HTTPClient;
}

function postedSpans(http: HTTPClient): Record<string, unknown>[] {
  const calls = (http.post as jest.Mock).mock.calls;
  return calls.flatMap(
    (c) => (c[1] as { json: { spans: Record<string, unknown>[] } }).json.spans,
  );
}

function tracer(http: HTTPClient): Tracer {
  // Long flush interval so only the explicit flush() drives delivery.
  return new Tracer({ http, flushIntervalMs: 3_600_000 });
}

describe("Tracer", () => {
  it("nests spans, sharing trace id and linking parent", async () => {
    const http = mockHttp();
    const t = tracer(http);

    await t.span("agent-run", { kind: "agent" }, async (root) => {
      root.setInput({ q: "weather?" });
      await t.span("llm-call", { kind: "llm" }, async (llm) => {
        llm.setModel("gpt-4o").setUsage(120, 30).setOutput({ text: "rainy" });
      });
    });
    await t.shutdown();

    const spans = Object.fromEntries(postedSpans(http).map((s) => [s.name, s]));
    const root = spans["agent-run"] as Record<string, unknown>;
    const llm = spans["llm-call"] as Record<string, unknown>;
    expect(root.trace_id).toBe(llm.trace_id);
    expect(root.parent_span_id).toBeUndefined();
    expect(llm.parent_span_id).toBe(root.span_id);
    expect(llm.kind).toBe("llm");
    expect(llm.model_name).toBe("gpt-4o");
    expect(llm.prompt_tokens).toBe(120);
    expect(llm.total_tokens).toBe(150);
    expect(llm.output).toEqual({ text: "rainy" });
  });

  it("records thrown errors and re-raises", async () => {
    const http = mockHttp();
    const t = tracer(http);

    await expect(
      t.span("boom", { kind: "tool" }, async () => {
        throw new Error("kaboom");
      }),
    ).rejects.toThrow("kaboom");
    await t.shutdown();

    const span = postedSpans(http)[0];
    expect(span.status).toBe("error");
    expect(span.error_type).toBe("Error");
    expect(span.error_message).toBe("kaboom");
  });

  it("traced() wraps a function in a span", async () => {
    const http = mockHttp();
    const t = tracer(http);
    const add = t.traced((a: number, b: number) => a + b, {
      name: "add",
      kind: "tool",
    });

    expect(await add(2, 3)).toBe(5);
    await t.shutdown();

    const span = postedSpans(http)[0];
    expect(span.name).toBe("add");
    expect(span.kind).toBe("tool");
  });

  it("sends tags as an array", async () => {
    const http = mockHttp();
    const t = tracer(http);
    await t.span("tagged", {}, (span) => {
      span.setTags("prod", "checkout");
    });
    await t.shutdown();
    expect(postedSpans(http)[0].tags).toEqual(["prod", "checkout"]);
  });

  it("serializes a span payload", () => {
    const span = new Span("x", {
      kind: "llm",
      traceId: "t",
      parentSpanId: "p",
    });
    span.setUsage(10, 5).setCost(0.01).setModel("m");
    span.end();
    const payload = span.toPayload();
    expect(payload.trace_id).toBe("t");
    expect(payload.parent_span_id).toBe("p");
    expect(payload.total_tokens).toBe(15);
    expect(payload.cost).toBe(0.01);
    expect(payload.started_at).toBeDefined();
    expect(payload.ended_at).toBeDefined();
  });
});
