import { HTTPClient } from "../src/http";
import { AgentTriggersResource } from "../src/resources/agentTriggers";
import { ApprovalsResource } from "../src/resources/approvals";
import { ChatResource } from "../src/resources/chat";
import { DashboardResource } from "../src/resources/dashboard";
import { GuardrailsResource } from "../src/resources/guardrails";
import { LLMModelsResource } from "../src/resources/llm-models";
import { MCPTemplatesResource } from "../src/resources/mcpTemplates";
import { MediaResource } from "../src/resources/media";
import { SessionsResource } from "../src/resources/sessions";
import { TemplatesResource } from "../src/resources/templates";
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
  meta: { total: 1, page: 1, limit: 20, total_pages: 1 },
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

  it("deleteSession deletes the session", async () => {
    http.delete.mockResolvedValue({});
    await chat.deleteSession("s1");
    expect(http.delete).toHaveBeenCalledWith("/api/v1/chat/sessions/s1");
  });
});

describe("SessionsResource", () => {
  it("list and get hit the sessions endpoints", async () => {
    const http = makeMock();
    const sessions = new SessionsResource(http);

    http.get.mockResolvedValue(listBody);
    await sessions.list();
    expect(http.get).toHaveBeenCalledWith(
      "/api/v1/sessions",
      expect.any(Object),
    );

    http.get.mockResolvedValue({ data: { id: "s1" } });
    await sessions.get("s1");
    expect(http.get).toHaveBeenCalledWith("/api/v1/sessions/s1");
  });
});

describe("TemplatesResource", () => {
  it("list and get hit the templates endpoints", async () => {
    const http = makeMock();
    const templates = new TemplatesResource(http);

    http.get.mockResolvedValue(listBody);
    await templates.list();
    expect(http.get).toHaveBeenCalledWith(
      "/api/v1/templates",
      expect.any(Object),
    );

    http.get.mockResolvedValue({ data: { id: "t1" } });
    await templates.get("t1");
    expect(http.get).toHaveBeenCalledWith("/api/v1/templates/t1");
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

describe("MediaResource", () => {
  it("generate posts to the media endpoint", async () => {
    const http = makeMock();
    const media = new MediaResource(http);
    http.post.mockResolvedValue({ data: { job_id: "j1" } });
    await media.generate({ type: "tts" } as never);
    expect(http.post.mock.calls[0][0]).toContain("/api/v1/media");
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

describe("ApprovalsResource", () => {
  let http: ReturnType<typeof makeMock>;
  let approvals: ApprovalsResource;
  beforeEach(() => {
    http = makeMock();
    approvals = new ApprovalsResource(http);
  });

  it("list and get hit the approvals endpoints", async () => {
    http.get.mockResolvedValue(listBody);
    await approvals.list();
    expect(http.get).toHaveBeenCalledWith(
      "/api/v1/approvals",
      expect.any(Object),
    );

    http.get.mockResolvedValue({ data: { id: "ap1" } });
    await approvals.get("ap1");
    expect(http.get).toHaveBeenCalledWith("/api/v1/approvals/ap1");
  });

  it("decide posts to the decide endpoint", async () => {
    http.post.mockResolvedValue({ data: { id: "ap1" } });
    await approvals.decide("ap1", { decision: "approve" } as never);
    expect(http.post).toHaveBeenCalledWith(
      "/api/v1/approvals/ap1/decide",
      expect.any(Object),
    );
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

describe("DashboardResource", () => {
  it("getMetrics hits the metrics endpoint", async () => {
    const http = makeMock();
    const dashboard = new DashboardResource(http);
    http.get.mockResolvedValue({ data: { total: 1 } });
    await dashboard.getMetrics({ days: 7 });
    expect(http.get).toHaveBeenCalledWith(
      "/api/v1/dashboard/metrics",
      expect.any(Object),
    );
  });
});
