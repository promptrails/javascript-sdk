import type { HTTPClient } from "../src/http";
import { ExecutionsResource } from "../src/resources/executions";

const mockHttp = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  request: jest.fn(),
} as unknown as HTTPClient;

describe("ExecutionsResource", () => {
  let executions: ExecutionsResource;

  beforeEach(() => {
    executions = new ExecutionsResource(mockHttp);
    jest.clearAllMocks();
  });

  it("should list executions", async () => {
    (mockHttp.get as jest.Mock).mockResolvedValue({
      data: [{ id: "e1", agent_id: "a1", status: "completed" }],
      meta: { total: 1, page: 1, limit: 20, pages: 1 },
    });

    const result = await executions.list();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].status).toBe("completed");
  });

  it("should get an execution", async () => {
    (mockHttp.get as jest.Mock).mockResolvedValue({
      data: {
        id: "e1",
        agent_id: "a1",
        status: "completed",
        input: { query: "test" },
        output: { result: "ok" },
      },
    });

    const execution = await executions.get("e1");
    expect(execution.id).toBe("e1");
    expect(execution.status).toBe("completed");
    expect(mockHttp.get).toHaveBeenCalledWith("/api/v1/executions/e1");
  });

  it("should filter by agent_id", async () => {
    (mockHttp.get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 20, pages: 0 },
    });

    await executions.list({ agent_id: "a1" });
    expect(mockHttp.get).toHaveBeenCalledWith("/api/v1/executions", {
      page: 1,
      limit: 20,
      agent_id: "a1",
    });
  });

  it("should fetch the execution tree", async () => {
    (mockHttp.get as jest.Mock).mockResolvedValue({
      data: { id: "e1", status: "completed", children: [{ id: "e2" }] },
    });

    const tree = await executions.tree("e1");
    expect(tree.children).toHaveLength(1);
    expect(mockHttp.get).toHaveBeenCalledWith("/api/v1/executions/e1/tree");
  });

  it("should cancel an execution", async () => {
    (mockHttp.post as jest.Mock).mockResolvedValue({
      data: { id: "e1", status: "cancel_requested" },
    });

    const exec = await executions.cancel("e1");
    expect(exec.status).toBe("cancel_requested");
    expect(mockHttp.post).toHaveBeenCalledWith(
      "/api/v1/executions/e1/cancel",
      {},
    );
  });

  it("should list the approval inbox", async () => {
    (mockHttp.get as jest.Mock).mockResolvedValue({
      data: [{ id: "e1", status: "waiting_approval" }],
      meta: { total: 1, page: 1, limit: 20, pages: 1 },
    });

    const result = await executions.approvalInbox();
    expect(result.data).toHaveLength(1);
    expect(mockHttp.get).toHaveBeenCalledWith(
      "/api/v1/executions/approval-inbox",
      {
        page: 1,
        limit: 20,
      },
    );
  });

  it("should approve and deny a parked execution", async () => {
    (mockHttp.post as jest.Mock).mockResolvedValue({
      data: { id: "e1", status: "running" },
    });

    await executions.approve("e1", { reason: "ok" });
    expect(mockHttp.post).toHaveBeenCalledWith(
      "/api/v1/executions/e1/approve",
      {
        reason: "ok",
      },
    );

    await executions.deny("e1");
    expect(mockHttp.post).toHaveBeenCalledWith(
      "/api/v1/executions/e1/deny",
      {},
    );
  });
});
