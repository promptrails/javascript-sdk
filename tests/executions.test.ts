import { HTTPClient } from "../src/http";
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
      meta: { total: 1, page: 1, limit: 20, total_pages: 1 },
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
      meta: { total: 0, page: 1, limit: 20, total_pages: 0 },
    });

    await executions.list({ agent_id: "a1" });
    expect(mockHttp.get).toHaveBeenCalledWith("/api/v1/executions", {
      page: 1,
      limit: 20,
      agent_id: "a1",
    });
  });
});
