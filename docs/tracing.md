# Tracing

Send spans to PromptRails from any code — you do **not** need to manage your
prompts or agents on the platform. This makes PromptRails usable as a standalone
LLM observability backend for the OpenAI SDK, LangChain, OpenTelemetry, or your
own code.

The tracing entry point is a separate import (`@promptrails/sdk/tracing`) and is
independent of the API client. All you need is an API key with the
`traces:write` scope.

> Already using LangChain, the OpenAI SDK, or OpenTelemetry? See
> [integrations](integrations.md) for auto-instrumentation instead of manual spans.

## Quick start

```typescript
import { Tracer } from "@promptrails/sdk/tracing";

const tracer = new Tracer({ apiKey: "pr_..." });

await tracer.span("agent-run", { kind: "agent" }, async (root) => {
  root.setInput({ q: "What's the weather in Istanbul?" });

  await tracer.span("llm-call", { kind: "llm" }, async (llm) => {
    llm.setModel("gpt-4o").setUsage(120, 30);
    llm.setOutput({ text: "18°C and rainy." });
  });
});

await tracer.flush(); // also flushes in the background and before exit (Node)
```

Spans created inside a `span()` block automatically share the same `trace_id`
and link to their parent, so the tree renders correctly in the trace viewer.

## Span data

Every `set*` method returns the span, so calls chain:

```typescript
await tracer.span("retrieve", { kind: "datasource" }, (span) => {
  span.setInput({ query: "weather istanbul" });
  span.setOutput({ rows: 3 });
  span.setAttributes({ index: "weather", cacheHit: false });
  span.setTags("prod", "search");
  span.setSession("session-abc");
});
```

For LLM spans:

```typescript
span.setModel("gpt-4o");
span.setUsage(120, 30); // (promptTokens, completionTokens) — total is computed
span.setCost(0.0023);
```

Errors thrown inside a `span()` block are captured automatically — the span is
marked `error` and the error re-thrown.

## Wrapping a function

```typescript
const search = tracer.traced(async (query: string) => {
  /* ... */
}, { name: "search", kind: "tool" });
```

## Manual spans

When a callback block doesn't fit, create and end spans yourself. Parent/trace
linkage is inherited from the active span (pass `parent` for concurrent spans):

```typescript
const span = tracer.startSpan("step", { kind: "agent_step" });
try {
  /* ... */
} finally {
  span.end();
}
```

## Span kinds

`kind` accepts any PromptRails span kind: `agent`, `llm`, `tool`, `datasource`,
`prompt`, `guardrail`, `chain`, `workflow`, `agent_step`, `mcp_call`,
`preprocessing`, `postprocessing`, `memory`, `embedding`, `speech`, `image`,
`video`, `storage`.

## Lifecycle & flushing

Spans are buffered and shipped in batches:

- every `flushIntervalMs` (default `1000`),
- immediately once the buffer reaches `maxBatchSize` (default `100`),
- in Node, on `beforeExit`.

Export is best-effort: network failures are logged and dropped, never thrown
into your code. `await tracer.flush()` blocks until the buffer is sent;
`await tracer.shutdown()` flushes and stops the timer (use it in short-lived
scripts or serverless handlers).

## Configuration

```typescript
new Tracer({
  apiKey: "pr_...",
  baseUrl: "https://api.promptrails.ai",
  maxBatchSize: 100,
  flushIntervalMs: 1000,
});
```

To reuse an existing API client's HTTP layer, pass `{ http }` instead of an
`apiKey`. Each span is POSTed to `POST /api/v1/traces/ingest`; the workspace
comes from the API key and the `source` attribute is set to `sdk`.
