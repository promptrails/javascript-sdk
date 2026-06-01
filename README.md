# PromptRails JavaScript/TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@promptrails/sdk.svg)](https://www.npmjs.com/package/@promptrails/sdk)
[![Node.js versions](https://img.shields.io/node/v/@promptrails/sdk.svg)](https://www.npmjs.com/package/@promptrails/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official JavaScript/TypeScript SDK for [PromptRails](https://promptrails.ai) — the AI agent orchestration platform.

Ships as both ESM and CJS. Requires Node.js 18+ (uses native `fetch`).

The SDK has two independent parts:

- **API client** (`@promptrails/sdk`) — manage agents, prompts, executions, and more.
- **Tracing** (`@promptrails/sdk/tracing`) — send spans to PromptRails from any
  code, without managing your prompts/agents on the platform.

## Installation

```bash
npm install @promptrails/sdk
# or
pnpm add @promptrails/sdk
```

## Quick Start

### API client

```typescript
import { PromptRails } from "@promptrails/sdk";

const client = new PromptRails({ apiKey: "pr_key_..." });
const result = await client.agents.execute("agent-id", {
  input: { query: "Summarise this week's sales" },
});
console.log(result.output);
```

See the [API client guide](docs/api-client.md) for resources, error handling,
media studio, and configuration.

### Tracing

```typescript
import { Tracer } from "@promptrails/sdk/tracing";

const tracer = new Tracer({ apiKey: "pr_..." });

await tracer.span("agent-run", { kind: "agent" }, async (root) => {
  root.setInput({ q: "weather?" });
  await tracer.span("llm-call", { kind: "llm" }, async (llm) => {
    llm.setModel("gpt-4o").setUsage(120, 30);
  });
});

await tracer.flush();
```

See the [tracing guide](docs/tracing.md). LangChain, OpenAI, and OpenTelemetry
can be auto-instrumented — see [integrations](docs/integrations.md).

## Documentation

- [API client](docs/api-client.md) — resources, error handling, media studio, configuration
- [Tracing](docs/tracing.md) — spans, decorators, batching, configuration
- [Integrations](docs/integrations.md) — LangChain, OpenAI, OpenTelemetry

## Contributing

```bash
npm ci            # install dependencies
npm run lint      # lint
npm run format    # format
npm run build     # build (ESM + CJS)
npm test          # test
```

## License

MIT
