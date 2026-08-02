import type { HTTPClient } from "../src/http";
import { AgentsResource } from "../src/resources/agents";

// Mock the HTTPClient
const mockHttp = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  request: jest.fn(),
} as unknown as HTTPClient;

describe("AgentsResource", () => {
  let agents: AgentsResource;

  beforeEach(() => {
    agents = new AgentsResource(mockHttp);
    jest.clearAllMocks();
  });

  it("should list agents", async () => {
    (mockHttp.get as jest.Mock).mockResolvedValue({
      data: [
        {
          id: "a1",
          name: "Agent 1",
          type: "agent",
          status: "active",
          workspace_id: "ws",
        },
        {
          id: "a2",
          name: "Agent 2",
          type: "workflow",
          status: "draft",
          workspace_id: "ws",
        },
      ],
      meta: { total: 2, page: 1, limit: 20, pages: 1 },
    });

    const result = await agents.list();
    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
    expect(result.meta.pages).toBe(1);
    expect(result.data[0].name).toBe("Agent 1");
    expect(mockHttp.get).toHaveBeenCalledWith("/api/v1/agents", {
      page: 1,
      limit: 20,
    });
  });

  it("should get an agent", async () => {
    (mockHttp.get as jest.Mock).mockResolvedValue({
      data: {
        id: "a1",
        name: "Test Agent",
        type: "agent",
        status: "active",
      },
    });

    const agent = await agents.get("a1");
    expect(agent.id).toBe("a1");
    expect(agent.name).toBe("Test Agent");
    expect(mockHttp.get).toHaveBeenCalledWith("/api/v1/agents/a1");
  });

  it("should create an agent", async () => {
    (mockHttp.post as jest.Mock).mockResolvedValue({
      data: {
        id: "a3",
        name: "New Agent",
        type: "agent",
        status: "draft",
      },
    });

    const agent = await agents.create({ name: "New Agent", type: "agent" });
    expect(agent.id).toBe("a3");
    expect(agent.name).toBe("New Agent");
    expect(mockHttp.post).toHaveBeenCalledWith("/api/v1/agents", {
      name: "New Agent",
      type: "agent",
    });
  });

  it("should update an agent", async () => {
    (mockHttp.patch as jest.Mock).mockResolvedValue({
      data: {
        id: "a1",
        name: "Updated",
        type: "agent",
        status: "active",
      },
    });

    const agent = await agents.update("a1", { name: "Updated" });
    expect(agent.name).toBe("Updated");
    expect(mockHttp.patch).toHaveBeenCalledWith("/api/v1/agents/a1", {
      name: "Updated",
    });
  });

  it("should delete an agent", async () => {
    (mockHttp.delete as jest.Mock).mockResolvedValue({
      message: "deleted",
    });

    await agents.delete("a1");
    expect(mockHttp.delete).toHaveBeenCalledWith("/api/v1/agents/a1");
  });

  it("should execute an agent", async () => {
    (mockHttp.post as jest.Mock).mockResolvedValue({
      data: {
        output: { result: "hello" },
        trace_id: "t1",
        execution_id: "e1",
        status: "completed",
        cost: 0.001,
      },
    });

    const result = await agents.execute("a1", {
      input: { prompt: "hi" },
    });
    expect(result.output).toEqual({ result: "hello" });
    expect(result.trace_id).toBe("t1");
  });

  it("should list with filters", async () => {
    (mockHttp.get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 20, pages: 0 },
    });

    await agents.list({ type: "agent", page: 2, limit: 10 });
    expect(mockHttp.get).toHaveBeenCalledWith("/api/v1/agents", {
      page: 2,
      limit: 10,
      type: "agent",
    });
  });

  it("should create a version with version-scoped runtime fields", async () => {
    (mockHttp.post as jest.Mock).mockResolvedValue({
      data: { id: "v1", agent_id: "a1", version: "1.0.0", is_current: true },
    });

    const version = await agents.createVersion("a1", {
      version: "1.0.0",
      config: { type: "agent", prompt_id: "p1" },
      set_current: true,
      model_config: { model_id: "m1", temperature: 0.2 },
      run_budget: { max_cost: 1.5 },
      tools: [{ mcp_tool_id: "t1", requires_approval: true }],
    });
    expect(version.id).toBe("v1");
    expect(mockHttp.post).toHaveBeenCalledWith("/api/v1/agents/a1/versions", {
      version: "1.0.0",
      config: { type: "agent", prompt_id: "p1" },
      set_current: true,
      model_config: { model_id: "m1", temperature: 0.2 },
      run_budget: { max_cost: 1.5 },
      tools: [{ mcp_tool_id: "t1", requires_approval: true }],
    });
  });

  it("should run the playground", async () => {
    (mockHttp.post as jest.Mock).mockResolvedValue({
      data: { output: { text: "hi" } },
    });

    await agents.playground("a1", {
      input: { q: "hi" },
      prompt_override: { user_prompt: "override" },
    });
    expect(mockHttp.post).toHaveBeenCalledWith("/api/v1/agents/a1/playground", {
      input: { q: "hi" },
      prompt_override: { user_prompt: "override" },
    });
  });
});
