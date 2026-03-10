import { MetricApiResponse, MetricType } from "../../types/metric.types";
import { apiGet, apiPost, ApiListResponse } from "./client";

export type TrackMetricRequest = {
  metricName: string;
  metricType: MetricType;
  source: string;
  durationMs: number;
  success?: boolean;
  userId?: string | null;
  requestId?: string | null;
  tags?: Record<string, unknown>;
  context?: Record<string, unknown>;
};

export type ListMetricsQuery = {
  metricType?: MetricType;
  metricName?: string;
  source?: string;
  requestId?: string;
  userId?: string;
  success?: boolean;
  minDurationMs?: number;
  maxDurationMs?: number;
  from?: string | Date;
  to?: string | Date;
  limit?: number;
  offset?: number;
  orderBy?: "occurredAt" | "durationMs" | "metricName";
  orderDir?: "asc" | "desc";
  view?: "dashboard";
};

export type MetricsDashboardQuery = {
  hours?: number;
  topLimit?: number;
};

export type MetricsDashboardResponse = {
  from: string;
  to: string;
  summary: {
    total: number;
    avgDurationMs: number;
    p95DurationMs: number;
    p99DurationMs: number;
    maxDurationMs: number;
    errorRate: number;
  };
  byType: Array<{
    metricType: MetricType;
    total: number;
    avgDurationMs: number;
    p95DurationMs: number;
    errorRate: number;
  }>;
  topBottlenecks: Array<{
    metricName: string;
    metricType: MetricType;
    source: string;
    total: number;
    avgDurationMs: number;
    p95DurationMs: number;
    maxDurationMs: number;
    errorRate: number;
  }>;
  recentFailures: Array<{
    id: string;
    metricName: string;
    metricType: MetricType;
    source: string;
    durationMs: number;
    occurredAt: string;
    context: Record<string, unknown>;
  }>;
};

export type TrafficAnalyticsQuery = {
  from: string | Date;
  to: string | Date;
  limitRecent?: number;
  limitRoutes?: number;
  limitReferrers?: number;
};

export type TrafficAnalyticsResponse = {
  overview: {
    pageViews: number;
    uniqueSessions: number;
    trackedRoutes: number;
    externalReferrals: number;
  };
  viewsByDay: Array<{
    date: string;
    views: number;
  }>;
  routes: Array<{
    path: string;
    views: number;
    uniqueSessions: number;
    avgDurationMs: number;
  }>;
  referrers: Array<{
    referrer: string;
    views: number;
  }>;
  recentViews: Array<{
    id: string;
    occurredAt: string;
    path: string | null;
    fullPath: string | null;
    referrerHost: string | null;
    sessionId: string | null;
    viewport: { width: number; height: number } | null;
    durationMs: number;
  }>;
};

const BASE = "/metrics/performance";

export const metricApi = {
  track: (body: TrackMetricRequest, view?: "dashboard"): Promise<MetricApiResponse> =>
    apiPost(BASE, view ? { body, query: { view } } : { body }),

  list: (query?: ListMetricsQuery): Promise<ApiListResponse<MetricApiResponse>> =>
    apiGet(BASE, { query }),

  traffic: (query: TrafficAnalyticsQuery): Promise<TrafficAnalyticsResponse> =>
    apiGet(`${BASE}/traffic`, { query }),

  findById: (id: string, view?: "dashboard"): Promise<MetricApiResponse | null> =>
    apiGet(`${BASE}/${encodeURIComponent(id)}`, view ? { query: { view } } : undefined),

  dashboard: (query?: MetricsDashboardQuery): Promise<MetricsDashboardResponse> =>
    apiGet(`${BASE}/dashboard`, { query }),
};
