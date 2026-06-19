import { Config } from "../src/config";
import { NotFoundError, RateLimitError, ServerError } from "../src/errors";
import { HTTPClient } from "../src/http";

function makeConfig(overrides: Partial<Config> = {}): Config {
  return {
    apiKey: "test-key",
    baseUrl: "https://api.test",
    timeout: 30000,
    maxRetries: 0,
    ...overrides,
  };
}

function mockResponse(status: number, body: unknown, text?: string): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => (text !== undefined ? text : JSON.stringify(body)),
    json: async () => body,
  } as unknown as Response;
}

describe("HTTPClient", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("GET sends API key + user-agent headers and returns parsed body", async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { data: [1, 2] }));
    const http = new HTTPClient(makeConfig());

    const body = await http.get("/things");

    expect(body).toEqual({ data: [1, 2] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/things");
    expect(opts.method).toBe("GET");
    expect(opts.headers["X-API-Key"]).toBe("test-key");
    expect(opts.headers["User-Agent"]).toMatch(/^promptrails-js\//);
    expect(opts.body).toBeUndefined();
  });

  it("appends query params and skips undefined/null", async () => {
    fetchMock.mockResolvedValue(mockResponse(200, {}));
    const http = new HTTPClient(makeConfig());

    await http.get("/things", { page: 2, q: "hi", skip: undefined as never });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("page=2");
    expect(url).toContain("q=hi");
    expect(url).not.toContain("skip");
  });

  it("POST serializes a JSON body", async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { data: { id: "x" } }));
    const http = new HTTPClient(makeConfig());

    await http.post("/things", { name: "x" });

    const opts = fetchMock.mock.calls[0][1];
    expect(opts.method).toBe("POST");
    expect(opts.body).toBe(JSON.stringify({ name: "x" }));
  });

  it("returns {} for an empty response body", async () => {
    fetchMock.mockResolvedValue(mockResponse(200, undefined, ""));
    const http = new HTTPClient(makeConfig());

    await expect(http.delete("/things/1")).resolves.toEqual({});
  });

  it("maps a 404 to NotFoundError without retrying", async () => {
    fetchMock.mockResolvedValue(
      mockResponse(404, { error: { message: "missing", code: "not_found" } }),
    );
    const http = new HTTPClient(makeConfig({ maxRetries: 3 }));

    await expect(http.get("/things/1")).rejects.toBeInstanceOf(NotFoundError);
    expect(fetchMock).toHaveBeenCalledTimes(1); // client errors are not retried
  });

  it("throws RateLimitError immediately on 429", async () => {
    fetchMock.mockResolvedValue(mockResponse(429, { error: "slow down" }));
    const http = new HTTPClient(makeConfig({ maxRetries: 3 }));

    await expect(http.get("/things")).rejects.toBeInstanceOf(RateLimitError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws ServerError on 5xx when retries are exhausted", async () => {
    fetchMock.mockResolvedValue(mockResponse(500, { error: "boom" }));
    const http = new HTTPClient(makeConfig({ maxRetries: 0 }));

    await expect(http.get("/things")).rejects.toBeInstanceOf(ServerError);
  });

  it("retries a 5xx and succeeds on a later attempt", async () => {
    fetchMock
      .mockResolvedValueOnce(mockResponse(500, { error: "boom" }))
      .mockResolvedValueOnce(mockResponse(200, { data: "ok" }));
    const http = new HTTPClient(makeConfig({ maxRetries: 1 }));

    await expect(http.get("/things")).resolves.toEqual({ data: "ok" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  describe("stream", () => {
    it("returns the raw Response for a successful open", async () => {
      const resp = mockResponse(200, {});
      fetchMock.mockResolvedValue(resp);
      const http = new HTTPClient(makeConfig());

      const out = await http.stream("POST", "/chat/stream", {
        json: { content: "hi" },
      });

      expect(out).toBe(resp);
      const opts = fetchMock.mock.calls[0][1];
      expect(opts.headers["Accept"]).toBe("text/event-stream");
      expect(opts.body).toBe(JSON.stringify({ content: "hi" }));
    });

    it("raises a typed error on a non-ok stream open", async () => {
      fetchMock.mockResolvedValue(
        mockResponse(404, { error: { message: "nope" } }),
      );
      const http = new HTTPClient(makeConfig());

      await expect(http.stream("GET", "/x/stream")).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });
});
