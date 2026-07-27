# API Client

The `PromptRails` client wraps the PromptRails REST API for managing agents,
prompts, executions, traces, and more.

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
| `client.agents`          | `list`, `get`, `create`, `update`, `delete`, `execute`, `listVersions`, `createVersion`, `promoteVersion`, `preview`, `playground`, `listGuardrails`, `createGuardrail` |
| `client.prompts`         | `list`, `get`, `create`, `update`, `delete`, `listVersions`, `createVersion`, `promoteVersion`, `preview` |
| `client.executions`      | `list`, `get`, `tree`, `cancel`, `approvalInbox`, `approve`, `deny`, `stream` |
| `client.credentials`     | `list`, `get`, `create`, `update`, `delete`, `setDefault`, `checkConnection` |
| `client.dataSources`     | `list`, `get`, `create`, `update`, `delete`, `listVersions`, `createVersion`, `testConnection`, `query` |
| `client.chat`            | `listSessions`, `getSession`, `createSession`, `deleteSession`, `listMessages`, `sendMessage` |
| `client.traces`          | `list`, `getByTraceId`, `getSummary`, `piiReport`, `ingest`             |
| `client.mcpTools`        | `list`, `get`, `create`, `update`, `delete`                              |
| `client.mcpTemplates`    | `list`, `get`, `getBySlug`, `install`                                    |
| `client.guardrails`      | `listScanners`, `update`, `delete`                                       |
| `client.llmModels`       | `list`, `listAvailable`                                                  |
| `client.agentTriggers`   | `list`, `get`, `create` (with `source` + `source_config`), `update`, `delete` |
| `client.agentVfs`        | `list`, `read`, `write`, `stat`, `mkdir`, `move`, `copy`, `delete`, `grep`, `glob`, `usage` |
| `client.assets`          | `list`, `get`, `delete`, `getSignedUrl`                                  |
| `client.a2a`             | `getAgentCard`, `sendMessage`, `getTask`, `listTasks`, `cancelTask`      |

## Agents (API v2)

An agent's `type` is one of `agent` (a prompt plus optional tools / sub-agents)
or `workflow` (a deterministic DAG of nodes). Model, sampling, run budget,
approval policy, cache TTL and tool / sub-agent / guardrail attachments are
version-scoped fields passed alongside `config` to `createVersion`:

```typescript
const agent = await client.agents.create({ name: "Support", type: "agent" });

await client.agents.createVersion(agent.id, {
  version: "1.0.0",
  config: { type: "agent", prompt_id: "prompt-id" },
  set_current: true,
  model_config: { model_id: "gpt-4o", temperature: 0.2 },
  run_budget: { max_cost: 1.0, max_tool_calls: 20 },
  tools: [{ mcp_tool_id: "tool-id", requires_approval: true }],
  guardrails: [{ type: "input", scanner_type: "pii" }],
});
```

## Human-in-the-loop approvals

Executions parked at `waiting_approval` are resumed from the approval inbox:

```typescript
const inbox = await client.executions.approvalInbox();
for (const exec of inbox.data) {
  await client.executions.approve(exec.id, { reason: "looks good" });
  // or: await client.executions.deny(exec.id, { reason: "denied" });
}

// Inspect an execution tree (sub-agent delegations, handoffs, workflow nodes)
const tree = await client.executions.tree("execution-id");

// Cooperatively cancel a running execution
await client.executions.cancel("execution-id");
```

## Assets

```typescript
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
