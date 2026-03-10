# PromptRails JavaScript/TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@promptrails/sdk.svg)](https://www.npmjs.com/package/@promptrails/sdk)
[![Node.js versions](https://img.shields.io/node/v/@promptrails/sdk.svg)](https://www.npmjs.com/package/@promptrails/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official JavaScript/TypeScript SDK for [PromptRails](https://promptrails.ai) — the AI agent orchestration platform.

Ships as both ESM and CJS. Requires Node.js 18+ (uses native `fetch`).

## Installation

```bash
npm install @promptrails/sdk
# or
pnpm add @promptrails/sdk
```

## Quick Start

```typescript
import { PromptRails } from "@promptrails/sdk";

const client = new PromptRails({ apiKey: "pr_key_..." });

// Execute an agent
const result = await client.agents.execute("agent-id", {
  input: { query: "Summarise this week's sales" },
});
console.log(result.output);
```

## Error Handling

```typescript
import {
  NotFoundError,
  ValidationError,
  RateLimitError,
  QuotaExceededError,
} from "@promptrails/sdk";

try {
  const result = await client.agents.execute("agent-id", { input: {} });
} catch (e) {
  if (e instanceof QuotaExceededError) {
    console.log("Execution limit reached — upgrade your plan");
  } else if (e instanceof RateLimitError) {
    console.log("Too many requests");
  } else if (e instanceof NotFoundError) {
    console.log(`Not found: ${e.message}`);
  }
}
```

## Available Resources

| Resource                 | Methods                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| `client.agents`          | `list`, `get`, `create`, `update`, `delete`, `execute`, `listVersions`, `createVersion`, `listGuardrails`, `createGuardrail`, `listMemories`, `createMemory`, `searchMemories`, `deleteAllMemories` |
| `client.prompts`         | `list`, `get`, `create`, `update`, `delete`, `listVersions`, `createVersion` |
| `client.executions`      | `list`, `get`                                                            |
| `client.credentials`     | `list`, `get`, `create`, `update`, `delete`, `setDefault`, `checkConnection` |
| `client.dataSources`     | `list`, `get`, `create`, `update`, `delete`, `listVersions`, `createVersion`, `testConnection`, `query` |
| `client.chat`            | `listSessions`, `getSession`, `createSession`, `deleteSession`, `listMessages`, `sendMessage` |
| `client.traces`          | `list`, `getByTraceId`                                                   |
| `client.costs`           | `getSummary`, `getAgentSummary`                                          |
| `client.scores`          | `list`, `get`, `create`, `update`, `delete`, `listConfigs`, `getConfig`, `createConfig`, `updateConfig`, `deleteConfig`, `aggregates` |
| `client.mcpTools`        | `list`, `get`, `create`, `update`, `delete`                              |
| `client.approvals`       | `list`, `get`, `decide`                                                  |
| `client.webhookTriggers` | `list`, `get`, `create`, `update`, `delete`                              |
| `client.a2a`             | `getAgentCard`, `sendMessage`, `getTask`, `listTasks`, `cancelTask`      |

## Configuration

| Option       | Default                      | Description                       |
| ------------ | ---------------------------- | --------------------------------- |
| `apiKey`     | required                     | API key                           |
| `baseUrl`    | `https://api.promptrails.ai` | API base URL                      |
| `timeout`    | `30000`                      | Request timeout (ms)              |
| `maxRetries` | `3`                          | Max retries on network/5xx errors |

## Contributing

```bash
# Install dependencies
npm ci

# Lint
npm run lint

# Format
npm run format

# Build
npm run build

# Test
npm test
```

## License

MIT
