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
    context: input.context ?? {},
    userId: input.userId,
    requestId: input.requestId,
    method: input.method,
    path: input.path,
    statusCode: input.statusCode,
    ip: input.ipMasked ?? null,
    userAgent: input.userAgent ?? null,
    fingerprint: input.fingerprintMasked ?? null,
    tags: input.tags,
    occurredAt: parseDateOrThrow(input.occurredAt, "occurredAt"),
    resolvedAt: parseOptionalDate(input.resolvedAt, "resolvedAt"),
    resolvedBy: input.resolvedBy,
  });

export const mapLogDomainToDTO = (log: Log): LogDTO => log.toDB();

export const mapLogDomainToView = (log: Log): LogProps => log.toJSON();

