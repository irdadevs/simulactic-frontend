import { useEffect, useState } from "react";
import { TrafficAnalyticsResponse } from "../../infra/api/metric.api";
import { ActiveBansResponse } from "../../infra/api/user.api";
import styles from "../../styles/admin.module.css";
import { GalaxyApiResponse } from "../../types/galaxy.types";
import { LogProps } from "../../types/log.types";

export type GalaxyRow = Omit<GalaxyApiResponse, "createdAt"> & { createdAt: Date };
export type ActiveUserBanRow = Omit<ActiveBansResponse["users"][number], "createdAt" | "expiresAt"> & {
  createdAt: Date;
  expiresAt: Date | null;
};
export type ActiveIpBanRow = Omit<ActiveBansResponse["ips"][number], "createdAt" | "expiresAt"> & {
  createdAt: Date;
  expiresAt: Date | null;
};
export type TrafficAnalyticsState = {
  overview: TrafficAnalyticsResponse["overview"];
  viewsByDay: Array<{ date: Date; views: number }>;
  routes: TrafficAnalyticsResponse["routes"];
  referrers: TrafficAnalyticsResponse["referrers"];
  recentViews: Array<{
    id: string;
    occurredAt: Date;
    path: string | null;
    fullPath: string | null;
    referrerHost: string | null;
    sessionId: string | null;
    viewport: { width: number; height: number } | null;
    durationMs: number;
  }>;
};
export type BanDraft =
  | { kind: "user"; logId: string; userId: string; ipAddress: null }
  | { kind: "ip"; logId: string; userId: null; ipAddress: string };
export type SectionLoadState = {
  loading: boolean;
  error: string | null;
};

export const PAGE_SIZE = 100;
export const MAX_FETCH = 1000;
export const LOGS_PAGE_SIZE = 30;
export const USERS_PAGE_SIZE = 30;
export const DONATIONS_PAGE_SIZE = 30;
export const ENTITIES_PAGE_SIZE = 30;
export const BANS_PAGE_SIZE = 30;
export const TRAFFIC_ROUTES_PAGE_SIZE = 30;
export const TRAFFIC_RECENT_PAGE_SIZE = 30;
export const TRAFFIC_MAX_RANGE_DAYS = 366;

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, value]);
  return debounced;
}

export const toDateInput = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const toDateTimeInput = (d: Date) =>
  `${toDateInput(d)}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
export const parseDateInput = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};
export const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
export const end = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
export const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
export const totalDaysInRange = (fromDate: Date, toDate: Date) =>
  Math.max(1, Math.floor((start(toDate).getTime() - start(fromDate).getTime()) / (24 * 60 * 60 * 1000)) + 1);
export const euro = (minor: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(minor / 100);
export const dateText = (d: Date) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
export const pct = (n: number, t: number) => (t ? (n / t) * 100 : 0);
export const csv = (value: unknown) => {
  const s = String(value ?? "");
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const readContextString = (context: Record<string, unknown>, keys: string[]): string | null => {
  for (const key of keys) {
    const value = context[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return null;
};

const readNestedContextString = (value: unknown, keys: Set<string>): string | null => {
  if (value == null || typeof value === "string") return null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = readNestedContextString(entry, keys);
      if (found) return found;
    }
    return null;
  }
  if (typeof value !== "object") return null;

  for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
    if (keys.has(key) && typeof inner === "string" && inner.trim().length > 0) {
      return inner;
    }
    const found = readNestedContextString(inner, keys);
    if (found) return found;
  }
  return null;
};

const readFirstUuid = (value: unknown): string | null => {
  if (typeof value === "string") {
    return UUID_PATTERN.test(value.trim()) ? value.trim() : null;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = readFirstUuid(entry);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const inner of Object.values(value as Record<string, unknown>)) {
      const found = readFirstUuid(inner);
      if (found) return found;
    }
  }
  return null;
};

export const getBanUserTarget = (log: LogProps): string | null =>
  log.userId ??
  readContextString(log.context, ["userId", "targetUserId", "actorUserId", "subjectUserId", "ownerId"]) ??
  readNestedContextString(
    log.context,
    new Set(["userId", "targetUserId", "actorUserId", "subjectUserId", "ownerId", "id"]),
  ) ??
  readFirstUuid(log.context);

export const getBanIpTarget = (log: LogProps): string | null =>
  log.ip ?? readContextString(log.context, ["ip", "ipAddress", "clientIp", "remoteIp"]);

export const userRoleClassName = (role: string, isSupporter: boolean) => {
  if (role === "Admin") return styles.badgeToneInfo;
  if (isSupporter) return styles.badgeToneSuccess;
  return styles.badgeToneDefault;
};

export const donationStatusClassName = (status: string) => {
  if (status === "pending") return styles.badgeToneWarn;
  if (status === "completed" || status === "active") return styles.badgeToneSuccess;
  if (status === "failed" || status === "canceled" || status === "expired") return styles.badgeToneDanger;
  return styles.badgeToneDefault;
};

export const logLevelClassName = (level: string) => {
  if (level === "debug") return styles.badgeToneDefault;
  if (level === "info") return styles.badgeToneInfo;
  if (level === "warn") return styles.badgeToneWarn;
  if (level === "error") return styles.badgeToneError;
  if (level === "critical") return styles.badgeToneDanger;
  return styles.badgeToneDefault;
};
