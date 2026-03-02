import { create } from "zustand";
import { DonationProps } from "../types/donation.types";
import { LogProps } from "../types/log.types";
import { MetricProps } from "../types/metric.types";
import { UserProps } from "../types/user.types";

export type AdminMetricsDashboard = {
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
    metricType: string;
    total: number;
    avgDurationMs: number;
    p95DurationMs: number;
    errorRate: number;
  }>;
  topBottlenecks: Array<{
    metricName: string;
    metricType: string;
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
    metricType: string;
    source: string;
    durationMs: number;
    occurredAt: string;
    context: Record<string, unknown>;
  }>;
};

type AdminState = {
  users: UserProps[];
  logs: LogProps[];
  metrics: MetricProps[];
  donations: DonationProps[];
  selectedUserId: string | null;
  selectedLogId: string | null;
  selectedMetricId: string | null;
  selectedDonationId: string | null;
  dashboard: AdminMetricsDashboard | null;
  setUsers: (users: UserProps[]) => void;
  setLogs: (logs: LogProps[]) => void;
  setMetrics: (metrics: MetricProps[]) => void;
  setDonations: (donations: DonationProps[]) => void;
  selectUser: (userId: string | null) => void;
  selectLog: (logId: string | null) => void;
  selectMetric: (metricId: string | null) => void;
  selectDonation: (donationId: string | null) => void;
  setDashboard: (dashboard: AdminMetricsDashboard | null) => void;
  clearAdminState: () => void;
};

const initialState = {
  users: [],
  logs: [],
  metrics: [],
  donations: [],
  selectedUserId: null,
  selectedLogId: null,
  selectedMetricId: null,
  selectedDonationId: null,
  dashboard: null,
};

export const useAdminStore = create<AdminState>((set) => ({
  ...initialState,

  setUsers: (users) => set({ users }),
  setLogs: (logs) => set({ logs }),
  setMetrics: (metrics) => set({ metrics }),
  setDonations: (donations) => set({ donations }),

  selectUser: (userId) => set({ selectedUserId: userId }),
  selectLog: (logId) => set({ selectedLogId: logId }),
  selectMetric: (metricId) => set({ selectedMetricId: metricId }),
  selectDonation: (donationId) => set({ selectedDonationId: donationId }),

  setDashboard: (dashboard) => set({ dashboard }),

  clearAdminState: () => set({ ...initialState }),
}));
