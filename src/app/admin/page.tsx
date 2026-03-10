"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import { useAuth } from "../../application/hooks/useAuth";
import { mapDonationApiToDomain, mapDonationDomainToView } from "../../domain/donation/mappers";
import { mapLogApiToDomain, mapLogDomainToView } from "../../domain/log/mappers";
import { mapMetricApiToDomain, mapMetricDomainToView } from "../../domain/metric/mappers";
import { mapUserApiToDomain, mapUserDomainToView } from "../../domain/user/mappers";
import { donationApi } from "../../infra/api/donation.api";
import { galaxyApi } from "../../infra/api/galaxy.api";
import { logApi } from "../../infra/api/log.api";
import { metricApi } from "../../infra/api/metric.api";
import { ActiveBansResponse, AdminUserListItemApiResponse, userApi } from "../../infra/api/user.api";
import { describeApiError } from "../../lib/errors/apiErrorMessage";
import styles from "../../styles/admin.module.css";
import commonStyles from "../../styles/skeleton.module.css";
import { DonationApiResponse, DonationProps } from "../../types/donation.types";
import { GalaxyApiResponse, GalaxyCountsResponse, GalaxyShapeValue, GlobalGalaxyCountsResponse } from "../../types/galaxy.types";
import { LogApiResponse, LogProps } from "../../types/log.types";
import { MetricApiResponse, MetricProps } from "../../types/metric.types";
import { UserApiResponse, UserProps, UserRole } from "../../types/user.types";

type Section = "overview" | "entities" | "users" | "donations" | "logs" | "bans" | "metrics" | "traffic";
type Point = { label: string; value: number };
type GalaxyRow = Omit<GalaxyApiResponse, "createdAt"> & { createdAt: Date };
type ActiveUserBanRow = Omit<ActiveBansResponse["users"][number], "createdAt" | "expiresAt"> & {
  createdAt: Date;
  expiresAt: Date | null;
};
type ActiveIpBanRow = Omit<ActiveBansResponse["ips"][number], "createdAt" | "expiresAt"> & {
  createdAt: Date;
  expiresAt: Date | null;
};
type TrafficPathRow = {
  path: string;
  views: number;
  uniqueSessions: number;
  avgDurationMs: number;
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, value]);
  return debounced;
}

const PAGE_SIZE = 100;
const MAX_FETCH = 1000;
const LOGS_PAGE_SIZE = 30;
const sections: Section[] = ["overview", "entities", "users", "donations", "logs", "bans", "metrics", "traffic"];

const toDateInput = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseDateInput = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};
const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const end = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const totalDaysInRange = (fromDate: Date, toDate: Date) =>
  Math.max(1, Math.floor((start(toDate).getTime() - start(fromDate).getTime()) / (24 * 60 * 60 * 1000)) + 1);
const euro = (minor: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(minor / 100);
const dateText = (d: Date) => new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);
const pct = (n: number, t: number) => (t ? (n / t) * 100 : 0);
const csv = (value: unknown) => {
  const s = String(value ?? "");
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s;
};
const renderLine = (points: Point[], maxTicks: number) => {
  const max = Math.max(1, ...points.map((p) => p.value));
  const w = 560;
  const h = 180;
  const pad = 20;
  const stepX = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  const tickIndexes = (() => {
    if (points.length <= maxTicks) {
      return points.map((_, i) => i);
    }
    const indexes = Array.from({ length: maxTicks }, (_, i) =>
      Math.round((i * (points.length - 1)) / (maxTicks - 1)),
    );
    return Array.from(new Set(indexes));
  })();
  const toY = (v: number) => h - pad - ((v / max) * (h - pad * 2));
  const polyline = points
    .map((p, i) => `${pad + i * stepX},${toY(p.value)}`)
    .join(" ");

  return (
    <div className={styles.lineChartWrap}>
      <svg viewBox={`0 0 ${w} ${h}`} className={styles.lineChartSvg} aria-hidden="true">
        <polyline points={polyline} className={styles.lineChartPath} />
        {points.map((p, i) => {
          const cx = pad + i * stepX;
          const cy = toY(p.value);
          return (
            <circle key={`${p.label}-${i}`} cx={cx} cy={cy} r={3} className={styles.lineChartPoint}>
              <title>{`${p.label}: ${p.value.toFixed(2)}`}</title>
            </circle>
          );
        })}
      </svg>
      <div className={styles.lineChartLabels}>
        {tickIndexes.map((pointIndex, tickIndex) => {
          const point = points[pointIndex];
          const x = pad + pointIndex * stepX;
          const leftPercent = (x / w) * 100;
          const isFirst = tickIndex === 0;
          const isLast = tickIndex === tickIndexes.length - 1;
          const tickClassName = isFirst
            ? `${styles.lineChartTick} ${styles.lineChartTickStart}`
            : isLast
              ? `${styles.lineChartTick} ${styles.lineChartTickEnd}`
              : styles.lineChartTick;

          return (
            <span key={`${point.label}-${pointIndex}`} className={tickClassName} style={{ left: `${leftPercent}%` }}>
              {point.label}
            </span>
          );
        })}
      </div>
      <div className={styles.lineChartCurrent}>
        Current: {points.length ? points[points.length - 1].value.toFixed(0) : "0"}
      </div>
    </div>
  );
};

const renderBars = (points: Point[]) => {
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <div className={styles.chartBars}>
      {points.map((p) => (
        <div key={p.label} className={styles.chartBarItem}>
          <div className={styles.chartBarTrack} title={`${p.label}: ${p.value.toFixed(2)}`}><div className={styles.chartBarFill} style={{ height: `${(p.value / max) * 100}%` }} /></div>
          <span className={styles.chartLabel}>{p.label}</span>
        </div>
      ))}
    </div>
  );
};

const userRoleClassName = (role: string, isSupporter: boolean) => {
  if (role === "Admin") return styles.badgeToneInfo;
  if (isSupporter) return styles.badgeToneSuccess;
  return styles.badgeToneDefault;
};

const donationStatusClassName = (status: string) => {
  if (status === "pending") return styles.badgeToneWarn;
  if (status === "completed" || status === "active") return styles.badgeToneSuccess;
  if (status === "failed" || status === "canceled" || status === "expired") return styles.badgeToneDanger;
  return styles.badgeToneDefault;
};

