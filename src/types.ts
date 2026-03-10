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
  max_tokens?: number | null;
  supports_vision: boolean;
  supports_tools: boolean;
  supports_json: boolean;
  supports_streaming: boolean;
  is_active: boolean;
}

export interface AvailableModelEntry {
  id: string;
  model_id: string;
  display_name: string;
  max_tokens?: number | null;
  supports_vision: boolean;
  supports_tools: boolean;
  supports_json: boolean;
  input_price?: number | null;
  output_price?: number | null;
}

export interface AvailableModelGroup {
  provider: string;
  models: AvailableModelEntry[];
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version: string;
  system_prompt: string;
  user_prompt: string;
  llm_model_id?: string;
  fallback_llm_model_id?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  input_schema: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  is_current: boolean;
  message?: string;
  config: Record<string, unknown>;
  created_at: string;
  llm_model?: LLMModel;
  fallback_llm_model?: LLMModel;
}

export interface AgentExecution {
  id: string;
  agent_id: string;
  agent_version_id: string;
  workspace_id: string;
  user_id: string;
  session_id: string;
  status: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error: string;
  metadata: Record<string, unknown>;
  token_usage: Record<string, unknown>;
  cost: number;
  duration_ms?: number;
  trace_id?: string;
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

export interface AgentMemory {
  id: string;
  workspace_id: string;
  agent_id: string;
  content: string;
  metadata?: Record<string, unknown>;
  memory_type: string;
  importance: number;
  access_count: number;
  last_accessed_at?: string;
  chat_session_id?: string;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Trace {
  id: string;
  workspace_id: string;
  trace_id: string;
  span_id: string;
  parent_span_id: string;
  name: string;
  kind: string;
  status: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  attributes: Record<string, unknown>;
  token_usage?: Record<string, unknown>;
  cost?: number;
  duration_ms?: number;
  error_message: string;
  error_type: string;
  error_stack: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  agent_id?: string;
  prompt_id?: string;
  llm_model_id?: string;
  user_id?: string;
  session_id: string;
  execution_id?: string;
  service_name: string;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface CostSummary {
  total_cost: number;
  total_executions: number;
  total_tokens: number;
  daily_costs: Record<string, unknown>[];
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

export interface FlowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  agent_type: string;
  complexity: string;
  tags: string[];
  icon: string;
  node_count: number;
  flow_config: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRequest {
  id: string;
  execution_id: string;
  workspace_id: string;
  agent_id?: string;
  checkpoint_name: string;
  payload: Record<string, unknown>;
  status: string;
  reason?: string;
  decided_by?: string;
  decided_at?: string;
  created_at: string;
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

export interface CreateAgentVersionRequest {
  version: string;
  config?: Record<string, unknown>;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  set_current?: boolean;
  message?: string;
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

export interface CreatePromptVersionRequest {
  version: string;
  user_prompt: string;
  system_prompt?: string;
  llm_model_id?: string;
  fallback_llm_model_id?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
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

export interface CreateMemoryRequest {
  content: string;
  memory_type: string;
  importance?: number;
  metadata?: Record<string, unknown>;
  chat_session_id?: string;
}

export interface SearchMemoryRequest {
  query: string;
  threshold?: number;
  limit?: number;
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
}

export interface UpdateGuardrailRequest {
  action?: string;
  config?: Record<string, unknown>;
  is_active?: boolean;
}

export interface DecideApprovalRequest {
  decision: "approved" | "rejected";
  reason?: string;
}

export interface ListParams {
  page?: number;
  limit?: number;
}

export interface RunPromptRequest {
  system_prompt?: string;
  user_prompt: string;
  llm_model_id: string;
  fallback_llm_model_id?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  input?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  tools?: string[];
  initial_messages?: Array<{ role: string; content: string }>;
  credential_id?: string;
}

export interface RunPromptResponse {
  content: string;
  token_usage: Record<string, number>;
  cost: number;
  duration_ms: number;
  model: string;
}

// --- Score ---

export interface Score {
  id: string;
  workspace_id: string;
  trace_id: string;
  span_id: string;
  name: string;
  value?: number;
  string_value: string;
  data_type: string;
  source: string;
  config_id?: string;
  comment: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreConfig {
  id: string;
  workspace_id: string;
  name: string;
  data_type: string;
  min_value?: number;
  max_value?: number;
  categories: Record<string, unknown>[];
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScoreAggregate {
  name: string;
  count: number;
  avg: number;
  min: number;
  max: number;
}

export interface CreateScoreRequest {
  trace_id: string;
  name: string;
  value?: number;
  string_value?: string;
  data_type?: string;
  source?: string;
  span_id?: string;
  config_id?: string;
  comment?: string;
}

export interface UpdateScoreRequest {
  value?: number;
  string_value?: string;
  comment?: string;
}

export interface CreateScoreConfigRequest {
  name: string;
  data_type?: string;
  min_value?: number;
  max_value?: number;
  categories?: Record<string, unknown>[];
  description?: string;
}

export interface UpdateScoreConfigRequest {
  name?: string;
  description?: string;
  min_value?: number;
  max_value?: number;
  is_active?: boolean;
}

// --- Dashboard ---

export interface DashboardMetrics {
  overview: {
    total_executions: number;
    total_cost: number;
    total_tokens: number;
    total_agents: number;
    error_count: number;
    avg_duration_ms: number;
  };
  executions_by_day: { date: string; count: number }[];
  cost_by_day: { date: string; cost: number }[];
  agent_usage: { agent_id: string; agent_name: string; executions: number; total_cost: number }[];
  model_usage: { model_name: string; count: number; total_cost: number; total_tokens: number }[];
  error_rate: { date: string; total: number; errors: number; error_rate: number }[];
  score_trends: { date: string; name: string; average: number; count: number }[];
}

// --- Session & User ---

export interface SessionSummary {
  session_id: string;
  trace_count: number;
  total_tokens: number;
  total_cost: number;
  error_count: number;
  first_seen: string;
  last_seen: string;
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
export interface WebhookTrigger {
  id: string;
  workspace_id: string;
  agent_id: string;
  name: string;
  token: string;
  token_prefix: string;
  is_active: boolean;
  has_secret: boolean;
  last_used_at?: string;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookTriggerCreateResponse extends WebhookTrigger {
  secret?: string;
}

export interface CreateWebhookTriggerRequest {
  name: string;
  agent_id: string;
  generate_secret?: boolean;
}

export interface UpdateWebhookTriggerRequest {
  name?: string;
  is_active?: boolean;
}
