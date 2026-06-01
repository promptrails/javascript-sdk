import { HTTPClient } from "../src/http";
import { PromptRailsCallbackHandler } from "../src/tracing/integrations/langchain";
import { traceOpenAI } from "../src/tracing/integrations/openai";
import { otelSpanToPayload } from "../src/tracing/integrations/otel";
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
  return new Tracer({ http, flushIntervalMs: 3_600_000 });
}

describe("LangChain handler", () => {
  it("builds a span tree from run ids", async () => {
    const http = mockHttp();
    const t = tracer(http);
    const handler = new PromptRailsCallbackHandler(t);

    handler.handleChainStart({ name: "AgentExecutor" }, { q: "hi" }, "chain-1");
    handler.handleLLMStart(
      { name: "ChatOpenAI" },
      ["prompt"],
      "llm-1",
      "chain-1",
    );
    handler.handleLLMEnd(
      {
        llmOutput: {
          tokenUsage: { promptTokens: 10, completionTokens: 5 },
          modelName: "gpt-4o",
        },
        generations: [[{ text: "hi" }]],
      },
      "llm-1",
    );
    handler.handleChainEnd({ answer: "done" }, "chain-1");
    await t.shutdown();

    const spans = Object.fromEntries(postedSpans(http).map((s) => [s.name, s]));
    const chain = spans["AgentExecutor"] as Record<string, unknown>;
    const llm = spans["ChatOpenAI"] as Record<string, unknown>;
    expect(chain.trace_id).toBe(llm.trace_id);
    expect(chain.parent_span_id).toBeUndefined();
    expect(llm.parent_span_id).toBe(chain.span_id);
    expect(llm.kind).toBe("llm");
    expect(llm.model_name).toBe("gpt-4o");
    expect(llm.prompt_tokens).toBe(10);
    expect(llm.total_tokens).toBe(15);
  });

  it("records tool errors", async () => {
    const http = mockHttp();
    const t = tracer(http);
    const handler = new PromptRailsCallbackHandler(t);

    handler.handleToolStart({ name: "search" }, "query", "tool-1");
    handler.handleToolError(new Error("boom"), "tool-1");
    await t.shutdown();

    const span = postedSpans(http)[0];
    expect(span.kind).toBe("tool");
    expect(span.status).toBe("error");
    expect(span.error_type).toBe("Error");
  });
});

describe("traceOpenAI", () => {
  it("wraps chat.completions.create", async () => {
    const http = mockHttp();
    const t = tracer(http);
    const client = {
      chat: {
        completions: {
          create: async (_params: { model?: string; messages?: unknown }) => ({
            model: "gpt-4o",
            usage: {
              prompt_tokens: 12,
              completion_tokens: 8,
              total_tokens: 20,
            },
            choices: [{ message: { content: "hello" } }],
          }),
        },
      },
    };
    const traced = traceOpenAI(client, t);

    const resp = await traced.chat.completions.create({
      model: "gpt-4o",
      messages: [],
    });
    expect(resp.model).toBe("gpt-4o");
    await t.shutdown();

    const span = postedSpans(http)[0];
    expect(span.kind).toBe("llm");
    expect(span.model_name).toBe("gpt-4o");
    expect(span.prompt_tokens).toBe(12);
    expect(span.total_tokens).toBe(20);
    expect(span.output).toEqual({ content: "hello" });
  });
});

describe("otelSpanToPayload", () => {
  it("maps gen_ai conventions", () => {
    const payload = otelSpanToPayload({
      name: "chat gpt-4o",
      spanContext: () => ({
        traceId: "0af7651916cd43dd8448eb211c80319c",
        spanId: "b7ad6b7169203331",
      }),
      parentSpanId: "eec04a57399d9a88",
      startTime: [1_700_000_000, 0],
      endTime: [1_700_000_001, 0],
      attributes: {
        "gen_ai.operation.name": "chat",
        "gen_ai.response.model": "gpt-4o-mini",
        "gen_ai.usage.input_tokens": 100,
        "gen_ai.usage.output_tokens": 20,
      },
      status: { code: 1 },
    });

    expect(payload.trace_id).toBe("0af7651916cd43dd8448eb211c80319c");
    expect(payload.parent_span_id).toBe("eec04a57399d9a88");
    expect(payload.kind).toBe("llm");
    expect(payload.model_name).toBe("gpt-4o-mini");
    expect(payload.prompt_tokens).toBe(100);
    expect(payload.total_tokens).toBe(120);
    expect(payload.status).toBe("ok");
    expect(payload.started_at).toBeDefined();
    expect(payload.ended_at).toBeDefined();
  });
});
