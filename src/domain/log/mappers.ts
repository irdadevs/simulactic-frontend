import { parseDateOrThrow } from "../../lib/date/parseDate";
import { Log } from "./Log.aggregate";
import { LogApiResponse, LogDTO, LogProps } from "../../types/log.types";

const parseOptionalDate = (value: string | Date | null, field: string): Date | null => {
  if (!value) {
    return null;
  }
  return parseDateOrThrow(value, field);
};

export const mapLogApiToDomain = (input: LogApiResponse): Log =>
  Log.rehydrate({
    id: input.id,
    source: input.source,
    level: input.level,
    category: input.category,
    message: input.message,
    context: input.context,
    userId: input.user_id,
    requestId: input.request_id,
    method: input.method,
    path: input.path,
    statusCode: input.status_code,
    ip: input.ip,
    userAgent: input.user_agent,
    fingerprint: input.fingerprint,
    tags: input.tags,
    occurredAt: parseDateOrThrow(input.occurred_at, "occurred_at"),
    resolvedAt: parseOptionalDate(input.resolved_at, "resolved_at"),
    resolvedBy: input.resolved_by,
  });

export const mapLogDomainToDTO = (log: Log): LogDTO => log.toDB();

export const mapLogDomainToView = (log: Log): LogProps => log.toJSON();

