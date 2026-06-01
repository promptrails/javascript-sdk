# Tracing integrations

Auto-instrument popular frameworks so their calls become PromptRails spans. Each
integration is a separate import and only assumes you've installed that
framework.

## LangChain

A callback handler that turns LangChain runs (chains, LLMs, tools, retrievers)
into a span tree. It implements LangChain's `CallbackHandlerMethods`, so pass it
via `callbacks`:

```typescript
import { Tracer } from "@promptrails/sdk/tracing";
import { PromptRailsCallbackHandler } from "@promptrails/sdk/tracing/integrations/langchain";

const tracer = new Tracer({ apiKey: "pr_..." });
const handler = new PromptRailsCallbackHandler(tracer);

await chain.invoke({ question: "What's the weather?" }, { callbacks: [handler] });
await tracer.flush();
```

The tree is built from LangChain's `runId`/`parentRunId`, so it is correct under
concurrent runs. Token usage and model are read on `handleLLMEnd`.

## OpenAI / Anthropic

Wrap an OpenAI-compatible client so every `chat.completions.create` call emits an
`llm` span with model, token usage, latency, and output:

```typescript
import OpenAI from "openai";
import { Tracer } from "@promptrails/sdk/tracing";
import { traceOpenAI } from "@promptrails/sdk/tracing/integrations/openai";

const tracer = new Tracer({ apiKey: "pr_..." });
const client = traceOpenAI(new OpenAI(), tracer);

await client.chat.completions.create({ model: "gpt-4o", messages: [...] });
```

The wrapper is duck-typed, so it also works with any API-compatible client.

## OpenTelemetry

Already using OpenTelemetry? Register the PromptRails exporter and your existing
spans flow in — `gen_ai.*` semantic-convention attributes are mapped onto the
span model:

```typescript
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { PromptRailsSpanExporter } from "@promptrails/sdk/tracing/integrations/otel";

provider.addSpanProcessor(
  new BatchSpanProcessor(new PromptRailsSpanExporter({ apiKey: "pr_..." })),
);
```
