import { HTTPClient } from "../src/http";
import { A2AResource } from "../src/resources/a2a";
import { AgentVFSResource } from "../src/resources/agentVfs";
import { AssetsResource } from "../src/resources/assets";
import { CostsResource } from "../src/resources/costs";
import { CredentialsResource } from "../src/resources/credentials";
import { DataSourcesResource } from "../src/resources/dataSources";
import { MCPToolsResource } from "../src/resources/mcpTools";
import { ScoresResource } from "../src/resources/scores";

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

describe("A2AResource", () => {
  let http: ReturnType<typeof makeMock>;
  let a2a: A2AResource;
  beforeEach(() => {
    http = makeMock();
    a2a = new A2AResource(http);
  });

  it("getAgentCard hits the card endpoint", async () => {
    // The agent card is the whole response body (no data envelope).
    http.get.mockResolvedValue({ name: "Card", version: "1.0" });
    const card = await a2a.getAgentCard("ag1");
    expect(http.get).toHaveBeenCalledWith("/a2a/agents/ag1/agent-card.json");
    expect(card).toEqual({ name: "Card", version: "1.0" });
  });

  it("listTasks passes pagination params", async () => {
    http.get.mockResolvedValue(listBody);
    const res = await a2a.listTasks();
    expect(http.get).toHaveBeenCalledWith("/api/v1/a2a/tasks", {
      page: 1,
      limit: 20,
    });
    expect(res.data).toHaveLength(1);
  });

  it("cancelTask posts a JSON-RPC body and unwraps result", async () => {
    http.post.mockResolvedValue({ result: { id: "t1", status: "canceled" } });
    const task = await a2a.cancelTask("t1");
    expect(http.post).toHaveBeenCalledWith(
      "/a2a/tasks/cancel",
      expect.objectContaining({ method: "tasks/cancel" }),
    );
    expect(task).toEqual({ id: "t1", status: "canceled" });
  });
});

describe("AgentVFSResource", () => {
  let http: ReturnType<typeof makeMock>;
  let vfs: AgentVFSResource;
  beforeEach(() => {
    http = makeMock();
    vfs = new AgentVFSResource(http);
  });

  it("list scopes to the agent vfs path", async () => {
    http.get.mockResolvedValue({ data: { path: "/", items: [], total: 0 } });
    await vfs.list("ag1");
    expect(http.get).toHaveBeenCalledWith(
      "/api/v1/agents/ag1/vfs",
      expect.any(Object),
    );
  });

  it("write PUTs the file endpoint with default overwrite mode", async () => {
    http.put.mockResolvedValue({ data: { path: "/a.txt" } });
    await vfs.write("ag1", "/a.txt", "hi");
    expect(http.put).toHaveBeenCalledWith(
      "/api/v1/agents/ag1/vfs/file",
      expect.objectContaining({
        path: "/a.txt",
        content: "hi",
        mode: "overwrite",
      }),
    );
  });

  it("move posts from/to", async () => {
    http.post.mockResolvedValue({});
    await vfs.move("ag1", "/a", "/b");
    expect(http.post).toHaveBeenCalledWith("/api/v1/agents/ag1/vfs/move", {
      from: "/a",
      to: "/b",
    });
  });

  it("usage returns the byte count", async () => {
    http.get.mockResolvedValue({ data: { bytes_used: 42 } });
    const used = await vfs.usage("ag1");
    expect(http.get).toHaveBeenCalledWith("/api/v1/agents/ag1/vfs/usage");
    expect(used).toBe(42);
  });
});

describe("ScoresResource", () => {
  let http: ReturnType<typeof makeMock>;
  let scores: ScoresResource;
  beforeEach(() => {
    http = makeMock();
    scores = new ScoresResource(http);
  });

  it("create posts a score", async () => {
    http.post.mockResolvedValue({ data: { id: "s1" } });
    await scores.create({ execution_id: "e1", value: 1 } as never);
    expect(http.post).toHaveBeenCalledWith(
      "/api/v1/scores",
      expect.any(Object),
    );
  });

  it("update patches a score", async () => {
    http.patch.mockResolvedValue({ data: { id: "s1" } });
    await scores.update("s1", { value: 0.5 } as never);
    expect(http.patch).toHaveBeenCalledWith(
      "/api/v1/scores/s1",
      expect.any(Object),
    );
  });

  it("delete removes a score", async () => {
    http.delete.mockResolvedValue({});
    await scores.delete("s1");
    expect(http.delete).toHaveBeenCalledWith("/api/v1/scores/s1");
  });

  it("score configs use the score-configs endpoint", async () => {
    http.get.mockResolvedValue(listBody);
    await scores.listConfigs();
    expect(http.get).toHaveBeenCalledWith(
      "/api/v1/score-configs",
      expect.any(Object),
    );

    http.get.mockResolvedValue({ data: { id: "cfg1" } });
    await scores.getConfig("cfg1");
    expect(http.get).toHaveBeenCalledWith("/api/v1/score-configs/cfg1");
  });
});

