import { DomainError } from "../../lib/errors/Errors.base";
import { Log } from "../../domain/log/Log.aggregate";
import { LogMessage, LogSource } from "../../domain/log/Log.vo";
import { mapLogApiToDomain, mapLogDomainToDTO, mapLogDomainToView } from "../../domain/log/mappers";

describe("Log aggregate", () => {
  const userId = "11111111-1111-4111-8111-111111111111";

  it("creates and resolves lifecycle state", () => {
    const aggregate = Log.create({
      id: "10",
      source: "api",
      level: "error",
      category: "application",
      message: "Unhandled failure",
      userId,
      statusCode: 500,
    });

    aggregate.resolve(userId, new Date("2026-02-25T00:00:00.000Z"));

    expect(aggregate.resolvedBy).toBe(userId);
    expect(aggregate.resolvedAt).toEqual(new Date("2026-02-25T00:00:00.000Z"));
  });

  it("maps api/domain/dto", () => {
    const aggregate = mapLogApiToDomain({
      id: "11",
      source: "audit",
      level: "warn",
      category: "audit",
      message: "Policy mismatch",
      context: { zone: 1 },
      userId,
      requestId: "req-1",
      method: "GET",
      path: "/systems",
      statusCode: 200,
      ipMasked: "127.0.0.***",
      userAgent: "jest",
      fingerprintMasked: "fp...1",
      tags: ["t1"],
      occurredAt: "2026-02-24T00:00:00.000Z",
      resolvedAt: null,
      resolvedBy: null,
    });

    expect(mapLogDomainToView(aggregate).source).toBe("audit");
    expect(mapLogDomainToDTO(aggregate).request_id).toBe("req-1");
  });

  it("throws on invalid status code", () => {
    try {
      Log.create({
        source: "api",
        level: "error",
        category: "application",
        message: "Bad status",
        statusCode: 700,
      });
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("PRESENTATION.INVALID_FIELD");
    }
  });
});

describe("Log value objects", () => {
  it("validates source and message", () => {
    expect(LogSource.create(" api ").toString()).toBe("api");
    expect(LogMessage.create(" test message ").toString()).toBe("test message");
  });

  it("throws on invalid source", () => {
    try {
      LogSource.create(" ");
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("PRESENTATION.INVALID_FIELD");
    }
  });
});