const logLevelClassName = (level: string) => {
  if (level === "debug") return styles.badgeToneDefault;
  if (level === "info") return styles.badgeToneInfo;
  if (level === "warn") return styles.badgeToneWarn;
  if (level === "error") return styles.badgeToneError;
  if (level === "critical") return styles.badgeToneDanger;
  return styles.badgeToneDefault;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loadMe } = useAuth();
  const checkedRef = useRef(false);

  const [section, setSection] = useState<Section>("overview");
  const [loading, setLoading] = useState(true);
  const [isCompactChart, setIsCompactChart] = useState(false);
  const [from, setFrom] = useState(toDateInput(addDays(new Date(), -30)));
  const [to, setTo] = useState(toDateInput(new Date()));

  const [userSearch, setUserSearch] = useState("");
  const [role, setRole] = useState<"all" | UserRole>("all");
  const [supporter, setSupporter] = useState<"all" | "yes" | "no">("all");
  const [shape, setShape] = useState<"all" | GalaxyShapeValue>("all");
  const [entitySearch, setEntitySearch] = useState("");
  const [logState, setLogState] = useState<"all" | "open" | "resolved">("all");
  const [logLevelFilter, setLogLevelFilter] = useState<"all" | "debug" | "info" | "warn" | "error" | "critical">("all");
  const [logCategoryFilter, setLogCategoryFilter] = useState<"all" | "application" | "security" | "audit" | "infrastructure">("all");
  const [resolveLogLevel, setResolveLogLevel] = useState<"all" | "debug" | "warn" | "error" | "critical">("all");
  const [logsPage, setLogsPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogProps | null>(null);
  const [adminNoteDraft, setAdminNoteDraft] = useState("");
  const [adminNoteSaving, setAdminNoteSaving] = useState(false);
  const [bansListView, setBansListView] = useState<"users" | "ips">("users");

  const [users, setUsers] = useState<UserProps[]>([]);
  const [donations, setDonations] = useState<DonationProps[]>([]);
  const [logs, setLogs] = useState<LogProps[]>([]);
  const [metrics, setMetrics] = useState<MetricProps[]>([]);
  const [bannedUsers, setBannedUsers] = useState<ActiveUserBanRow[]>([]);
  const [bannedIps, setBannedIps] = useState<ActiveIpBanRow[]>([]);
  const [galaxies, setGalaxies] = useState<GalaxyRow[]>([]);
  const [galaxyCounts, setGalaxyCounts] = useState<Record<string, GalaxyCountsResponse>>({});
  const [globalCounts, setGlobalCounts] = useState<GlobalGalaxyCountsResponse | null>(null);
  const [focusGalaxyId, setFocusGalaxyId] = useState<string | null>(null);
  const [totals, setTotals] = useState({ users: 0, donations: 0, logs: 0, metrics: 0, galaxies: 0 });

  const rangeFrom = useMemo(() => start(parseDateInput(from)), [from]);
  const rangeTo = useMemo(() => end(parseDateInput(to)), [to]);
  const debouncedUserSearch = useDebouncedValue(userSearch, 300);
  const debouncedEntitySearch = useDebouncedValue(entitySearch, 300);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    void loadMe().catch(() => router.replace("/login"));
  }, [loadMe, router]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const apply = () => setIsCompactChart(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "Admin") {
      router.replace("/dashboard");
      return;
    }
    const fetchAll = async <T,>(fn: (offset: number) => Promise<{ rows: T[]; total: number }>) => {
      let offset = 0;
      let total = 0;
      const rows: T[] = [];
      while (offset < MAX_FETCH) {
        const page = await fn(offset);
        total = page.total;
        rows.push(...page.rows);
        if (page.rows.length < PAGE_SIZE || rows.length >= page.total) break;
        offset += PAGE_SIZE;
      }
      return { rows, total };
    };
    const load = async () => {
      setLoading(true);
      try {
        const [u, d, l, m, bans, g, gc] = await Promise.all([
          fetchAll((offset) => userApi.list({ orderBy: "createdAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
          fetchAll((offset) => donationApi.list({ orderBy: "createdAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
          fetchAll((offset) => logApi.list({ from: rangeFrom, to: rangeTo, orderBy: "occurredAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
          fetchAll((offset) => metricApi.list({ from: rangeFrom, to: rangeTo, orderBy: "occurredAt", orderDir: "desc", limit: PAGE_SIZE, offset, view: "dashboard" })),
          userApi.listActiveBans(200),
          fetchAll((offset) => galaxyApi.list({ orderBy: "createdAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
          galaxyApi.globalCounts(),
        ]);
        const mappedUsers = u.rows.map((row: UserApiResponse | AdminUserListItemApiResponse) =>
          mapUserDomainToView(
            mapUserApiToDomain("verified" in row ? row : { ...row, verified: row.isVerified }),
          ),
        );
        const mappedDonations = d.rows.map((row: DonationApiResponse) =>
          mapDonationDomainToView(mapDonationApiToDomain(row)),
        );
        const mappedLogs = l.rows.map((row: LogApiResponse) =>
          mapLogDomainToView(mapLogApiToDomain(row)),
        );
        const mappedMetrics = m.rows.map((row: MetricApiResponse) =>
          mapMetricDomainToView(mapMetricApiToDomain(row)),
        );
        const mappedBannedUsers = bans.users.map((row) => ({
          ...row,
          createdAt: new Date(row.createdAt),
          expiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
        }));
        const mappedBannedIps = bans.ips.map((row) => ({
          ...row,
          createdAt: new Date(row.createdAt),
          expiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
        }));
        const mappedGalaxies = g.rows.map((row: GalaxyApiResponse) => ({
          ...row,
          createdAt: new Date(row.createdAt),
        }));
        setUsers(mappedUsers);
        setDonations(mappedDonations);
        setLogs(mappedLogs);
        setMetrics(mappedMetrics);
        setBannedUsers(mappedBannedUsers);
        setBannedIps(mappedBannedIps);
        setGalaxies(mappedGalaxies);
        setGlobalCounts(gc);
        setTotals({ users: u.total, donations: d.total, logs: l.total, metrics: m.total, galaxies: g.total });
      } catch (error: unknown) {
        sileo.error({ title: "Admin data load failed", description: describeApiError(error, "Could not load admin dashboard data.") });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [from, router, to, user, rangeFrom, rangeTo]);

  const usersFiltered = useMemo(
    () =>
      users
        .filter((u) => u.createdAt >= rangeFrom && u.createdAt <= rangeTo)
        .filter((u) => `${u.username} ${u.email}`.toLowerCase().includes(debouncedUserSearch.toLowerCase()))
        .filter((u) => (role === "all" ? true : u.role === role))
        .filter((u) => (supporter === "all" ? true : supporter === "yes" ? u.isSupporter : !u.isSupporter)),
    [debouncedUserSearch, rangeFrom, rangeTo, role, supporter, users],
  );

  const galaxiesFiltered = useMemo(
    () =>
      galaxies
        .filter((g) => g.createdAt >= rangeFrom && g.createdAt <= rangeTo)
        .filter((g) => (shape === "all" ? true : g.shape === shape))
        .filter((g) => g.name.toLowerCase().includes(debouncedEntitySearch.toLowerCase())),
    [debouncedEntitySearch, galaxies, rangeFrom, rangeTo, shape],
  );

  const logsFiltered = useMemo(
    () =>
      logs.filter((log) => {
        if (logLevelFilter !== "all" && log.level !== logLevelFilter) return false;
        if (logCategoryFilter !== "all" && log.category !== logCategoryFilter) return false;
        if (logState === "open") return !log.resolvedAt;
        if (logState === "resolved") return Boolean(log.resolvedAt);
        return true;
      }),
    [logCategoryFilter, logLevelFilter, logState, logs],
  );
  const logsTotalPages = Math.max(1, Math.ceil(logsFiltered.length / LOGS_PAGE_SIZE));
  const logsPageSafe = Math.min(logsPage, logsTotalPages);
  const logsVisible = useMemo(
    () =>
      logsFiltered.slice(
        (logsPageSafe - 1) * LOGS_PAGE_SIZE,
        logsPageSafe * LOGS_PAGE_SIZE,
      ),
    [logsFiltered, logsPageSafe],
  );

  const usersHistoricByDay = useMemo(() => {
    const points: Point[] = [];
    const totalDays = totalDaysInRange(rangeFrom, rangeTo);
    for (let i = 0; i < totalDays; i += 1) {
      const day = addDays(rangeFrom, i);
      const dayEnd = end(day);
      points.push({
        label: `${day.getMonth() + 1}/${day.getDate()}`,
        value: usersFiltered.filter((u) => u.createdAt >= rangeFrom && u.createdAt <= dayEnd).length,
      });
    }
    return points;
  }, [rangeFrom, rangeTo, usersFiltered]);

  const donationsHistoricByDay = useMemo(() => {
    const points: Point[] = [];
    const totalDays = totalDaysInRange(rangeFrom, rangeTo);
    const successful = donations.filter((d) => d.status === "completed" || d.status === "active");
    for (let i = 0; i < totalDays; i += 1) {
      const day = addDays(rangeFrom, i);
      const dayEnd = end(day);
      points.push({
        label: `${day.getMonth() + 1}/${day.getDate()}`,
        value: successful
          .filter((d) => d.createdAt >= rangeFrom && d.createdAt <= dayEnd)
          .reduce((acc, d) => acc + d.amountMinor / 100, 0),
      });
    }
    return points;
  }, [donations, rangeFrom, rangeTo]);

  const galaxyCreationsHistoricByDay = useMemo(() => {
    const points: Point[] = [];
    const totalDays = totalDaysInRange(rangeFrom, rangeTo);
    for (let i = 0; i < totalDays; i += 1) {
      const day = addDays(rangeFrom, i);
      const dayEnd = end(day);
      points.push({
        label: `${day.getMonth() + 1}/${day.getDate()}`,
        value: galaxies.filter((g) => g.createdAt >= rangeFrom && g.createdAt <= dayEnd).length,
      });
    }
    return points;
  }, [galaxies, rangeFrom, rangeTo]);

  const userGlobalCards = useMemo(() => {
    const now = new Date();
    const weekStart = addDays(now, -7);
    const monthStart = addDays(now, -30);
    const yearStart = addDays(now, -365);
    return {
      total: users.length,
      week: users.filter((u) => u.createdAt >= weekStart).length,
      month: users.filter((u) => u.createdAt >= monthStart).length,
      year: users.filter((u) => u.createdAt >= yearStart).length,
    };
  }, [users]);

  const donationGlobalCards = useMemo(() => {
    const successful = donations.filter((d) => d.status === "completed" || d.status === "active");
    return {
      totalAmountMinor: successful.reduce((acc, d) => acc + d.amountMinor, 0),
      activeMonthlySupporters: donations.filter((d) => d.donationType === "monthly" && d.status === "active").length,
    };
  }, [donations]);

  const entityGlobalCards = useMemo(() => {
    return {
      galaxies: globalCounts?.galaxies ?? galaxies.length,
      systems: globalCounts?.systems ?? galaxies.reduce((acc, g) => acc + g.systemCount, 0),
      stars: globalCounts?.stars ?? 0,
      planets: globalCounts?.planets ?? 0,
      moons: globalCounts?.moons ?? 0,
      asteroids: globalCounts?.asteroids ?? 0,
    };
  }, [galaxies, globalCounts]);
  const totalActiveBans = bannedUsers.length + bannedIps.length;
  const adminIssuedBans = [...bannedUsers, ...bannedIps].filter((ban) => ban.source === "admin").length;
  const expiringBans = [...bannedUsers, ...bannedIps].filter((ban) => Boolean(ban.expiresAt)).length;
  const bannedUsersByDay = useMemo(() => {
    const points: Point[] = [];
    const totalDays = totalDaysInRange(rangeFrom, rangeTo);
    for (let i = 0; i < totalDays; i += 1) {
      const day = addDays(rangeFrom, i);
      const dayStart = start(day);
      const dayEnd = end(day);
      points.push({
        label: `${day.getMonth() + 1}/${day.getDate()}`,
        value: bannedUsers.filter((ban) => ban.createdAt >= dayStart && ban.createdAt <= dayEnd).length,
      });
    }
    return points;
  }, [bannedUsers, rangeFrom, rangeTo]);
  const bannedIpsByDay = useMemo(() => {
    const points: Point[] = [];
    const totalDays = totalDaysInRange(rangeFrom, rangeTo);
    for (let i = 0; i < totalDays; i += 1) {
      const day = addDays(rangeFrom, i);
      const dayStart = start(day);
      const dayEnd = end(day);
      points.push({
        label: `${day.getMonth() + 1}/${day.getDate()}`,
        value: bannedIps.filter((ban) => ban.createdAt >= dayStart && ban.createdAt <= dayEnd).length,
      });
    }
    return points;
  }, [bannedIps, rangeFrom, rangeTo]);

  const onExportUsersCsv = () => {
    const rows = [
      ["id", "username", "email", "role", "verified", "isSupporter", "createdAt", "lastActivityAt"].join(","),
      ...usersFiltered.map((u) => [u.id, u.username, u.email, u.role, u.verified, u.isSupporter, u.createdAt.toISOString(), u.lastActivityAt.toISOString()].map(csv).join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadGalaxyCounts = useMemo(
    () => async (galaxyIds: string[]) => {
      const missingIds = galaxyIds.filter((id) => !galaxyCounts[id]);
      if (missingIds.length === 0) return;

      const entries = await Promise.all(
        missingIds.map(async (id) => {
          const counts = await galaxyApi.counts(id);
          return [id, counts] as const;
        }),
      );
      setGalaxyCounts((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    },
    [galaxyCounts],
  );

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const topVisibleIds = galaxiesFiltered.slice(0, 40).map((g) => g.id);
        await loadGalaxyCounts(topVisibleIds);
      } catch (error: unknown) {
        if (!cancelled) {
          sileo.error({ title: "Entity count load failed", description: describeApiError(error, "Could not load galaxy counts.") });
        }
      }
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [galaxiesFiltered, loadGalaxyCounts]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "simulactic:close-embedded-view") {
        setFocusGalaxyId(null);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    setLogsPage(1);
  }, [logState, logLevelFilter, logCategoryFilter, from, to]);

  useEffect(() => {
    setAdminNoteDraft(selectedLog?.adminNote ?? "");
  }, [selectedLog]);

  if (!user) return <p className={commonStyles.meta}>Checking permissions...</p>;
  if (user.role !== "Admin") return null;

  const unresolvedLogs = logs.filter((l) => !l.resolvedAt).length;
  const metricFailures = metrics.filter((m) => !m.success).length;
  const metricByType = (() => {
    const map = new Map<string, { count: number; avg: number; errors: number }>();
    for (const m of metrics) {
      const current = map.get(m.metricType) ?? { count: 0, avg: 0, errors: 0 };
      current.count += 1;
      current.avg += m.durationMs;
      if (!m.success) current.errors += 1;
      map.set(m.metricType, current);
    }
    return Array.from(map.entries()).map(([type, v]) => ({
      type,
      count: v.count,
      avg: v.count ? v.avg / v.count : 0,
      errors: v.errors,
    }));
  })();

  const metricErrors = metrics.filter((m) => !m.success);
  const metricErrorsByType = metricByType.map((item) => ({ label: item.type, value: item.errors }));
  const trafficMetrics = metrics.filter((m) => m.metricName === "traffic.page_view");
  const trafficViewsByDay = (() => {
    const points: Point[] = [];
    const totalDays = totalDaysInRange(rangeFrom, rangeTo);
    for (let i = 0; i < totalDays; i += 1) {
      const day = addDays(rangeFrom, i);
      const dayEnd = end(day);
      points.push({
        label: `${day.getMonth() + 1}/${day.getDate()}`,
        value: trafficMetrics.filter((m) => m.occurredAt >= rangeFrom && m.occurredAt <= dayEnd).length,
      });
    }
    return points;
  })();
  const trafficByPath: TrafficPathRow[] = (() => {
    const map = new Map<string, { views: number; sessions: Set<string>; duration: number }>();
    for (const metric of trafficMetrics) {
      const pathValue =
        typeof metric.context?.pathname === "string"
          ? metric.context.pathname
          : typeof metric.context?.fullPath === "string"
            ? metric.context.fullPath
            : typeof metric.tags?.pathname === "string"
              ? metric.tags.pathname
              : metric.source;
      const sessionId =
        typeof metric.context?.sessionId === "string" ? metric.context.sessionId : null;
      const current = map.get(pathValue) ?? { views: 0, sessions: new Set<string>(), duration: 0 };
      current.views += 1;
      current.duration += metric.durationMs;
      if (sessionId) current.sessions.add(sessionId);
      map.set(pathValue, current);
    }
    return Array.from(map.entries())
      .map(([path, value]) => ({
        path,
        views: value.views,
        uniqueSessions: value.sessions.size,
        avgDurationMs: value.views ? value.duration / value.views : 0,
      }))
      .sort((left, right) => right.views - left.views);
  })();
  const trafficByReferrer = (() => {
    const map = new Map<string, number>();
    for (const metric of trafficMetrics) {
      const referrer =
        typeof metric.context?.referrerHost === "string"
          ? metric.context.referrerHost
          : typeof metric.tags?.referrerHost === "string"
            ? metric.tags.referrerHost
            : "direct";
      map.set(referrer || "direct", (map.get(referrer || "direct") ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 8);
  })();
  const trafficUniqueSessions = new Set(
    trafficMetrics
      .map((metric) => (typeof metric.context?.sessionId === "string" ? metric.context.sessionId : null))
      .filter((value): value is string => Boolean(value)),
  ).size;
  const trafficExternalViews = trafficMetrics.filter((metric) => metric.tags?.externalReferrer === true).length;
  const topTrafficBars = trafficByPath.slice(0, 8).map((item) => ({ label: item.path, value: item.views }));
  const recentTraffic = [...trafficMetrics]
    .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime())
    .slice(0, 20);
  const logByLevel = (() => {
    const levels = ["debug", "info", "warn", "error", "critical"] as const;
    return levels.map((level) => ({ level, count: logs.filter((l) => l.level === level).length }));
  })();
  const logByCategory = (() => {
    const categories = ["application", "security", "audit", "infrastructure"] as const;
    return categories.map((category) => ({ category, count: logs.filter((l) => l.category === category).length }));
  })();
  const openLogs = logs.filter((l) => !l.resolvedAt).length;
  const closedLogs = logs.filter((l) => Boolean(l.resolvedAt)).length;
  const bulkResolvableLogs = logs.filter(
    (log) =>
      !log.resolvedAt &&
      log.level !== "info" &&
      (resolveLogLevel === "all" ? true : log.level === resolveLogLevel),
  );
  const lineChartTicks = isCompactChart ? 5 : 8;

  const resolveLogs = async (logIds: string[]) => {
    await Promise.all(logIds.map((id) => logApi.resolve(id)));
    const resolvedAt = new Date();
    setLogs((prev) =>
      prev.map((item) => (logIds.includes(item.id) ? { ...item, resolvedAt } : item)),
    );
  };

  const patchLogState = (logId: string, patch: Partial<LogProps>) => {
    setLogs((prev) => prev.map((item) => (item.id === logId ? { ...item, ...patch } : item)));
    setSelectedLog((prev) => (prev && prev.id === logId ? { ...prev, ...patch } : prev));
  };

  const reopenLog = async (logId: string) => {
    await logApi.reopen(logId);
    patchLogState(logId, { resolvedAt: null, resolvedBy: null });
  };

  const saveAdminNote = async (logId: string) => {
    const note = adminNoteDraft.trim();
    setAdminNoteSaving(true);
    try {
      await logApi.setAdminNote(logId, { note });
      patchLogState(logId, {
        adminNote: note,
        adminNoteUpdatedAt: new Date(),
        adminNoteUpdatedBy: user?.id ?? null,
      });
    } finally {
      setAdminNoteSaving(false);
    }
  };

  const clearAdminNote = async (logId: string) => {
    setAdminNoteSaving(true);
    try {
      await logApi.deleteAdminNote(logId);
      setAdminNoteDraft("");
      patchLogState(logId, {
        adminNote: null,
        adminNoteUpdatedAt: null,
        adminNoteUpdatedBy: null,
      });
    } finally {
      setAdminNoteSaving(false);
    }
  };

  return (
    <section className={styles.page}>
      <aside className={styles.sidebar}>
        <h1 className={commonStyles.title}>Admin Dashboard</h1>
        <p className={commonStyles.subtitle}>{loading ? "Refreshing..." : "Live operational data"}</p>
        <div className={styles.sidebarActions}>
          {sections.map((s) => (
            <button key={s} type="button" className={section === s ? styles.sidebarButtonActive : styles.sidebarButton} onClick={() => setSection(s)}>
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </aside>

      <article className={styles.content}>
        <section className={styles.card}>
          <h2 className={commonStyles.panelTitle}>Global date filter</h2>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}><label>From</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div className={styles.filterField}><label>To</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </div>
        </section>

        {section === "overview" && (
          <section className={styles.sectionGrid}>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Core KPIs</h2>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}><span>Users</span><strong>{usersFiltered.length}</strong></div>
                <div className={styles.summaryCard}><span>Supporters</span><strong>{usersFiltered.filter((u) => u.isSupporter).length}</strong></div>
                <div className={styles.summaryCard}><span>Total received</span><strong>{euro(donationGlobalCards.totalAmountMinor)}</strong></div>
                <div className={styles.summaryCard}><span>Active monthly donors</span><strong>{donationGlobalCards.activeMonthlySupporters}</strong></div>
                <div className={styles.summaryCard}><span>Unresolved logs</span><strong>{unresolvedLogs}</strong></div>
                <div className={styles.summaryCard}><span>Metric error rate</span><strong>{pct(metricFailures, metrics.length).toFixed(2)}%</strong></div>
              </div>
            </article>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Charts</h2>
              <div className={styles.chartGrid}>
                <div className={styles.chartCard}><h3 className={styles.chartTitle}>Users historic counter (day by day)</h3>{renderLine(usersHistoricByDay, lineChartTicks)}</div>
                <div className={styles.chartCard}><h3 className={styles.chartTitle}>Donations historic counter EUR (day by day)</h3>{renderLine(donationsHistoricByDay, lineChartTicks)}</div>
                <div className={styles.chartCard}><h3 className={styles.chartTitle}>Galaxy creations historic counter (day by day)</h3>{renderLine(galaxyCreationsHistoricByDay, lineChartTicks)}</div>
              </div>
            </article>
          </section>
        )}

        {section === "users" && (
          <section className={styles.sectionGrid}>
            <article className={styles.card}>
              <div className={styles.rowBetween}>
                <h2 className={commonStyles.panelTitle}>Users ({usersFiltered.length} / {totals.users})</h2>
                <button className={styles.exportButton} onClick={onExportUsersCsv}>Export CSV</button>
              </div>
              <div className={styles.filtersGrid}>
                <div className={styles.filterField}><label>Search</label><input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} /></div>
                <div className={styles.filterField}><label>Role</label><select value={role} onChange={(e) => setRole(e.target.value as "all" | UserRole)}><option value="all">All</option><option value="Admin">Admin</option><option value="User">User</option></select></div>
                <div className={styles.filterField}><label>Supporter</label><select value={supporter} onChange={(e) => setSupporter(e.target.value as "all" | "yes" | "no")}><option value="all">All</option><option value="yes">True</option><option value="no">False</option></select></div>
              </div>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}><span>Total users</span><strong>{userGlobalCards.total}</strong></div>
                <div className={styles.summaryCard}><span>This week</span><strong>{userGlobalCards.week}</strong></div>
                <div className={styles.summaryCard}><span>This month</span><strong>{userGlobalCards.month}</strong></div>
                <div className={styles.summaryCard}><span>This year</span><strong>{userGlobalCards.year}</strong></div>
              </div>
              <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Supporter</th><th>Created</th></tr></thead><tbody>{usersFiltered.map((u) => <tr key={u.id}><td>{u.username}</td><td>{u.email}</td><td><span className={`${styles.cellBadge} ${userRoleClassName(u.role, u.isSupporter)}`}>{u.role}</span></td><td>{u.isSupporter ? "Yes" : "No"}</td><td>{dateText(u.createdAt)}</td></tr>)}</tbody></table></div>
            </article>
          </section>
        )}

        {section === "donations" && <section className={styles.sectionGrid}><article className={styles.card}><h2 className={commonStyles.panelTitle}>Donations ({donations.length} / {totals.donations})</h2><div className={styles.summaryGrid}><div className={styles.summaryCard}><span>Total amount</span><strong>{euro(donationGlobalCards.totalAmountMinor)}</strong></div><div className={styles.summaryCard}><span>Active monthly supporters</span><strong>{donationGlobalCards.activeMonthlySupporters}</strong></div></div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>User</th><th>Type</th><th>Status</th><th>Amount</th><th>Created</th></tr></thead><tbody>{donations.map((d) => <tr key={d.id}><td>{d.userId}</td><td>{d.donationType}</td><td><span className={`${styles.cellBadge} ${donationStatusClassName(d.status)}`}>{d.status}</span></td><td>{euro(d.amountMinor)}</td><td>{dateText(d.createdAt)}</td></tr>)}</tbody></table></div></article></section>}
        {section === "logs" && (
          <section className={styles.sectionGrid}>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Logs ({logsFiltered.length} / {totals.logs})</h2>
              <div className={styles.filtersGrid}>
                <div className={styles.filterField}>
                  <label>State</label>
                  <select value={logState} onChange={(e) => setLogState(e.target.value as "all" | "open" | "resolved")}>
                    <option value="all">All</option>
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className={styles.filterField}>
                  <label>Category</label>
                  <select value={logCategoryFilter} onChange={(e) => setLogCategoryFilter(e.target.value as "all" | "application" | "security" | "audit" | "infrastructure")}>
                    <option value="all">All</option>
                    <option value="application">Application</option>
                    <option value="security">Security</option>
                    <option value="audit">Audit</option>
                    <option value="infrastructure">Infrastructure</option>
                  </select>
                </div>
                <div className={styles.filterField}>
                  <label>Level</label>
                  <select value={logLevelFilter} onChange={(e) => setLogLevelFilter(e.target.value as "all" | "debug" | "info" | "warn" | "error" | "critical")}>
                    <option value="all">All</option>
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warn</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}><span>Open logs</span><strong>{openLogs}</strong></div>
                <div className={styles.summaryCard}><span>Closed logs</span><strong>{closedLogs}</strong></div>
              </div>
              <p className={styles.summarySubtitle}>By level totals</p>
              <div className={styles.summaryGrid}>
                {logByLevel.map((item) => <div key={item.level} className={styles.summaryCard}><span>{item.level}</span><strong>{item.count}</strong></div>)}
              </div>
              <p className={styles.summarySubtitle}>By category totals</p>
              <div className={styles.summaryGrid}>
                {logByCategory.map((item) => <div key={item.category} className={styles.summaryCard}><span>{item.category}</span><strong>{item.count}</strong></div>)}
              </div>
              <div className={styles.bulkResolveBar}>
                <div className={styles.bulkResolveControls}>
                  <div className={styles.bulkResolveField}>
                    <label>Resolve level</label>
                    <select value={resolveLogLevel} onChange={(e) => setResolveLogLevel(e.target.value as "all" | "debug" | "warn" | "error" | "critical")}>
                      <option value="all">All</option>
                      <option value="debug">Debug</option>
                      <option value="warn">Warn</option>
                      <option value="error">Error</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <button
                    className={styles.exportButton}
                    disabled={bulkResolvableLogs.length === 0}
                    onClick={() => {
                      void resolveLogs(bulkResolvableLogs.map((log) => log.id)).then(() => {
                        sileo.success({
                          title: "Logs resolved",
                          description: `${bulkResolvableLogs.length} log(s) marked as resolved.`,
                        });
                      }).catch((error: unknown) => {
                        sileo.error({
                          title: "Bulk resolve failed",
                          description: describeApiError(error, "Could not resolve selected logs."),
                        });
                      });
                    }}
                  >
                    Resolve all
                  </button>
                </div>
              </div>
              <div className={styles.paginationBar}>
                <span className={styles.paginationSummary}>
                  Showing {logsFiltered.length === 0 ? 0 : (logsPageSafe - 1) * LOGS_PAGE_SIZE + 1}
                  {" "}-{" "}
                  {Math.min(logsPageSafe * LOGS_PAGE_SIZE, logsFiltered.length)} of {logsFiltered.length}
                </span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>When</th><th>Level</th><th>Category</th><th>Source</th><th>Message</th><th>State</th><th>Action</th><th>Details</th></tr></thead>
                  <tbody>
                    {logsVisible.map((l) => (
                      <tr key={l.id}>
                        <td>{dateText(l.occurredAt)}</td>
                        <td><span className={`${styles.cellBadge} ${logLevelClassName(l.level)}`}>{l.level}</span></td>
                        <td>{l.category}</td>
                        <td>{l.source}</td>
                        <td>{l.message}</td>
                        <td>{l.resolvedAt ? "Resolved" : "Open"}</td>
                        <td>
                          {!l.resolvedAt ? (
                            <button
                              className={styles.exportButton}
                              onClick={() => {
                                void resolveLogs([l.id]).then(() => {
                                  sileo.success({
                                    title: "Log resolved",
                                    description: "The selected log was marked as resolved.",
                                  });
                                }).catch((error: unknown) => {
                                  sileo.error({ title: "Log update failed", description: describeApiError(error, "Could not resolve log.") });
                                });
                              }}
                            >
                              Mark as Resolved
                            </button>
                          ) : l.level !== "info" ? (
                            <button
                              className={styles.exportButton}
                              onClick={() => {
                                void reopenLog(l.id).then(() => {
                                  sileo.success({
                                    title: "Log reopened",
                                    description: "The selected log was marked as open again.",
                                  });
                                }).catch((error: unknown) => {
                                  sileo.error({
                                    title: "Log reopen failed",
                                    description: describeApiError(error, "Could not reopen log."),
                                  });
                                });
                              }}
                            >
                              Reopen
                            </button>
                          ) : (
                            "No action"
                          )}
                        </td>
                        <td>
                          <button className={styles.exportButton} onClick={() => setSelectedLog(l)}>
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.paginationBarCentered}>
                <div className={styles.paginationControls}>
                  <button className={styles.exportButton} disabled={logsPageSafe <= 1} onClick={() => setLogsPage((prev) => Math.max(1, prev - 1))}>
                    Prev
                  </button>
                  <span className={styles.paginationSummary}>Page {logsPageSafe} / {logsTotalPages}</span>
                  <button className={styles.exportButton} disabled={logsPageSafe >= logsTotalPages} onClick={() => setLogsPage((prev) => Math.min(logsTotalPages, prev + 1))}>
                    Next
                  </button>
                </div>
              </div>
            </article>
          </section>
        )}
        {section === "metrics" && (
          <section className={styles.sectionGrid}>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Global metric cards</h2>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}><span>Total metrics</span><strong>{metrics.length}</strong></div>
                <div className={styles.summaryCard}><span>Total errors</span><strong>{metricErrors.length}</strong></div>
                <div className={styles.summaryCard}><span>Error rate</span><strong>{pct(metricErrors.length, metrics.length).toFixed(2)}%</strong></div>
                <div className={styles.summaryCard}><span>Avg duration</span><strong>{metrics.length ? (metrics.reduce((acc, m) => acc + m.durationMs, 0) / metrics.length).toFixed(2) : "0.00"} ms</strong></div>
              </div>
            </article>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Metrics by type (responses and averages)</h2>
              <div className={styles.summaryGrid}>
                {metricByType.map((item) => (
                  <div key={item.type} className={styles.summaryCard}>
                    <span>{item.type}</span>
                    <strong>{item.count} req</strong>
                    <span>avg {item.avg.toFixed(2)} ms</span>
                    <span>errors {item.errors}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Errors by metric type</h2>
              {renderBars(metricErrorsByType)}
            </article>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Metric errors list ({metricErrors.length})</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>When</th><th>Name</th><th>Type</th><th>Source</th><th>Duration</th></tr></thead>
                  <tbody>
                    {metricErrors.map((m) => (
                      <tr key={`${m.id}-${m.occurredAt.getTime()}-${m.metricName}-${m.source}`}>
                        <td>{dateText(m.occurredAt)}</td>
                        <td>{m.metricName}</td>
                        <td>{m.metricType}</td>
                        <td>{m.source}</td>
                        <td>{m.durationMs.toFixed(2)} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        )}

        {section === "traffic" && (
          <section className={styles.sectionGrid}>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Traffic overview</h2>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}><span>Page views</span><strong>{trafficMetrics.length}</strong></div>
                <div className={styles.summaryCard}><span>Unique sessions</span><strong>{trafficUniqueSessions}</strong></div>
                <div className={styles.summaryCard}><span>Tracked routes</span><strong>{trafficByPath.length}</strong></div>
                <div className={styles.summaryCard}><span>External referrals</span><strong>{trafficExternalViews}</strong></div>
              </div>
            </article>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Traffic trend by day</h2>
              {renderLine(trafficViewsByDay, lineChartTicks)}
            </article>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Top visited paths</h2>
              {renderBars(topTrafficBars)}
            </article>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Top referrers</h2>
              <div className={styles.summaryGrid}>
                {trafficByReferrer.length === 0 ? (
                  <div className={styles.summaryCard}><span>No traffic tracked yet</span><strong>0</strong></div>
                ) : (
                  trafficByReferrer.map((item) => (
                    <div key={item.label} className={styles.summaryCard}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))
                )}
              </div>
            </article>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Route breakdown</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Path</th><th>Views</th><th>Unique sessions</th><th>Avg duration</th></tr></thead>
                  <tbody>
                    {trafficByPath.map((item) => (
                      <tr key={item.path}>
                        <td>{item.path}</td>
                        <td>{item.views}</td>
                        <td>{item.uniqueSessions}</td>
                        <td>{item.avgDurationMs.toFixed(2)} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Recent page views</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>When</th><th>Path</th><th>Referrer</th><th>Session</th><th>Viewport</th></tr></thead>
                  <tbody>
                    {recentTraffic.map((metric, index) => {
                      const viewport =
                        metric.context?.viewport &&
                        typeof metric.context.viewport === "object" &&
                        metric.context.viewport !== null &&
                        "width" in metric.context.viewport &&
                        "height" in metric.context.viewport
                          ? `${String(metric.context.viewport.width)}x${String(metric.context.viewport.height)}`
                          : "-";
                      const path =
                        typeof metric.context?.fullPath === "string"
                          ? metric.context.fullPath
                          : typeof metric.context?.pathname === "string"
                            ? metric.context.pathname
                            : "-";
                      const referrer =
                        typeof metric.context?.referrerHost === "string"
                          ? metric.context.referrerHost
                          : typeof metric.tags?.referrerHost === "string"
                            ? metric.tags.referrerHost
                            : "direct";
                      const session =
                        typeof metric.context?.sessionId === "string"
                          ? metric.context.sessionId.slice(0, 8)
                          : "-";

                      return (
                        <tr key={`${metric.id}-${metric.occurredAt.getTime()}-${path}-${session}-${index}`}>
                          <td>{dateText(metric.occurredAt)}</td>
                          <td>{path}</td>
                          <td>{referrer || "direct"}</td>
                          <td>{session}</td>
                          <td>{viewport}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        )}

        {section === "bans" && (
          <section className={styles.sectionGrid}>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Active bans overview</h2>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}><span>Total active bans</span><strong>{totalActiveBans}</strong></div>
                <div className={styles.summaryCard}><span>Banned users</span><strong>{bannedUsers.length}</strong></div>
                <div className={styles.summaryCard}><span>Banned IPs</span><strong>{bannedIps.length}</strong></div>
                <div className={styles.summaryCard}><span>Admin issued</span><strong>{adminIssuedBans}</strong></div>
                <div className={styles.summaryCard}><span>System issued</span><strong>{totalActiveBans - adminIssuedBans}</strong></div>
                <div className={styles.summaryCard}><span>Expiring bans</span><strong>{expiringBans}</strong></div>
              </div>
            </article>
            <article className={styles.card}>
              <div className={styles.chartGrid}>
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>User bans by day</h3>
                  {renderLine(bannedUsersByDay, lineChartTicks)}
                </div>
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>IP bans by day</h3>
                  {renderLine(bannedIpsByDay, lineChartTicks)}
                </div>
              </div>
            </article>
            <article className={styles.card}>
              <div className={styles.rowBetween}>
                <h2 className={commonStyles.panelTitle}>Active ban list</h2>
                <div className={styles.inlineToggleGroup}>
                  <button
                    className={bansListView === "users" ? styles.inlineToggleActive : styles.inlineToggle}
                    onClick={() => setBansListView("users")}
                  >
                    Users
                  </button>
                  <button
                    className={bansListView === "ips" ? styles.inlineToggleActive : styles.inlineToggle}
                    onClick={() => setBansListView("ips")}
                  >
                    IPs
                  </button>
                </div>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    {bansListView === "users"
                      ? <tr><th>User ID</th><th>Reason</th><th>Source</th><th>Banned by</th><th>Created</th><th>Expires</th></tr>
                      : <tr><th>IP address</th><th>Reason</th><th>Source</th><th>Banned by</th><th>Created</th><th>Expires</th></tr>}
                  </thead>
                  <tbody>
                    {bansListView === "users"
                      ? (bannedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6}>No active user bans.</td>
                        </tr>
                      ) : (
                        bannedUsers.map((ban) => (
                          <tr key={ban.id}>
                            <td>{ban.userId}</td>
                            <td>{ban.reason}</td>
                            <td><span className={styles.cellBadge}>{ban.source}</span></td>
                            <td>{ban.bannedBy ?? "-"}</td>
                            <td>{dateText(ban.createdAt)}</td>
                            <td>{ban.expiresAt ? dateText(ban.expiresAt) : "Never"}</td>
                          </tr>
                        ))
                      ))
                      : (bannedIps.length === 0 ? (
                        <tr>
                          <td colSpan={6}>No active IP bans.</td>
                        </tr>
                      ) : (
                        bannedIps.map((ban) => (
                          <tr key={ban.id}>
                            <td>{ban.ipAddress}</td>
                            <td>{ban.reason}</td>
                            <td><span className={styles.cellBadge}>{ban.source}</span></td>
                            <td>{ban.bannedBy ?? "-"}</td>
                            <td>{dateText(ban.createdAt)}</td>
                            <td>{ban.expiresAt ? dateText(ban.expiresAt) : "Never"}</td>
                          </tr>
                        ))
                      ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        )}

        {section === "entities" && (
          <section className={styles.sectionGrid}>
            <article className={styles.card}>
              <div className={styles.rowBetween}>
                <h2 className={commonStyles.panelTitle}>Galaxies ({galaxiesFiltered.length} / {totals.galaxies})</h2>
                <button className={styles.exportButton} onClick={() => void loadGalaxyCounts(galaxiesFiltered.map((g) => g.id))}>Refresh counts</button>
              </div>
              <div className={styles.filtersGrid}>
                <div className={styles.filterField}><label>Search</label><input value={entitySearch} onChange={(e) => setEntitySearch(e.target.value)} /></div>
                <div className={styles.filterField}><label>Shape</label><select value={shape} onChange={(e) => setShape(e.target.value as "all" | GalaxyShapeValue)}><option value="all">All</option><option value="spherical">Spherical</option><option value="3-arm spiral">3-arm spiral</option><option value="5-arm spiral">5-arm spiral</option><option value="irregular">Irregular</option></select></div>
              </div>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}><span>Total galaxies</span><strong>{entityGlobalCards.galaxies}</strong></div>
                <div className={styles.summaryCard}><span>Total systems</span><strong>{entityGlobalCards.systems}</strong></div>
                <div className={styles.summaryCard}><span>Total stars</span><strong>{entityGlobalCards.stars}</strong></div>
                <div className={styles.summaryCard}><span>Total planets</span><strong>{entityGlobalCards.planets}</strong></div>
                <div className={styles.summaryCard}><span>Total moons</span><strong>{entityGlobalCards.moons}</strong></div>
                <div className={styles.summaryCard}><span>Total asteroids</span><strong>{entityGlobalCards.asteroids}</strong></div>
              </div>
              <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Name</th><th>Shape</th><th>Systems</th><th>Stars</th><th>Planets</th><th>Moons</th><th>Asteroids</th><th>Action</th></tr></thead><tbody>{galaxiesFiltered.map((g) => <tr key={g.id}><td>{g.name}</td><td>{g.shape}</td><td>{galaxyCounts[g.id]?.systems ?? g.systemCount}</td><td>{galaxyCounts[g.id]?.stars ?? "-"}</td><td>{galaxyCounts[g.id]?.planets ?? "-"}</td><td>{galaxyCounts[g.id]?.moons ?? "-"}</td><td>{galaxyCounts[g.id]?.asteroids ?? "-"}</td><td><button className={styles.exportButton} onClick={() => setFocusGalaxyId(g.id)}>Go to</button></td></tr>)}</tbody></table></div>
            </article>
          </section>
        )}
      </article>
      {focusGalaxyId && (
        <div className={styles.fullscreenModal}>
          <button className={styles.fullscreenClose} onClick={() => setFocusGalaxyId(null)}>Close</button>
          <iframe className={styles.fullscreenFrame} src={`/dashboard?galaxyId=${focusGalaxyId}&embed=1`} title="Galaxy interactive view" />
        </div>
      )}
      {selectedLog && (
        <div className={styles.logDetailsBackdrop}>
          <div className={styles.logDetailsCard}>
            <div className={styles.rowBetween}>
              <h3 className={commonStyles.panelTitle}>Log Details</h3>
              <button className={styles.exportButton} onClick={() => setSelectedLog(null)}>Close</button>
            </div>
            <section className={styles.adminNoteBlock}>
              <div className={styles.rowBetween}>
                <div>
                  <p className={styles.adminNoteLabel}>Admin note</p>
                  <p className={styles.adminNoteMeta}>
                    {selectedLog.adminNoteUpdatedAt
                      ? `Last updated ${dateText(selectedLog.adminNoteUpdatedAt)}${selectedLog.adminNoteUpdatedBy ? ` by ${selectedLog.adminNoteUpdatedBy}` : ""}`
                      : "No admin note saved yet"}
                  </p>
                </div>
              </div>
              <textarea
                className={styles.adminNoteTextarea}
                value={adminNoteDraft}
                onChange={(e) => setAdminNoteDraft(e.target.value)}
                placeholder="Add internal handling notes for this log."
                rows={4}
              />
              <div className={styles.adminNoteActions}>
                <button
                  className={styles.exportButton}
                  disabled={adminNoteSaving || adminNoteDraft.trim().length === 0 || adminNoteDraft.trim() === (selectedLog.adminNote ?? "")}
                  onClick={() => {
                    void saveAdminNote(selectedLog.id).then(() => {
                      sileo.success({
                        title: "Admin note saved",
                        description: "The log note was updated.",
                      });
                    }).catch((error: unknown) => {
                      sileo.error({
                        title: "Admin note save failed",
                        description: describeApiError(error, "Could not save the admin note."),
                      });
                    });
                  }}
                >
                  Save note
                </button>
                <button
                  className={styles.exportButton}
                  disabled={adminNoteSaving || !selectedLog.adminNote}
                  onClick={() => {
                    void clearAdminNote(selectedLog.id).then(() => {
                      sileo.success({
                        title: "Admin note deleted",
                        description: "The log note was cleared.",
                      });
                    }).catch((error: unknown) => {
                      sileo.error({
                        title: "Admin note delete failed",
                        description: describeApiError(error, "Could not delete the admin note."),
                      });
                    });
                  }}
                >
                  Delete note
                </button>
              </div>
            </section>
            <pre className={styles.logDetailsPre}>{JSON.stringify(selectedLog, null, 2)}</pre>
          </div>
        </div>
      )}
    </section>
  );
}
