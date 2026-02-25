export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";

export type LogCategory = "application" | "security" | "audit" | "infrastructure";

export type LogProps = {
  id: string;
  source: string;
  level: LogLevel;
  category: LogCategory;
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

export type LogCreateProps = {
  id?: string;
  source: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, unknown>;
  userId?: string | null;
  requestId?: string | null;
  method?: string | null;
  path?: string | null;
  statusCode?: number | null;
  ip?: string | null;
  userAgent?: string | null;
  fingerprint?: string | null;
  tags?: string[];
  occurredAt?: Date;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
};

export type LogDTO = {
  id: string;
  source: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context: Record<string, unknown>;
  user_id: string | null;
  request_id: string | null;
  method: string | null;
  path: string | null;
  status_code: number | null;
  ip: string | null;
  user_agent: string | null;
  fingerprint: string | null;
  tags: string[];
  occurred_at: Date;
  resolved_at: Date | null;
  resolved_by: string | null;
};

export type LogApiResponse = {
  id: string;
  source: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context: Record<string, unknown>;
  user_id: string | null;
  request_id: string | null;
  method: string | null;
  path: string | null;
  status_code: number | null;
  ip: string | null;
  user_agent: string | null;
  fingerprint: string | null;
  tags: string[];
  occurred_at: string | Date;
  resolved_at: string | Date | null;
  resolved_by: string | null;
};
