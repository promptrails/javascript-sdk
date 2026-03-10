import { HTTPClient } from "../src/http";
import { PromptsResource } from "../src/resources/prompts";

const mockHttp = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  request: jest.fn(),
} as unknown as HTTPClient;

describe("PromptsResource", () => {
  let prompts: PromptsResource;

  beforeEach(() => {
    prompts = new PromptsResource(mockHttp);
    jest.clearAllMocks();
  });

  it("should list prompts", async () => {
    (mockHttp.get as jest.Mock).mockResolvedValue({
      data: [
        { id: "p1", name: "Prompt 1", status: "active", workspace_id: "ws" },
      ],
      meta: { total: 1, page: 1, limit: 20, total_pages: 1 },
    });

    const result = await prompts.list();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Prompt 1");
    expect(mockHttp.get).toHaveBeenCalledWith("/api/v1/prompts", {
      page: 1,
      limit: 20,
    });
  });

  it("should get a prompt", async () => {
    (mockHttp.get as jest.Mock).mockResolvedValue({
      data: { id: "p1", name: "Test Prompt", status: "active" },
    });

    const prompt = await prompts.get("p1");
    expect(prompt.id).toBe("p1");
    expect(prompt.name).toBe("Test Prompt");
    expect(mockHttp.get).toHaveBeenCalledWith("/api/v1/prompts/p1");
  });

  it("should create a prompt", async () => {
    (mockHttp.post as jest.Mock).mockResolvedValue({
      data: { id: "p2", name: "New Prompt", status: "draft" },
    });

    const prompt = await prompts.create({ name: "New Prompt" });
    expect(prompt.id).toBe("p2");
    expect(prompt.name).toBe("New Prompt");
    expect(mockHttp.post).toHaveBeenCalledWith("/api/v1/prompts", {
      name: "New Prompt",
    });
  });

  it("should update a prompt", async () => {
    (mockHttp.patch as jest.Mock).mockResolvedValue({
      data: { id: "p1", name: "Updated", status: "active" },
    });

    const prompt = await prompts.update("p1", { name: "Updated" });
    expect(prompt.name).toBe("Updated");
    expect(mockHttp.patch).toHaveBeenCalledWith("/api/v1/prompts/p1", {
      name: "Updated",
    });
  });

  it("should delete a prompt", async () => {
    (mockHttp.delete as jest.Mock).mockResolvedValue({ message: "deleted" });

    await prompts.delete("p1");
    expect(mockHttp.delete).toHaveBeenCalledWith("/api/v1/prompts/p1");
  });
});
