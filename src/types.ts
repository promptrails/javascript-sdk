export interface Agent {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  labels: string[];
  created_by_id?: string;
  created_at: string;
  updated_at: string;
  current_version?: AgentVersion;
}

export interface AgentVersion {
  id: string;
  agent_id: string;
  version: string;
  config: Record<string, unknown>;
  input_schema: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  is_current: boolean;
  message?: string;
  // Version-scoped model/runtime ownership (API v2).
  model_config?: ModelConfig;
  run_budget?: RunBudget;
  approval_policy?: ApprovalPolicy;
  cache_timeout?: number;
  vfs_enabled?: boolean;
  masking_enabled?: boolean;
  tools: Record<string, unknown>[];
  sub_agents: Record<string, unknown>[];
  guardrails: Record<string, unknown>[];
  created_at: string;
}

export interface Prompt {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  current_version?: PromptVersion;
}

export interface LLMModel {
  id: string;
  provider: string;
  model_id: string;
  display_name: string;
  input_price?: number | null;
  output_price?: number | null;
  cached_input_price?: number | null;
  max_tokens?: number | null;
  supports_vision: boolean;
  supports_tools: boolean;
  supports_json: boolean;
  supports_streaming: boolean;
  supports_temperature: boolean;
  supports_top_p: boolean;
  supports_top_k: boolean;
  supports_reasoning: boolean;
  supports_web_search: boolean;
  supports_prompt_caching: boolean;
  is_active: boolean;
  is_deprecated: boolean;
  deprecated_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AvailableModelEntry {
  id: string;
  model_id: string;
  display_name: string;
  max_tokens?: number | null;
  supports_vision: boolean;
  supports_tools: boolean;
  supports_json: boolean;
  supports_temperature: boolean;
  supports_top_p: boolean;
  supports_top_k: boolean;
  supports_reasoning: boolean;
  supports_web_search: boolean;
  supports_prompt_caching: boolean;
  input_price?: number | null;
  output_price?: number | null;
  is_deprecated: boolean;
}

export interface AvailableModelGroup {
  provider: string;
  models: AvailableModelEntry[];
}

/**
 * A content-only prompt version (API v2). Model, sampling, tools, output
 * schema and cache TTL live on the agent version, not on the prompt — a prompt
 * carries no model configuration.
 */
export interface PromptVersion {
  id: string;
  prompt_id: string;
  version: string;
  system_prompt: string;
  user_prompt: string;
  input_schema: Record<string, unknown>;
  is_current: boolean;
  message?: string;
  config: Record<string, unknown>;
  created_at: string;
}

/**
 * An execution node. API v2 executions form a tree: a sub-agent delegation,
 * handoff continuation or workflow agent-node run has `parent_execution_id`
 * set and appears in its parent's `children`. Root executions have
 * `parent_execution_id` unset. `status` gains `waiting_approval` (parked at an
 * approval-gated tool call) and `cancel_requested` (cooperative cancel
 * observed before finalizing).
 */
export interface AgentExecution {
  id: string;
  agent_id: string;
  agent_version_id: string;
  workspace_id: string;
  user_id: string;
  session_id: string;
  parent_execution_id?: string;
  status: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error: string;
  metadata: Record<string, unknown>;
  token_usage: Record<string, unknown>;
  cost: number;
  duration_ms?: number;
  trace_id?: string;
  approval_expires_at?: string;
  children: AgentExecution[];
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface Credential {
  id: string;
  workspace_id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  masked_content: string;
  is_default: boolean;
  schema_type: string;
  is_valid: boolean;
  has_schema: boolean;
  schema_updated_at?: string;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DataSource {
  id: string;
  workspace_id: string;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface DataSourceVersion {
  id: string;
  data_source_id: string;
  version: string;
  credential_id?: string;
  connection_config: Record<string, unknown>;
  query_template: string;
  parameters: unknown[];
  is_current: boolean;
  message?: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  workspace_id: string;
  agent_id: string;
  user_id: string;
  title: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: string;
  content: string;
  metadata: Record<string, unknown>;
  tool_calls?: Record<string, unknown>;
  tool_results?: Record<string, unknown>;
  model?: string;
  cost?: number;
  token_count?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  created_at: string;
}

/**
 * An observability span (API v2). `token_usage` carries raw provider counts
 * and, when reported, extends beyond prompt/completion/total with
 * `cached_tokens` (prompt-cache read hits), `cache_creation_tokens` and
 * `reasoning_tokens`.
 */
export interface Trace {
  id: string;
  workspace_id: string;
  trace_id: string;
  span_id: string;
  parent_span_id: string;
  name: string;
  kind: string;
  status: string;
  level: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  attributes: Record<string, unknown>;
  tags: string[];
  token_usage?: Record<string, unknown>;
  cost?: number;
  duration_ms?: number;
  completion_start_time?: string;
  error_message: string;
  error_type: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  model_name: string;
  agent_id?: string;
  agent_name: string;
  agent_type: string;
  user_id?: string;
  session_id: string;
  execution_id?: string;
  data_source_id?: string;
  data_source_name: string;
  prompt_name: string;
  mcp_tool_name: string;
  mcp_tool_type: string;
  service_name: string;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

/** Aggregate statistics over a filtered set of traces (`/traces/summary`). */
export interface TraceSummary {
  total_traces: number;
  total_tokens: number;
  total_cost: number;
  avg_duration_ms: number;
  error_count: number;
  unique_models: number;
  unique_sessions: number;
}

export interface MCPTool {
  id: string;
  workspace_id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  schema?: Record<string, unknown>;
  is_active: boolean;
  credential_id?: string;
  template_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MCPTemplateParameterSpec {
  name: string;
  type: string;
  required: boolean;
  secret: boolean;
  description: string;
  default?: string;
}

export interface MCPTemplate {
  id: string;
  slug: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  icon_url?: string;
  config: string;
  required_parameters: MCPTemplateParameterSpec[];
  documentation_url?: string;
  setup_instructions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InstallMCPTemplateRequest {
  name: string;
  parameters: Record<string, string>;
}

export interface Guardrail {
  id: string;
  agent_id: string;
  type: string;
  scanner_type: string;
  action: string;
  config: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * A guardrail attachment spec — the input shape used to create/attach a
 * guardrail on an agent version (a sibling of `config` in
 * `CreateAgentVersionRequest`). `id` is present on responses only; omit it on
 * create.
 */
export interface GuardrailSpec {
  type: "input" | "output";
  scanner_type: string;
  action?: string;
  config?: Record<string, unknown>;
  is_active?: boolean;
  sort_order?: number;
  id?: string;
}

/** Metadata for an available guardrail scanner (`/guardrails/scanners`). */
export interface ScannerMeta {
  type: string;
  label: string;
  description: string;
  category: string;
  enabled: boolean;
  config_fields: string[];
  disabled_reason: string;
}

export interface ExecutionResult {
  output?: Record<string, unknown>;
  error: string;
  trace_id: string;
  execution_id: string;
  status: string;
  token_usage: Record<string, unknown>;
  cost: number;
  duration_ms?: number;
}

// --- Request types ---

export interface CreateAgentRequest {
  name: string;
  type: string;
  description?: string;
  template_id?: string;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
}

// === Agent config (discriminated union by agent type) ===
//
// API v2 has exactly two agent kinds:
//   - `agent`    — a prompt plus optional tools / sub-agents (a supervisor when
//     it has sub-agents). Built with `PromptAgentConfig`.
//   - `workflow` — a deterministic DAG of nodes. Built with
//     `WorkflowAgentConfig`.
//
// Model, sampling, budget, approval policy, cache TTL and tool/sub-agent
// attachments are NOT part of `config` — they are version-scoped fields passed
// alongside it to `createVersion` (see `ModelConfig`, `RunBudget`,
// `ApprovalPolicy`, `ToolAttachment`, `SubAgentAttachment`, `GuardrailSpec`).

export interface WorkflowNode {
  id: string;
  prompt_id?: string;
  depends_on: string[];
  node_type?: "prompt" | "media";
  media_provider?: string;
  media_type?: string;
  media_model?: string;
  media_config?: Record<string, unknown>;
}

/** Config for an `agent` — a single prompt (+ optional tools/sub-agents). */
export interface PromptAgentConfig {
  type: "agent";
  prompt_id: string;
}

/** Config for a `workflow` — a deterministic DAG of nodes. */
export interface WorkflowAgentConfig {
  type: "workflow";
  nodes: WorkflowNode[];
}

export type AgentConfig = PromptAgentConfig | WorkflowAgentConfig;

export type AgentType = AgentConfig["type"];

/** An MCP tool attached to an agent version with per-tool policy. */
export interface ToolAttachment {
  mcp_tool_id: string;
  requires_approval?: boolean;
  no_retry?: boolean;
  sort_order?: number;
}

/** A delegate sub-agent attached to an agent version (agents-as-tools). */
export interface SubAgentAttachment {
  agent_id: string;
  alias: string;
  description?: string;
  mode?: "delegate" | "handoff";
  context_mode?: "task" | "window";
  requires_approval?: boolean;
  sort_order?: number;
}

/**
 * Version-scoped model + sampling ownership. Every field is optional; unset
 * sampling inherits the provider/model default.
 */
export interface ModelConfig {
  model_id?: string;
  fallback_model_id?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
}

/**
 * Bounds the whole execution tree, enforced at the root. Every field is
 * optional.
 */
export interface RunBudget {
  max_cost?: number;
  max_total_tokens?: number;
  max_tool_calls?: number;
  max_children?: number;
  max_depth?: number;
}

/** Who may approve/deny a parked, approval-gated call. */
export interface ApprovalPolicy {
  mode?: "admins" | "assigned" | "any_member";
  member_ids?: string[];
}

export interface CreateAgentVersionRequest {
  version: string;
  config: AgentConfig;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  set_current?: boolean;
  message?: string;
  // Version-scoped runtime ownership (siblings of `config`).
  model_config?: ModelConfig;
  run_budget?: RunBudget;
  approval_policy?: ApprovalPolicy;
  cache_timeout?: number;
  vfs_enabled?: boolean;
  masking_enabled?: boolean;
  tools?: ToolAttachment[];
  sub_agents?: SubAgentAttachment[];
  guardrails?: GuardrailSpec[];
}

// === Streaming events (emitted by the backend over SSE) ===

export type StreamEvent =
  | { type: "execution"; executionId: string; userMessageId?: string }
  | { type: "thinking"; content: string }
  | { type: "tool_start"; id: string; name: string }
  | { type: "tool_end"; id: string; name: string; summary?: string }
  | { type: "content"; content: string }
  | { type: "done"; output?: unknown; tokenUsage?: TokenUsage }
  | { type: "error"; message: string };

export interface TokenUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cached_tokens?: number;
  cache_creation_tokens?: number;
  reasoning_tokens?: number;
}

export interface ExecuteAgentRequest {
  input: Record<string, unknown>;
  session_id?: string;
  version_id?: string;
  sync?: boolean;
}

export interface CreatePromptRequest {
  name: string;
  description?: string;
}

export interface UpdatePromptRequest {
  name?: string;
  description?: string;
}

/**
 * Create a content-only prompt version. Model, sampling, tools, output schema
 * and cache TTL live on the agent version (see `CreateAgentVersionRequest`),
 * not on the prompt.
 */
export interface CreatePromptVersionRequest {
  version: string;
  user_prompt: string;
  system_prompt?: string;
  input_schema?: Record<string, unknown>;
  config?: Record<string, unknown>;
  set_current?: boolean;
  message?: string;
}

export interface CreateCredentialRequest {
  name: string;
  type: string;
  category: string;
  value: string;
  description?: string;
  is_default?: boolean;
  schema_type?: string;
}

export interface UpdateCredentialRequest {
  name?: string;
  value?: string;
}

export interface CreateDataSourceRequest {
  name: string;
  type: string;
}

export interface UpdateDataSourceRequest {
  name?: string;
}

export interface CreateDataSourceVersionRequest {
  version: string;
  credential_id?: string;
  connection_config?: Record<string, unknown>;
  query_template?: string;
  parameters?: unknown[];
  set_current?: boolean;
  message?: string;
}

export interface CreateChatSessionRequest {
  agent_id: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface SendMessageRequest {
  content: string;
}

export interface CreateMCPToolRequest {
  name: string;
  type: string;
  config?: Record<string, unknown>;
  schema?: Record<string, unknown>;
  credential_id?: string;
  template_id?: string;
  status?: string;
}

export interface UpdateMCPToolRequest {
  name?: string;
  type?: string;
  config?: Record<string, unknown>;
  schema?: Record<string, unknown>;
  is_active?: boolean;
  credential_id?: string;
  template_id?: string;
  status?: string;
}

export interface MCPDiscoveredTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface MCPToolCallContent {
  type: string;
  text?: string;
}

export interface MCPDiscoverResult {
  tools: MCPDiscoveredTool[];
  trace_id?: string;
}

export interface MCPCallToolResult {
  content: MCPToolCallContent[];
  is_error: boolean;
  trace_id?: string;
}

export interface CallMCPToolRequest {
  tool_name: string;
  arguments?: Record<string, unknown>;
}

export interface CreateGuardrailRequest {
  type: string;
  scanner_type: string;
  action?: string;
  config?: Record<string, unknown>;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateGuardrailRequest {
  action?: string;
  config?: Record<string, unknown>;
  is_active?: boolean;
}

export interface ListParams {
  page?: number;
  limit?: number;
}

// --- A2A (Agent-to-Agent) ---

export interface A2APart {
  type: string;
  text?: string;
  data?: Record<string, unknown>;
}

export interface A2AMessage {
  role: string;
  parts: A2APart[];
  created_at?: string;
}

export interface A2AArtifact {
  id: string;
  parts: A2APart[];
  created_at?: string;
}

export interface A2ATaskStatus {
  state: string;
  message?: string;
  timestamp?: string;
}

export interface A2ATask {
  id: string;
  context_id?: string;
  status: A2ATaskStatus;
  messages?: A2AMessage[];
  artifacts?: A2AArtifact[];
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface A2AAgentSkill {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
}

export interface A2AAgentCapabilities {
  streaming: boolean;
  push_notifications: boolean;
}

export interface A2AAgentCard {
  name: string;
  description?: string;
  url: string;
  version: string;
  capabilities: A2AAgentCapabilities;
  skills?: A2AAgentSkill[];
}

// Webhook Trigger types
export type AgentTriggerSource =
  | "generic"
  | "slack"
  | "telegram"
  | "whatsapp"
  | "teams"
  | "schedule";

export interface AgentTrigger {
  id: string;
  workspace_id: string;
  agent_id: string;
  name: string;
  token: string;
  token_prefix: string;
  source: AgentTriggerSource;
  source_config: Record<string, unknown>;
  reply_config: Record<string, unknown>;
  is_active: boolean;
  has_secret: boolean;
  last_used_at?: string;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentTriggerCreateResponse extends AgentTrigger {
  secret?: string;
}

export interface CreateAgentTriggerRequest {
  name: string;
  agent_id: string;
  source?: AgentTriggerSource;
  source_config?: Record<string, unknown>;
  reply_config?: Record<string, unknown>;
  generate_secret?: boolean;
}

export interface UpdateAgentTriggerRequest {
  name?: string;
  is_active?: boolean;
  source?: AgentTriggerSource;
  source_config?: Record<string, unknown>;
  reply_config?: Record<string, unknown>;
}

export interface AgentVFSFile {
  id: string;
  workspace_id: string;
  agent_id: string;
  path: string;
  parent_path: string;
  name: string;
  is_dir: boolean;
  content?: string;
  size_bytes: number;
  mime_type?: string;
  metadata?: Record<string, unknown>;
  last_writer_kind: "agent" | "user" | "trigger";
  created_at: string;
  updated_at: string;
}

export interface AgentVFSGrepMatch {
  path: string;
  line_number: number;
  line: string;
}

export interface AgentVFSReadResult {
  file: AgentVFSFile;
  content: string;
  total_lines: number;
  truncated: boolean;
}

export type AgentVFSWriteMode = "overwrite" | "append";

// --- Assets ---

export interface Asset {
  id: string;
  workspace_id: string;
  type: string;
  provider: string;
  model?: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  storage_path: string;
  prompt?: string;
  config?: Record<string, unknown>;
  execution_id?: string;
  agent_id?: string;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetSignedUrl {
  url: string;
  expires_at: string;
}
