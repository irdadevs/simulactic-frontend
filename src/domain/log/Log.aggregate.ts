import { ErrorFactory } from "../../lib/errors/Error.map";
import { Uuid } from "../shared/Uuid.vo";
import {
  ALLOWED_LOG_CATEGORIES,
  ALLOWED_LOG_LEVELS,
  LogMessage,
  LogSource,
} from "./Log.vo";
import { LogCreateProps, LogDTO, LogProps } from "../../types/log.types";

type LogState = {
  id: string;
  source: string;
  level: LogProps["level"];
  category: LogProps["category"];
  message: string;
  context: Record<string, unknown>;
  userId: string | null;
  requestId: string | null;
  method: string | null;
  path: string | null;
  statusCode: number | null;
  ip: string | null;
  userAgent: string | null;
  fingerprint: string | null;
  tags: string[];
  occurredAt: Date;
  resolvedAt: Date | null;
  resolvedBy: string | null;
};

export class Log {
  private props: LogState;

  private constructor(props: LogState) {
    this.props = { ...props };
  }

  static create(input: LogCreateProps): Log {
    if (!ALLOWED_LOG_LEVELS.includes(input.level)) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", { field: "level" });
    }

    if (!ALLOWED_LOG_CATEGORIES.includes(input.category)) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", { field: "category" });
    }

    if (input.statusCode != null && (input.statusCode < 100 || input.statusCode > 599)) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", { field: "statusCode" });
    }

    const userId = input.userId ? Uuid.create(input.userId).toString() : null;
    const resolvedBy = input.resolvedBy ? Uuid.create(input.resolvedBy).toString() : null;

    return new Log({
      id: input.id ?? "0",
      source: LogSource.create(input.source).toString(),
      level: input.level,
      category: input.category,
      message: LogMessage.create(input.message).toString(),
      context: input.context ?? {},
      userId,
      requestId: input.requestId?.trim() || null,
      method: input.method?.trim() || null,
      path: input.path?.trim() || null,
      statusCode: input.statusCode ?? null,
      ip: input.ip?.trim() || null,
      userAgent: input.userAgent?.trim() || null,
      fingerprint: input.fingerprint?.trim() || null,
      tags: Array.isArray(input.tags)
        ? input.tags.map((tag) => tag.trim()).filter(Boolean)
        : [],
      occurredAt: input.occurredAt ?? new Date(),
      resolvedAt: input.resolvedAt ?? null,
      resolvedBy,
    });
  }

  static rehydrate(props: LogProps): Log {
    return Log.create({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get source(): string {
    return this.props.source;
  }

  get level() {
    return this.props.level;
  }

  get category() {
    return this.props.category;
  }

  get message(): string {
    return this.props.message;
  }

  get context(): Record<string, unknown> {
    return { ...this.props.context };
  }

  get userId(): string | null {
    return this.props.userId;
  }

  get requestId(): string | null {
    return this.props.requestId;
  }

  get method(): string | null {
    return this.props.method;
  }

  get path(): string | null {
    return this.props.path;
  }

  get statusCode(): number | null {
    return this.props.statusCode;
  }

  get ip(): string | null {
    return this.props.ip;
  }

  get userAgent(): string | null {
    return this.props.userAgent;
  }

  get fingerprint(): string | null {
    return this.props.fingerprint;
  }

  get tags(): string[] {
    return [...this.props.tags];
  }

  get occurredAt(): Date {
    return this.props.occurredAt;
  }

  get resolvedAt(): Date | null {
    return this.props.resolvedAt;
  }

  get resolvedBy(): string | null {
    return this.props.resolvedBy;
  }

  resolve(byUserId: string, at: Date = new Date()): void {
    this.props.resolvedAt = at;
    this.props.resolvedBy = Uuid.create(byUserId).toString();
  }

  toJSON(): LogProps {
    return {
      id: this.id,
      source: this.source,
      level: this.level,
      category: this.category,
      message: this.message,
      context: this.context,
      userId: this.userId,
      requestId: this.requestId,
      method: this.method,
      path: this.path,
      statusCode: this.statusCode,
      ip: this.ip,
      userAgent: this.userAgent,
      fingerprint: this.fingerprint,
      tags: this.tags,
      occurredAt: this.occurredAt,
      resolvedAt: this.resolvedAt,
      resolvedBy: this.resolvedBy,
    };
  }

  toDB(): LogDTO {
    return {
      id: this.id,
      source: this.source,
      level: this.level,
      category: this.category,
      message: this.message,
      context: this.context,
      user_id: this.userId,
      request_id: this.requestId,
      method: this.method,
      path: this.path,
      status_code: this.statusCode,
      ip: this.ip,
      user_agent: this.userAgent,
      fingerprint: this.fingerprint,
      tags: this.tags,
      occurred_at: this.occurredAt,
      resolved_at: this.resolvedAt,
      resolved_by: this.resolvedBy,
    };
  }
}

