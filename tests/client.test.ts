import { PromptRails } from "../src/client";
import { resolveConfig } from "../src/config";
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  RateLimitError,
  raiseForStatus,
} from "../src/errors";

describe("resolveConfig", () => {
  it("should use defaults", () => {
    const config = resolveConfig({ apiKey: "key" });
    expect(config.baseUrl).toBe("https://api.promptrails.ai");
    expect(config.timeout).toBe(30000);
    expect(config.maxRetries).toBe(3);
  });

  it("should strip trailing slash", () => {
    const config = resolveConfig({
      apiKey: "key",
      baseUrl: "http://localhost:8082/",
    });
    expect(config.baseUrl).toBe("http://localhost:8082");
  });

  it("should allow custom values", () => {
    const config = resolveConfig({
      apiKey: "key",
      timeout: 5000,
      maxRetries: 1,
    });
    expect(config.timeout).toBe(5000);
    expect(config.maxRetries).toBe(1);
  });
});

describe("PromptRails client", () => {
  it("should create all resource instances", () => {
    const client = new PromptRails({ apiKey: "k" });
    expect(client.agents).toBeDefined();
    expect(client.prompts).toBeDefined();
    expect(client.executions).toBeDefined();
    expect(client.credentials).toBeDefined();
    expect(client.dataSources).toBeDefined();
    expect(client.chat).toBeDefined();
    expect(client.memories).toBeDefined();
    expect(client.traces).toBeDefined();
    expect(client.costs).toBeDefined();
    expect(client.mcpTools).toBeDefined();
    expect(client.guardrails).toBeDefined();
    expect(client.approvals).toBeDefined();
  });
});

describe("raiseForStatus", () => {
  it("should not throw on 200", () => {
    expect(() => raiseForStatus(200, { data: {} })).not.toThrow();
  });

  it("should throw ValidationError on 400", () => {
    expect(() =>
      raiseForStatus(400, {
        error: { message: "bad input", code: "VALIDATION" },
      }),
    ).toThrow(ValidationError);
  });

  it("should throw UnauthorizedError on 401", () => {
    expect(() => raiseForStatus(401, { error: "unauthorized" })).toThrow(UnauthorizedError);
  });

  it("should throw NotFoundError on 404", () => {
    expect(() => raiseForStatus(404, { error: { message: "not found" } })).toThrow(NotFoundError);
  });

  it("should throw RateLimitError on 429", () => {
    expect(() => raiseForStatus(429, { error: { message: "rate limited" } })).toThrow(
      RateLimitError,
    );
  });

  it("should include error details", () => {
    try {
      raiseForStatus(400, {
        error: {
          message: "invalid name",
          code: "FIELD_ERROR",
          details: { field: "name" },
        },
      });
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const err = e as ValidationError;
      expect(err.message).toBe("invalid name");
      expect(err.code).toBe("FIELD_ERROR");
      expect(err.details).toEqual({ field: "name" });
    }
  });
});
