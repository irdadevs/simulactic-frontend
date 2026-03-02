import { LogApiResponse, LogCategory, LogLevel } from "../../types/log.types";
import { apiGet, apiPatch, apiPost, ApiListResponse } from "./client";

export type CreateLogRequest = {
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
  tags?: string[];
};

export type ListLogsQuery = {
  level?: LogLevel;
  category?: LogCategory;
  source?: string;
  requestId?: string;
  userId?: string;
  statusCode?: number;
  unresolvedOnly?: boolean;
  from?: string | Date;
  to?: string | Date;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: "occurredAt" | "level" | "category";
  orderDir?: "asc" | "desc";
  view?: "dashboard";
};

const BASE = "/logs";

export const logApi = {
  create: (body: CreateLogRequest, view?: "dashboard"): Promise<LogApiResponse> =>
    apiPost(`${BASE}`, view ? { body, query: { view } } : { body }),

  resolve: (id: string): Promise<void> => apiPatch(`${BASE}/${encodeURIComponent(id)}/resolve`),

  list: (query?: ListLogsQuery): Promise<ApiListResponse<LogApiResponse>> =>
    apiGet(`${BASE}`, { query }),

  findById: (id: string, view?: "dashboard"): Promise<LogApiResponse | null> =>
    apiGet(`${BASE}/${encodeURIComponent(id)}`, view ? { query: { view } } : undefined),
};
