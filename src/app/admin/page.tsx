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
import { userApi } from "../../infra/api/user.api";
import { describeApiError } from "../../lib/errors/apiErrorMessage";
import styles from "../../styles/admin.module.css";
import commonStyles from "../../styles/skeleton.module.css";
import { GalaxyShapeValue } from "../../types/galaxy.types";
import { UserRole } from "../../types/user.types";

type Section = "overview" | "users" | "donations" | "logs" | "metrics" | "entities";
type Point = { label: string; value: number };
type GalaxyReport = { stars: number; planets: number; moons: number; asteroids: number };

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
const sections: Section[] = ["overview", "users", "donations", "logs", "metrics", "entities"];

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
const renderLine = (points: Point[]) => {
  const max = Math.max(1, ...points.map((p) => p.value));
  const w = 560;
  const h = 180;
  const pad = 20;
  const stepX = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  const maxTicks = 8;
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

export default function AdminPage() {
  const router = useRouter();
  const { user, loadMe } = useAuth();
  const checkedRef = useRef(false);

  const [section, setSection] = useState<Section>("overview");
  const [loading, setLoading] = useState(true);
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
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [galaxies, setGalaxies] = useState<any[]>([]);
  const [reports, setReports] = useState<Record<string, GalaxyReport>>({});
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
        const [u, d, l, m, g] = await Promise.all([
          fetchAll((offset) => userApi.list({ orderBy: "createdAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
          fetchAll((offset) => donationApi.list({ orderBy: "createdAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
          fetchAll((offset) => logApi.list({ from: rangeFrom, to: rangeTo, orderBy: "occurredAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
          fetchAll((offset) => metricApi.list({ from: rangeFrom, to: rangeTo, orderBy: "occurredAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
          fetchAll((offset) => galaxyApi.list({ orderBy: "createdAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
        ]);
        const mappedUsers = u.rows.map((row: any) => mapUserDomainToView(mapUserApiToDomain("verified" in row ? row : { ...row, verified: row.isVerified })));
        const mappedDonations = d.rows.map((row: any) => mapDonationDomainToView(mapDonationApiToDomain(row)));
        const mappedLogs = l.rows.map((row: any) => mapLogDomainToView(mapLogApiToDomain(row)));
        const mappedMetrics = m.rows.map((row: any) => mapMetricDomainToView(mapMetricApiToDomain(row)));
        const mappedGalaxies = g.rows.map((row: any) => ({ ...row, createdAt: new Date(row.createdAt) }));
        setUsers(mappedUsers);
        setDonations(mappedDonations);
        setLogs(mappedLogs);
        setMetrics(mappedMetrics);
        setGalaxies(mappedGalaxies);
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
    const reported = galaxies.map((g) => reports[g.id]).filter(Boolean) as GalaxyReport[];
    return {
      galaxies: galaxies.length,
      stars: reported.reduce((acc, r) => acc + r.stars, 0),
      planets: reported.reduce((acc, r) => acc + r.planets, 0),
      moons: reported.reduce((acc, r) => acc + r.moons, 0),
      asteroids: reported.reduce((acc, r) => acc + r.asteroids, 0),
    };
  }, [galaxies, reports]);

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

  const onGenerateReports = async () => {
    try {
      const next: Record<string, GalaxyReport> = {};
      for (const g of galaxiesFiltered.slice(0, 25)) {
        const pop = await galaxyApi.populate(g.id);
        let stars = 0;
        let planets = 0;
        let moons = 0;
        let asteroids = 0;
        for (const s of pop.systems) {
          stars += s.stars.length;
          planets += s.planets.length;
          asteroids += s.asteroids.length;
          for (const p of s.planets) moons += p.moons.length;
        }
        next[g.id] = { stars, planets, moons, asteroids };
      }
      setReports((prev) => ({ ...prev, ...next }));
    } catch (error: unknown) {
      sileo.error({ title: "Entity report failed", description: describeApiError(error, "Could not generate entity report.") });
    }
  };

  useEffect(() => {
    const missing = galaxies.filter((g) => !reports[g.id]);
    if (missing.length === 0) return;

    let canceled = false;
    const hydrate = async () => {
      const next: Record<string, GalaxyReport> = {};
      for (const g of missing) {
        if (canceled) break;
        try {
          const pop = await galaxyApi.populate(g.id);
          let stars = 0;
          let planets = 0;
          let moons = 0;
          let asteroids = 0;
          for (const s of pop.systems) {
            stars += s.stars.length;
            planets += s.planets.length;
            asteroids += s.asteroids.length;
            for (const p of s.planets) moons += p.moons.length;
          }
          next[g.id] = { stars, planets, moons, asteroids };
        } catch {}
      }
      if (!canceled && Object.keys(next).length > 0) {
        setReports((prev) => ({ ...prev, ...next }));
      }
    };
    void hydrate();
    return () => {
      canceled = true;
    };
  }, [galaxies, reports]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "simulactic:close-embedded-view") {
        setFocusGalaxyId(null);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

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
                <div className={styles.chartCard}><h3 className={styles.chartTitle}>Users historic counter (day by day)</h3>{renderLine(usersHistoricByDay)}</div>
                <div className={styles.chartCard}><h3 className={styles.chartTitle}>Donations historic counter EUR (day by day)</h3>{renderLine(donationsHistoricByDay)}</div>
                <div className={styles.chartCard}><h3 className={styles.chartTitle}>Galaxy creations historic counter (day by day)</h3>{renderLine(galaxyCreationsHistoricByDay)}</div>
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
              <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Supporter</th><th>Created</th></tr></thead><tbody>{usersFiltered.map((u) => <tr key={u.id}><td>{u.username}</td><td>{u.email}</td><td>{u.role}</td><td>{u.isSupporter ? "Yes" : "No"}</td><td>{dateText(u.createdAt)}</td></tr>)}</tbody></table></div>
            </article>
          </section>
        )}

        {section === "donations" && <section className={styles.sectionGrid}><article className={styles.card}><h2 className={commonStyles.panelTitle}>Donations ({donations.length} / {totals.donations})</h2><div className={styles.summaryGrid}><div className={styles.summaryCard}><span>Total amount</span><strong>{euro(donationGlobalCards.totalAmountMinor)}</strong></div><div className={styles.summaryCard}><span>Active monthly supporters</span><strong>{donationGlobalCards.activeMonthlySupporters}</strong></div></div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>User</th><th>Type</th><th>Status</th><th>Amount</th><th>Created</th></tr></thead><tbody>{donations.map((d) => <tr key={d.id}><td>{d.userId}</td><td>{d.donationType}</td><td>{d.status}</td><td>{euro(d.amountMinor)}</td><td>{dateText(d.createdAt)}</td></tr>)}</tbody></table></div></article></section>}
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
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>When</th><th>Level</th><th>Category</th><th>Source</th><th>Message</th><th>State</th><th>Action</th><th>Details</th></tr></thead>
                  <tbody>
                    {logsFiltered.map((l) => (
                      <tr key={l.id}>
                        <td>{dateText(l.occurredAt)}</td>
                        <td>{l.level}</td>
                        <td>{l.category}</td>
                        <td>{l.source}</td>
                        <td>{l.message}</td>
                        <td>{l.resolvedAt ? "Resolved" : "Open"}</td>
                        <td>
                          {!l.resolvedAt ? (
                            <button
                              className={styles.exportButton}
                              onClick={() => {
                                void logApi.resolve(l.id).then(() => {
                                  setLogs((prev) => prev.map((item) => (item.id === l.id ? { ...item, resolvedAt: new Date() } : item)));
                                }).catch((error: unknown) => {
                                  sileo.error({ title: "Log update failed", description: describeApiError(error, "Could not resolve log.") });
                                });
                              }}
                            >
                              Mark as Resolved
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
                      <tr key={m.id}>
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

        {section === "entities" && (
          <section className={styles.sectionGrid}>
            <article className={styles.card}>
              <div className={styles.rowBetween}>
                <h2 className={commonStyles.panelTitle}>Galaxies ({galaxiesFiltered.length} / {totals.galaxies})</h2>
                <button className={styles.exportButton} onClick={() => void onGenerateReports()}>Generate detailed report</button>
              </div>
              <div className={styles.filtersGrid}>
                <div className={styles.filterField}><label>Search</label><input value={entitySearch} onChange={(e) => setEntitySearch(e.target.value)} /></div>
                <div className={styles.filterField}><label>Shape</label><select value={shape} onChange={(e) => setShape(e.target.value as "all" | GalaxyShapeValue)}><option value="all">All</option><option value="spherical">Spherical</option><option value="3-arm spiral">3-arm spiral</option><option value="5-arm spiral">5-arm spiral</option><option value="irregular">Irregular</option></select></div>
              </div>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}><span>Total galaxies</span><strong>{entityGlobalCards.galaxies}</strong></div>
                <div className={styles.summaryCard}><span>Total stars</span><strong>{entityGlobalCards.stars}</strong></div>
                <div className={styles.summaryCard}><span>Total planets</span><strong>{entityGlobalCards.planets}</strong></div>
                <div className={styles.summaryCard}><span>Total moons</span><strong>{entityGlobalCards.moons}</strong></div>
                <div className={styles.summaryCard}><span>Total asteroids</span><strong>{entityGlobalCards.asteroids}</strong></div>
              </div>
              <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Name</th><th>Shape</th><th>Systems</th><th>Stars</th><th>Planets</th><th>Moons</th><th>Asteroids</th><th>Action</th></tr></thead><tbody>{galaxiesFiltered.map((g) => <tr key={g.id}><td>{g.name}</td><td>{g.shape}</td><td>{g.systemCount}</td><td>{reports[g.id]?.stars ?? "-"}</td><td>{reports[g.id]?.planets ?? "-"}</td><td>{reports[g.id]?.moons ?? "-"}</td><td>{reports[g.id]?.asteroids ?? "-"}</td><td><button className={styles.exportButton} onClick={() => setFocusGalaxyId(g.id)}>Go to</button></td></tr>)}</tbody></table></div>
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
            <pre className={styles.logDetailsPre}>{JSON.stringify(selectedLog, null, 2)}</pre>
          </div>
        </div>
      )}
    </section>
  );
}
