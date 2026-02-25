import { parseDateOrThrow } from "../../lib/date/parseDate";
import { Metric } from "./Metric.aggregate";
import { MetricApiResponse, MetricDTO, MetricProps } from "./types";

export const mapMetricApiToDomain = (input: MetricApiResponse): Metric =>
  Metric.rehydrate({
    id: input.id,
    metricName: input.metric_name,
    metricType: input.metric_type,
    source: input.source,
    durationMs: input.duration_ms,
    success: input.success,
    userId: input.user_id,
    requestId: input.request_id,
    tags: input.tags,
    context: input.context,
    occurredAt: parseDateOrThrow(input.occurred_at, "occurred_at"),
  });

export const mapMetricDomainToDTO = (metric: Metric): MetricDTO => metric.toDB();

export const mapMetricDomainToView = (metric: Metric): MetricProps => metric.toJSON();
