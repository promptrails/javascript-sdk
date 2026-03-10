import { ClientOptions, resolveConfig } from "./config";
import { HTTPClient } from "./http";
import {
  AgentsResource,
  PromptsResource,
  ExecutionsResource,
  CredentialsResource,
  DataSourcesResource,
  ChatResource,
  MemoriesResource,
  TracesResource,
  CostsResource,
  MCPToolsResource,
  MCPTemplatesResource,
  GuardrailsResource,
  ApprovalsResource,
  TemplatesResource,
  ScoresResource,
  DashboardResource,
  SessionsResource,
  A2AResource,
  LLMModelsResource,
  WebhookTriggersResource,
} from "./resources";

export class PromptRails {
  public readonly agents: AgentsResource;
  public readonly prompts: PromptsResource;
  public readonly executions: ExecutionsResource;
  public readonly credentials: CredentialsResource;
  public readonly dataSources: DataSourcesResource;
  public readonly chat: ChatResource;
  public readonly memories: MemoriesResource;
  public readonly traces: TracesResource;
  public readonly costs: CostsResource;
  public readonly mcpTools: MCPToolsResource;
  public readonly mcpTemplates: MCPTemplatesResource;
  public readonly guardrails: GuardrailsResource;
  public readonly approvals: ApprovalsResource;
  public readonly templates: TemplatesResource;
  public readonly scores: ScoresResource;
  public readonly dashboard: DashboardResource;
  public readonly sessions: SessionsResource;
  public readonly a2a: A2AResource;
  public readonly llmModels: LLMModelsResource;
  public readonly webhookTriggers: WebhookTriggersResource;

  constructor(options: ClientOptions) {
    const config = resolveConfig(options);
    const http = new HTTPClient(config);

    this.agents = new AgentsResource(http);
    this.prompts = new PromptsResource(http);
    this.executions = new ExecutionsResource(http);
    this.credentials = new CredentialsResource(http);
    this.dataSources = new DataSourcesResource(http);
    this.chat = new ChatResource(http);
    this.memories = new MemoriesResource(http);
    this.traces = new TracesResource(http);
    this.costs = new CostsResource(http);
    this.mcpTools = new MCPToolsResource(http);
    this.mcpTemplates = new MCPTemplatesResource(http);
    this.guardrails = new GuardrailsResource(http);
    this.approvals = new ApprovalsResource(http);
    this.templates = new TemplatesResource(http);
    this.scores = new ScoresResource(http);
    this.dashboard = new DashboardResource(http);
    this.sessions = new SessionsResource(http);
    this.a2a = new A2AResource(http);
    this.llmModels = new LLMModelsResource(http);
    this.webhookTriggers = new WebhookTriggersResource(http);
  }
}
