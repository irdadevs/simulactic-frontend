import { ErrorFactory } from "../../lib/errors/Error.map";
import { MetricType } from "../../types/metric.types";

export const ALLOWED_METRIC_TYPES: readonly MetricType[] = [
  "http",
  "db",
  "use_case",
  "cache",
  "infra",
] as const;

export class MetricName {
  private constructor(private readonly value: string) {}

  static create(value: string): MetricName {
    const normalized = value.trim();
    if (!normalized || normalized.length > 120) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", {
        field: "metricName",
      });
    }
    return new MetricName(normalized);
  }

  toString(): string {
    return this.value;
  }
}

export class MetricSource {
  private constructor(private readonly value: string) {}

  static create(value: string): MetricSource {
    const normalized = value.trim();
    if (!normalized || normalized.length > 120) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", {
        field: "source",
      });
    }
    return new MetricSource(normalized);
  }

  toString(): string {
    return this.value;
  }
}

