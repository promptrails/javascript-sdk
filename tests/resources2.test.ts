import type { HTTPClient } from "../src/http";
import { AgentTriggersResource } from "../src/resources/agentTriggers";
import { ChatResource } from "../src/resources/chat";
import { GuardrailsResource } from "../src/resources/guardrails";
import { LLMModelsResource } from "../src/resources/llm-models";
import { MCPTemplatesResource } from "../src/resources/mcpTemplates";
import { TracesResource } from "../src/resources/traces";

function makeMock() {
  const http = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    request: jest.fn(),
  };
  return http as unknown as HTTPClient & typeof http;
}

const listBody = {
  data: [{ id: "x1" }],
  meta: { total: 1, page: 1, limit: 20, pages: 1 },
};

describe("ChatResource", () => {
  let http: ReturnType<typeof makeMock>;
  let chat: ChatResource;
  beforeEach(() => {
    http = makeMock();
    chat = new ChatResource(http);
  });

  it("listSessions hits the sessions endpoint", async () => {
    http.get.mockResolvedValue(listBody);
    await chat.listSessions();
    expect(http.get).toHaveBeenCalledWith(
      "/api/v1/chat/sessions",
      expect.any(Object),
    );
  });

  it("createSession posts a session", async () => {
    http.post.mockResolvedValue({ data: { id: "s1" } });
    await chat.createSession({ agent_id: "a1" } as never);
    expect(http.post).toHaveBeenCalledWith(
      "/api/v1/chat/sessions",
      expect.any(Object),
    );
  });

  it("sendMessage posts to the messages endpoint", async () => {
    http.post.mockResolvedValue({ data: { id: "m1" } });
    await chat.sendMessage("s1", { content: "hi" } as never);
    expect(http.post).toHaveBeenCalledWith(
      "/api/v1/chat/sessions/s1/messages",
      expect.any(Object),
    );
  });

  it("submitFeedback posts a typed score to the session", async () => {
    http.post.mockResolvedValue({ data: { submitted: true } });

    const result = await chat.submitFeedback("s1", {
      execution_id: "exec1",
      value: 1,
    });

    expect(http.post).toHaveBeenCalledWith(
      "/api/v1/chat/sessions/s1/feedback",
      { execution_id: "exec1", value: 1 },
    );
    expect(result).toEqual({ submitted: true });
  });

  it("deleteSession deletes the session", async () => {
    http.delete.mockResolvedValue({});
    await chat.deleteSession("s1");
    expect(http.delete).toHaveBeenCalledWith("/api/v1/chat/sessions/s1");
  });
});

describe("MCPTemplatesResource", () => {
  let http: ReturnType<typeof makeMock>;
  let tpl: MCPTemplatesResource;
  beforeEach(() => {
    http = makeMock();
    tpl = new MCPTemplatesResource(http);
  });

  it("getBySlug hits the slug endpoint", async () => {
    http.get.mockResolvedValue({ data: { id: "m1" } });
    await tpl.getBySlug("github");
    expect(http.get).toHaveBeenCalledWith("/api/v1/mcp-templates/slug/github");
  });

  it("install posts to the slug install endpoint", async () => {
    http.post.mockResolvedValue({ data: { id: "tool1" } });
    await tpl.install("github", {} as never);
    expect(http.post).toHaveBeenCalledWith(
      "/api/v1/mcp-templates/slug/github/install",
      expect.any(Object),
    );
  });
});

describe("GuardrailsResource", () => {
  it("update and delete hit the guardrails endpoints", async () => {
    const http = makeMock();
    const guardrails = new GuardrailsResource(http);

    http.patch.mockResolvedValue({ data: { id: "g1" } });
    await guardrails.update("g1", {} as never);
    expect(http.patch).toHaveBeenCalledWith(
      "/api/v1/guardrails/g1",
      expect.any(Object),
    );

    http.delete.mockResolvedValue({});
    await guardrails.delete("g1");
    expect(http.delete).toHaveBeenCalledWith("/api/v1/guardrails/g1");
  });
});

describe("LLMModelsResource", () => {
  it("list and listAvailable hit the llm-models endpoints", async () => {
    const http = makeMock();
    const models = new LLMModelsResource(http);

    http.get.mockResolvedValue(listBody);
    await models.list();
    expect(http.get).toHaveBeenCalledWith(
      "/api/v1/llm-models",
      expect.any(Object),
    );

    http.get.mockResolvedValue({ data: { groups: [] } });
    await models.listAvailable();
    expect(http.get).toHaveBeenCalledWith("/api/v1/llm-models/available");
  });
});

describe("TracesResource", () => {
  it("list and getByTraceId hit the traces endpoints", async () => {
    const http = makeMock();
    const traces = new TracesResource(http);

    http.get.mockResolvedValue(listBody);
    await traces.list();
    expect(http.get).toHaveBeenCalledWith("/api/v1/traces", expect.any(Object));

    http.get.mockResolvedValue({ data: [{ id: "tr1" }] });
    await traces.getByTraceId("tr1");
    expect(http.get).toHaveBeenCalledWith("/api/v1/traces/tr1");
  });
});

describe("AgentTriggersResource", () => {
  let http: ReturnType<typeof makeMock>;
  let triggers: AgentTriggersResource;
  beforeEach(() => {
    http = makeMock();
    triggers = new AgentTriggersResource(http);
  });

  it("CRUD hits the triggers endpoints", async () => {
    http.get.mockResolvedValue(listBody);
    await triggers.list();
    expect(http.get).toHaveBeenCalledWith(
      "/api/v1/triggers",
      expect.any(Object),
    );

    http.post.mockResolvedValue({ data: { id: "t1" } });
    await triggers.create({} as never);
    expect(http.post).toHaveBeenCalledWith(
      "/api/v1/triggers",
      expect.any(Object),
    );

    http.patch.mockResolvedValue({ data: { id: "t1" } });
    await triggers.update("t1", {} as never);
    expect(http.patch).toHaveBeenCalledWith(
      "/api/v1/triggers/t1",
      expect.any(Object),
    );

    http.delete.mockResolvedValue({});
    await triggers.delete("t1");
    expect(http.delete).toHaveBeenCalledWith("/api/v1/triggers/t1");
  });
});