describe("CostsResource", () => {
  it("getSummary and getAgentSummary hit the cost endpoints", async () => {
    const http = makeMock();
    const costs = new CostsResource(http);

    http.get.mockResolvedValue({ data: { total_cost: 1 } });
    await costs.getSummary();
    expect(http.get).toHaveBeenCalledWith(
      "/api/v1/costs/summary",
      expect.any(Object),
    );

    await costs.getAgentSummary("ag1");
    expect(http.get).toHaveBeenCalledWith(
      "/api/v1/costs/agents/ag1",
      expect.any(Object),
    );
  });
});

describe("DataSourcesResource", () => {
  let http: ReturnType<typeof makeMock>;
  let ds: DataSourcesResource;
  beforeEach(() => {
    http = makeMock();
    ds = new DataSourcesResource(http);
  });

  it("CRUD hits the data-sources endpoints", async () => {
    http.get.mockResolvedValue(listBody);
    await ds.list();
    expect(http.get).toHaveBeenCalledWith(
      "/api/v1/data-sources",
      expect.any(Object),
    );

    http.get.mockResolvedValue({ data: { id: "d1" } });
    await ds.get("d1");
    expect(http.get).toHaveBeenCalledWith("/api/v1/data-sources/d1");

    http.post.mockResolvedValue({ data: { id: "d1" } });
    await ds.create({ name: "x" } as never);
    expect(http.post).toHaveBeenCalledWith(
      "/api/v1/data-sources",
      expect.any(Object),
    );

    http.delete.mockResolvedValue({});
    await ds.delete("d1");
    expect(http.delete).toHaveBeenCalledWith("/api/v1/data-sources/d1");
  });

  it("testConnection posts to the test endpoint", async () => {
    http.post.mockResolvedValue({ data: { ok: true } });
    await ds.testConnection("d1");
    expect(http.post.mock.calls[0][0]).toContain(
      "/api/v1/data-sources/d1/test",
    );
  });
});

describe("AssetsResource", () => {
  let http: ReturnType<typeof makeMock>;
  let assets: AssetsResource;
  beforeEach(() => {
    http = makeMock();
    assets = new AssetsResource(http);
  });

  it("list forwards type/provider filters", async () => {
    http.get.mockResolvedValue(listBody);
    await assets.list({ type: "image", provider: "openai" });
    const [path, query] = http.get.mock.calls[0];
    expect(path).toBe("/api/v1/assets");
    expect(query).toMatchObject({ type: "image", provider: "openai" });
  });

  it("getSignedUrl hits the signed-url endpoint", async () => {
    http.get.mockResolvedValue({ data: { url: "https://signed" } });
    const res = await assets.getSignedUrl("a1");
    expect(http.get).toHaveBeenCalledWith("/api/v1/assets/a1/signed-url");
    expect(res).toEqual({ url: "https://signed" });
  });
});

describe("MCPToolsResource", () => {
  let http: ReturnType<typeof makeMock>;
  let tools: MCPToolsResource;
  beforeEach(() => {
    http = makeMock();
    tools = new MCPToolsResource(http);
  });

  it("discoverTools posts to the discover endpoint", async () => {
    http.post.mockResolvedValue({ data: { tools: [] } });
    await tools.discoverTools("m1");
    expect(http.post).toHaveBeenCalledWith("/api/v1/mcp-tools/m1/discover");
  });

  it("delete removes a tool", async () => {
    http.delete.mockResolvedValue({});
    await tools.delete("m1");
    expect(http.delete).toHaveBeenCalledWith("/api/v1/mcp-tools/m1");
  });
});

describe("CredentialsResource", () => {
  it("CRUD hits the credentials endpoints", async () => {
    const http = makeMock();
    const creds = new CredentialsResource(http);

    http.get.mockResolvedValue(listBody);
    await creds.list();
    expect(http.get).toHaveBeenCalledWith(
      "/api/v1/credentials",
      expect.any(Object),
    );

    http.post.mockResolvedValue({ data: { id: "c1" } });
    await creds.create({
      name: "k",
      provider: "openai",
      api_key: "sk",
    } as never);
    expect(http.post).toHaveBeenCalledWith(
      "/api/v1/credentials",
      expect.any(Object),
    );

    http.delete.mockResolvedValue({});
    await creds.delete("c1");
    expect(http.delete).toHaveBeenCalledWith("/api/v1/credentials/c1");
  });
});
