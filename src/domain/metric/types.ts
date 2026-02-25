export type MetricType = "http" | "db" | "use_case" | "cache" | "infra";

export type MetricProps = {
  id: string;
  metricName: string;
  metricType: MetricType;
  source: string;
  durationMs: number;
  success: boolean;
  userId: string | null;
  requestId: string | null;
  tags: Record<string, unknown>;
  context: Record<string, unknown>;
  occurredAt: Date;
};

export type MetricCreateProps = {
  id?: string;
  metricName: string;
  metricType: MetricType;
  source: string;
  durationMs: number;
  success?: boolean;
  userId?: string | null;
  requestId?: string | null;
  tags?: Record<string, unknown>;
  context?: Record<string, unknown>;
  occurredAt?: Date;
};

export type MetricDTO = {
  id: string;
  metric_name: string;
  metric_type: MetricType;
  source: string;
  duration_ms: number;
  success: boolean;
  user_id: string | null;
  request_id: string | null;
  tags: Record<string, unknown>;
  context: Record<string, unknown>;
  occurred_at: Date;
};

export type MetricApiResponse = {
  id: string;
  metric_name: string;
  metric_type: MetricType;
  source: string;
  duration_ms: number;
  success: boolean;
  user_id: string | null;
  request_id: string | null;
  tags: Record<string, unknown>;
  context: Record<string, unknown>;
  occurred_at: string | Date;
};
