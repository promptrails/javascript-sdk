# API Client

The `PromptRails` client wraps the PromptRails REST API for managing agents,
prompts, executions, media, and more.

```typescript
import { PromptRails } from "@promptrails/sdk";

const client = new PromptRails({ apiKey: "pr_key_..." });
const result = await client.agents.execute("agent-id", {
  input: { query: "Summarise this week's sales" },
});
console.log(result.output);
```

## Error handling

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

## Available resources

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
| `client.agentTriggers`   | `list`, `get`, `create` (with `source` + `source_config`), `update`, `delete` |
| `client.agentVfs`        | `list`, `read`, `write`, `stat`, `mkdir`, `move`, `copy`, `delete`, `grep`, `glob`, `usage` |
| `client.mediaModels`     | `list`                                                                   |
| `client.media`           | `generate`                                                               |
| `client.assets`          | `list`, `get`, `delete`, `getSignedUrl`                                  |
| `client.a2a`             | `getAgentCard`, `sendMessage`, `getTask`, `listTasks`, `cancelTask`      |

## Media Studio

Generate images, speech, and video using various AI providers.

```typescript
// Generate an image
const result = await client.media.generate({
  provider: "fal",
  media_type: "image",
  model: "fal-ai/flux/schnell",
  prompt: "A futuristic cityscape at sunset",
  config: { width: 1024, height: 1024 },
});
console.log(result.asset_id, result.url);

// Generate speech
const speech = await client.media.generate({
  provider: "elevenlabs",
  media_type: "speech",
  model: "eleven_multilingual_v2",
  prompt: "Hello, welcome to PromptRails!",
});

// List available media models
const models = await client.mediaModels.list({ provider: "fal", media_type: "image" });

// Browse and manage assets
const assets = await client.assets.list({ type: "image", page: 1, limit: 10 });
const { url } = await client.assets.getSignedUrl("asset-id");
await client.assets.delete("asset-id");
```

## Configuration

| Option       | Default                      | Description                       |
| ------------ | ---------------------------- | --------------------------------- |
| `apiKey`     | required                     | API key                           |
| `baseUrl`    | `https://api.promptrails.ai` | API base URL                      |
| `timeout`    | `30000`                      | Request timeout (ms)              |
| `maxRetries` | `3`                          | Max retries on network/5xx errors |
