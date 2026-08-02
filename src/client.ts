import { type ClientOptions, resolveConfig } from "./config";
import { HTTPClient } from "./http";
import {
  A2AResource,
  AgentsResource,
  AgentTriggersResource,
  AgentVFSResource,
  AssetsResource,
  ChatResource,
  CredentialsResource,
  DataSourcesResource,
  ExecutionsResource,
  GuardrailsResource,
  LLMModelsResource,
  MCPTemplatesResource,
  MCPToolsResource,
  PromptsResource,
  TracesResource,
} from "./resources";

export class PromptRails {
  public readonly agents: AgentsResource;
  public readonly prompts: PromptsResource;
  public readonly executions: ExecutionsResource;
  public readonly credentials: CredentialsResource;
  public readonly dataSources: DataSourcesResource;
  public readonly chat: ChatResource;
  public readonly traces: TracesResource;
  public readonly mcpTools: MCPToolsResource;
  public readonly mcpTemplates: MCPTemplatesResource;
  public readonly guardrails: GuardrailsResource;
  public readonly a2a: A2AResource;
  public readonly llmModels: LLMModelsResource;
  public readonly agentTriggers: AgentTriggersResource;
  public readonly agentVfs: AgentVFSResource;
  public readonly assets: AssetsResource;

  constructor(options: ClientOptions) {
    const config = resolveConfig(options);
    const http = new HTTPClient(config);

    this.agents = new AgentsResource(http);
    this.prompts = new PromptsResource(http);
    this.executions = new ExecutionsResource(http);
    this.credentials = new CredentialsResource(http);
    this.dataSources = new DataSourcesResource(http);
    this.chat = new ChatResource(http);
    this.traces = new TracesResource(http);
    this.mcpTools = new MCPToolsResource(http);
    this.mcpTemplates = new MCPTemplatesResource(http);
    this.guardrails = new GuardrailsResource(http);
    this.a2a = new A2AResource(http);
    this.llmModels = new LLMModelsResource(http);
    this.agentTriggers = new AgentTriggersResource(http);
    this.agentVfs = new AgentVFSResource(http);
    this.assets = new AssetsResource(http);
  }
}
