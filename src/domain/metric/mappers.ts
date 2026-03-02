import { parseDateOrThrow } from "../../lib/date/parseDate";
import { Metric } from "./Metric.aggregate";
import { MetricApiResponse, MetricDTO, MetricProps } from "../../types/metric.types";

export const mapMetricApiToDomain = (input: MetricApiResponse): Metric =>
  Metric.rehydrate({
    id: input.id,
    metricName: input.metricName,
    metricType: input.metricType,
    source: input.source,
    durationMs: input.durationMs,
    success: input.success,
    userId: input.userId ?? null,
    requestId: input.requestId ?? null,
    tags: input.tags ?? {},
    context: input.context ?? {},
    occurredAt: parseDateOrThrow(input.occurredAt, "occurredAt"),
  });

export const mapMetricDomainToDTO = (metric: Metric): MetricDTO => metric.toDB();

export const mapMetricDomainToView = (metric: Metric): MetricProps => metric.toJSON();

