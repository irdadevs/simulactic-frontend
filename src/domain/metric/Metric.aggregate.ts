import { ErrorFactory } from "../../lib/errors/Error.map";
import { Uuid } from "../shared/Uuid.vo";
import { ALLOWED_METRIC_TYPES, MetricName, MetricSource } from "./Metric.vo";
import { MetricCreateProps, MetricDTO, MetricProps } from "../../types/metric.types";

type MetricState = {
  id: string;
  metricName: string;
  metricType: MetricProps["metricType"];
  source: string;
  durationMs: number;
  success: boolean;
  userId: string | null;
  requestId: string | null;
  tags: Record<string, unknown>;
  context: Record<string, unknown>;
  occurredAt: Date;
};

export class Metric {
  private props: MetricState;

  private constructor(props: MetricState) {
    this.props = { ...props };
  }

  static create(input: MetricCreateProps): Metric {
    if (!ALLOWED_METRIC_TYPES.includes(input.metricType)) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", {
        field: "metricType",
      });
    }

    if (!Number.isFinite(input.durationMs) || input.durationMs < 0) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", {
        field: "durationMs",
      });
    }

    const userId = input.userId ? Uuid.create(input.userId).toString() : null;

    return new Metric({
      id: input.id ?? "0",
      metricName: MetricName.create(input.metricName).toString(),
      metricType: input.metricType,
      source: MetricSource.create(input.source).toString(),
      durationMs: Number(input.durationMs),
      success: input.success ?? true,
      userId,
      requestId: input.requestId?.trim() || null,
      tags: input.tags ?? {},
      context: input.context ?? {},
      occurredAt: input.occurredAt ?? new Date(),
    });
  }

  static rehydrate(props: MetricProps): Metric {
    return Metric.create({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get metricName(): string {
    return this.props.metricName;
  }

  get metricType() {
    return this.props.metricType;
  }

  get source(): string {
    return this.props.source;
  }

  get durationMs(): number {
    return this.props.durationMs;
  }

  get success(): boolean {
    return this.props.success;
  }

  get userId(): string | null {
    return this.props.userId;
  }

  get requestId(): string | null {
    return this.props.requestId;
  }

  get tags(): Record<string, unknown> {
    return { ...this.props.tags };
  }

  get context(): Record<string, unknown> {
    return { ...this.props.context };
  }

  get occurredAt(): Date {
    return this.props.occurredAt;
  }

  toJSON(): MetricProps {
    return {
      id: this.id,
      metricName: this.metricName,
      metricType: this.metricType,
      source: this.source,
      durationMs: this.durationMs,
      success: this.success,
      userId: this.userId,
      requestId: this.requestId,
      tags: this.tags,
      context: this.context,
      occurredAt: this.occurredAt,
    };
  }

  toDB(): MetricDTO {
    return {
      id: this.id,
      metric_name: this.metricName,
      metric_type: this.metricType,
      source: this.source,
      duration_ms: this.durationMs,
      success: this.success,
      user_id: this.userId,
      request_id: this.requestId,
      tags: this.tags,
      context: this.context,
      occurred_at: this.occurredAt,
    };
  }
}

