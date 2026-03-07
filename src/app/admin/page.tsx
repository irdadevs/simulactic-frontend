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

const PAGE_SIZE = 100;
const MAX_FETCH = 1000;
const sections: Section[] = ["overview", "users", "donations", "logs", "metrics", "entities"];

const toDateInput = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const end = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const euro = (minor: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(minor / 100);
const dateText = (d: Date) => new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);
const pct = (n: number, t: number) => (t ? (n / t) * 100 : 0);
const csv = (value: unknown) => {
  const s = String(value ?? "");
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s;
};
const renderBars = (points: Point[]) => {
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <div className={styles.chartBars}>
      {points.map((p) => (
        <div key={p.label} className={styles.chartBarItem}>
          <div className={styles.chartBarTrack}><div className={styles.chartBarFill} style={{ height: `${(p.value / max) * 100}%` }} /></div>
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
  const [shape, setShape] = useState<"all" | GalaxyShapeValue>("all");
  const [entitySearch, setEntitySearch] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [galaxies, setGalaxies] = useState<any[]>([]);
  const [reports, setReports] = useState<Record<string, GalaxyReport>>({});
  const [totals, setTotals] = useState({ users: 0, donations: 0, logs: 0, metrics: 0, galaxies: 0 });

  const rangeFrom = useMemo(() => start(new Date(from)), [from]);
  const rangeTo = useMemo(() => end(new Date(to)), [to]);

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
          fetchAll((offset) => userApi.list({ search: userSearch || undefined, orderBy: "createdAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
          fetchAll((offset) => donationApi.list({ orderBy: "createdAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
          fetchAll((offset) => logApi.list({ from: rangeFrom, to: rangeTo, orderBy: "occurredAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
          fetchAll((offset) => metricApi.list({ from: rangeFrom, to: rangeTo, orderBy: "occurredAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
          fetchAll((offset) => galaxyApi.list({ search: entitySearch || undefined, orderBy: "createdAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
        ]);
        const mappedUsers = u.rows.map((row: any) => mapUserDomainToView(mapUserApiToDomain("verified" in row ? row : { ...row, verified: row.isVerified }))).filter((x: any) => x.createdAt >= rangeFrom && x.createdAt <= rangeTo);
        const mappedDonations = d.rows.map((row: any) => mapDonationDomainToView(mapDonationApiToDomain(row))).filter((x: any) => x.createdAt >= rangeFrom && x.createdAt <= rangeTo);
        const mappedLogs = l.rows.map((row: any) => mapLogDomainToView(mapLogApiToDomain(row)));
        const mappedMetrics = m.rows.map((row: any) => mapMetricDomainToView(mapMetricApiToDomain(row)));
        const mappedGalaxies = g.rows.map((row: any) => ({ ...row, createdAt: new Date(row.createdAt) })).filter((x: any) => x.createdAt >= rangeFrom && x.createdAt <= rangeTo);
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
  }, [entitySearch, from, router, to, user, userSearch, rangeFrom, rangeTo]);

  const usersFiltered = useMemo(() => users.filter((u) => (role === "all" ? true : u.role === role)), [role, users]);
  const galaxiesFiltered = useMemo(() => galaxies.filter((g) => (shape === "all" ? true : g.shape === shape)), [galaxies, shape]);

  const usersHistoricByDay = useMemo(() => {
    const points: Point[] = [];
    const endDate = new Date(to);
    for (let i = 13; i >= 0; i -= 1) {
      const day = addDays(endDate, -i);
      const dayEnd = end(day);
      points.push({
        label: `${day.getMonth() + 1}/${day.getDate()}`,
        value: usersFiltered.filter((u) => u.createdAt <= dayEnd).length,
      });
    }
    return points;
  }, [to, usersFiltered]);

  const donationsHistoricByDay = useMemo(() => {
    const points: Point[] = [];
    const endDate = new Date(to);
    const successful = donations.filter((d) => d.status === "completed" || d.status === "active");
    for (let i = 13; i >= 0; i -= 1) {
      const day = addDays(endDate, -i);
      const dayEnd = end(day);
      points.push({
        label: `${day.getMonth() + 1}/${day.getDate()}`,
        value: successful
          .filter((d) => d.createdAt <= dayEnd)
          .reduce((acc, d) => acc + d.amountMinor / 100, 0),
      });
    }
    return points;
  }, [donations, to]);

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

  if (!user) return <p className={commonStyles.meta}>Checking permissions...</p>;
  if (user.role !== "Admin") return null;

  const totalReceived = donations.filter((d) => d.status === "completed" || d.status === "active").reduce((acc, d) => acc + d.amountMinor, 0);
  const monthlyActive = donations.filter((d) => d.donationType === "monthly" && d.status === "active").length;
  const unresolvedLogs = logs.filter((l) => !l.resolvedAt).length;
  const metricFailures = metrics.filter((m) => !m.success).length;

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
                <div className={styles.summaryCard}><span>Total received</span><strong>{euro(totalReceived)}</strong></div>
                <div className={styles.summaryCard}><span>Active monthly donors</span><strong>{monthlyActive}</strong></div>
                <div className={styles.summaryCard}><span>Unresolved logs</span><strong>{unresolvedLogs}</strong></div>
                <div className={styles.summaryCard}><span>Metric error rate</span><strong>{pct(metricFailures, metrics.length).toFixed(2)}%</strong></div>
              </div>
            </article>
            <article className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Charts</h2>
              <div className={styles.chartGrid}>
                <div className={styles.chartCard}><h3 className={styles.chartTitle}>Users historic counter (day by day)</h3>{renderBars(usersHistoricByDay)}</div>
                <div className={styles.chartCard}><h3 className={styles.chartTitle}>Donations historic counter EUR (day by day)</h3>{renderBars(donationsHistoricByDay)}</div>
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
              </div>
              <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Supporter</th><th>Created</th></tr></thead><tbody>{usersFiltered.map((u) => <tr key={u.id}><td>{u.username}</td><td>{u.email}</td><td>{u.role}</td><td>{u.isSupporter ? "Yes" : "No"}</td><td>{dateText(u.createdAt)}</td></tr>)}</tbody></table></div>
            </article>
          </section>
        )}

        {section === "donations" && <section className={styles.sectionGrid}><article className={styles.card}><h2 className={commonStyles.panelTitle}>Donations ({donations.length} / {totals.donations})</h2><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>User</th><th>Type</th><th>Status</th><th>Amount</th><th>Created</th></tr></thead><tbody>{donations.map((d) => <tr key={d.id}><td>{d.userId}</td><td>{d.donationType}</td><td>{d.status}</td><td>{euro(d.amountMinor)}</td><td>{dateText(d.createdAt)}</td></tr>)}</tbody></table></div></article></section>}
        {section === "logs" && <section className={styles.sectionGrid}><article className={styles.card}><h2 className={commonStyles.panelTitle}>Logs ({logs.length} / {totals.logs})</h2><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>When</th><th>Level</th><th>Category</th><th>Source</th><th>Message</th></tr></thead><tbody>{logs.map((l) => <tr key={l.id}><td>{dateText(l.occurredAt)}</td><td>{l.level}</td><td>{l.category}</td><td>{l.source}</td><td>{l.message}</td></tr>)}</tbody></table></div></article></section>}
        {section === "metrics" && <section className={styles.sectionGrid}><article className={styles.card}><h2 className={commonStyles.panelTitle}>Metrics ({metrics.length} / {totals.metrics})</h2><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>When</th><th>Name</th><th>Type</th><th>Duration</th><th>Success</th></tr></thead><tbody>{metrics.map((m) => <tr key={m.id}><td>{dateText(m.occurredAt)}</td><td>{m.metricName}</td><td>{m.metricType}</td><td>{m.durationMs.toFixed(2)} ms</td><td>{m.success ? "Yes" : "No"}</td></tr>)}</tbody></table></div></article></section>}

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
              <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Name</th><th>Shape</th><th>Systems</th><th>Stars</th><th>Planets</th><th>Moons</th><th>Asteroids</th></tr></thead><tbody>{galaxiesFiltered.map((g) => <tr key={g.id}><td>{g.name}</td><td>{g.shape}</td><td>{g.systemCount}</td><td>{reports[g.id]?.stars ?? "-"}</td><td>{reports[g.id]?.planets ?? "-"}</td><td>{reports[g.id]?.moons ?? "-"}</td><td>{reports[g.id]?.asteroids ?? "-"}</td></tr>)}</tbody></table></div>
            </article>
          </section>
        )}
      </article>
    </section>
  );
}
