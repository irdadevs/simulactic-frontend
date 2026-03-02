import { DomainError } from "../../lib/errors/Errors.base";
import { Metric } from "../../domain/metric/Metric.aggregate";
import { MetricName, MetricSource } from "../../domain/metric/Metric.vo";
import {
  mapMetricApiToDomain,
  mapMetricDomainToDTO,
  mapMetricDomainToView,
} from "../../domain/metric/mappers";

describe("Metric aggregate", () => {
  const userId = "11111111-1111-4111-8111-111111111111";

  it("creates lifecycle state", () => {
    const aggregate = Metric.create({
      id: "1",
      metricName: "query.systems",
      metricType: "use_case",
      source: "systems.query",
      durationMs: 25,
      success: true,
      userId,
      requestId: "req-1",
      tags: { module: "systems" },
      context: { page: 1 },
      occurredAt: new Date("2026-02-25T00:00:00.000Z"),
    });

    expect(aggregate.metricName).toBe("query.systems");
    expect(aggregate.userId).toBe(userId);
  });

  it("maps api/domain/dto", () => {
    const aggregate = mapMetricApiToDomain({
      id: "2",
      metricName: "http.request",
      metricType: "http",
      source: "gateway",
      durationMs: 9,
      success: true,
      userId,
      requestId: "req-2",
      tags: { kind: "read" },
      context: { status: 200 },
      occurredAt: "2026-02-24T00:00:00.000Z",
    });

    expect(mapMetricDomainToView(aggregate).metricType).toBe("http");
    expect(mapMetricDomainToDTO(aggregate).metric_name).toBe("http.request");
  });

  it("throws on invalid duration", () => {
    try {
      Metric.create({
        metricName: "http.request",
        metricType: "http",
        source: "gateway",
        durationMs: -1,
      });
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("PRESENTATION.INVALID_FIELD");
    }
  });
});

describe("Metric value objects", () => {
  it("validates metric name and source", () => {
    expect(MetricName.create(" metric.name ").toString()).toBe("metric.name");
    expect(MetricSource.create(" source.api ").toString()).toBe("source.api");
  });

  it("throws on invalid metric name", () => {
    try {
      MetricName.create(" ");
      fail("Expected error was not thrown");
    } catch (error) {
      expect((error as DomainError).code).toBe("PRESENTATION.INVALID_FIELD");
    }
  });
});
