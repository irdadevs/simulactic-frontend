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
import { isHandledSessionExpiryError } from "../../infra/api/client";
import { logApi } from "../../infra/api/log.api";
import { metricApi } from "../../infra/api/metric.api";
import { AdminUserListItemApiResponse, userApi } from "../../infra/api/user.api";
import { describeApiError } from "../../lib/errors/apiErrorMessage";
import { AdminDateFilterCard } from "../../ui/components/admin/AdminDateFilterCard";
import { AdminOverlayModals } from "../../ui/components/admin/AdminOverlayModals";
import { AdminSidebar } from "../../ui/components/admin/AdminSidebar";
import { CreateAdminModal } from "../../ui/components/admin/CreateAdminModal";
import { EditUserModal } from "../../ui/components/admin/EditUserModal";
import { BansSection } from "../../ui/components/admin/sections/BansSection";
import { DonationsSection } from "../../ui/components/admin/sections/DonationsSection";
import { EntitiesSection } from "../../ui/components/admin/sections/EntitiesSection";
import { LogsSection } from "../../ui/components/admin/sections/LogsSection";
import { MetricsSection } from "../../ui/components/admin/sections/MetricsSection";
import { OverviewSection } from "../../ui/components/admin/sections/OverviewSection";
import { TrafficSection } from "../../ui/components/admin/sections/TrafficSection";
import { UsersSection } from "../../ui/components/admin/sections/UsersSection";
import styles from "../../styles/admin.module.css";
import commonStyles from "../../styles/skeleton.module.css";
import { AdminSection } from "./admin.shared";
import {
  ActiveIpBanRow,
  ActiveUserBanRow,
  addDays,
  BanDraft,
  BANS_PAGE_SIZE,
  csv,
  dateText,
  donationStatusClassName,
  DONATIONS_PAGE_SIZE,
  end,
  ENTITIES_PAGE_SIZE,
  euro,
  GalaxyRow,
  getBanIpTarget,
  getBanUserTarget,
  LOGS_PAGE_SIZE,
  logLevelClassName,
  MAX_FETCH,
  PAGE_SIZE,
  parseDateInput,
  pct,
  SectionLoadState,
  start,
  toDateInput,
  toDateTimeInput,
  totalDaysInRange,
  TRAFFIC_MAX_RANGE_DAYS,
  TrafficAnalyticsState,
  TRAFFIC_RECENT_PAGE_SIZE,
  TRAFFIC_ROUTES_PAGE_SIZE,
  useDebouncedValue,
  USERS_PAGE_SIZE,
  userRoleClassName,
} from "./admin.utils";
import { DonationApiResponse, DonationProps } from "../../types/donation.types";
import { GalaxyApiResponse, GalaxyCountsResponse, GalaxyShapeValue, GlobalGalaxyCountsResponse } from "../../types/galaxy.types";
import { LogApiResponse, LogProps } from "../../types/log.types";
import { MetricApiResponse, MetricProps } from "../../types/metric.types";
import { UserApiResponse, UserProps, UserRole } from "../../types/user.types";

const createSectionState = (): Record<AdminSection, SectionLoadState> => ({
  overview: { loading: false, error: null },
  entities: { loading: false, error: null },
  users: { loading: false, error: null },
  donations: { loading: false, error: null },
  logs: { loading: false, error: null },
  bans: { loading: false, error: null },
  metrics: { loading: false, error: null },
  traffic: { loading: false, error: null },
});


export default function AdminPage() {
  const router = useRouter();
  const { user, loadMe } = useAuth();
  const checkedRef = useRef(false);

  const [section, setSection] = useState<AdminSection>("overview");
  const [isCompactChart, setIsCompactChart] = useState(false);
  const [from, setFrom] = useState(toDateInput(addDays(new Date(), -30)));
  const [to, setTo] = useState(toDateInput(new Date()));

  const [userSearch, setUserSearch] = useState("");
  const [role, setRole] = useState<"all" | UserRole>("all");
  const [supporter, setSupporter] = useState<"all" | "yes" | "no">("all");
  const [verified, setVerified] = useState<"all" | "yes" | "no">("yes");
  const [shape, setShape] = useState<"all" | GalaxyShapeValue>("all");
  const [entitySearch, setEntitySearch] = useState("");
  const [logState, setLogState] = useState<"all" | "open" | "resolved">("all");
  const [logLevelFilter, setLogLevelFilter] = useState<"all" | "debug" | "info" | "warn" | "error" | "critical">("all");
  const [logCategoryFilter, setLogCategoryFilter] = useState<"all" | "application" | "security" | "audit" | "infrastructure">("all");
  const [resolveLogLevel, setResolveLogLevel] = useState<"all" | "debug" | "warn" | "error" | "critical">("all");
  const [logsPage, setLogsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [donationsPage, setDonationsPage] = useState(1);
  const [entitiesPage, setEntitiesPage] = useState(1);
  const [bansPage, setBansPage] = useState(1);
  const [trafficRoutesPage, setTrafficRoutesPage] = useState(1);
  const [trafficRecentPage, setTrafficRecentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogProps | null>(null);
  const [adminNoteDraft, setAdminNoteDraft] = useState("");
  const [adminNoteSaving, setAdminNoteSaving] = useState(false);
  const [loadingLogDetails, setLoadingLogDetails] = useState(false);
  const [bansListView, setBansListView] = useState<"users" | "ips">("users");
  const [banDraft, setBanDraft] = useState<BanDraft | null>(null);
  const [banReasonDraft, setBanReasonDraft] = useState("");
  const [banExpiresAtDraft, setBanExpiresAtDraft] = useState("");
  const [banSaving, setBanSaving] = useState(false);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [createAdminUsername, setCreateAdminUsername] = useState("");
  const [createAdminEmail, setCreateAdminEmail] = useState("");
  const [createAdminPassword, setCreateAdminPassword] = useState("");
  const [createAdminSaving, setCreateAdminSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProps | null>(null);
  const [editingUserRole, setEditingUserRole] = useState<UserRole>("User");
  const [editingUserSaving, setEditingUserSaving] = useState(false);

  const [users, setUsers] = useState<UserProps[]>([]);
  const [donations, setDonations] = useState<DonationProps[]>([]);
  const [logs, setLogs] = useState<LogProps[]>([]);
  const [metrics, setMetrics] = useState<MetricProps[]>([]);
  const [traffic, setTraffic] = useState<TrafficAnalyticsState | null>(null);
  const [bannedUsers, setBannedUsers] = useState<ActiveUserBanRow[]>([]);
  const [bannedIps, setBannedIps] = useState<ActiveIpBanRow[]>([]);
  const [securityLogs, setSecurityLogs] = useState<LogProps[]>([]);
  const [galaxies, setGalaxies] = useState<GalaxyRow[]>([]);
  const [galaxyCounts, setGalaxyCounts] = useState<Record<string, GalaxyCountsResponse>>({});
  const [globalCounts, setGlobalCounts] = useState<GlobalGalaxyCountsResponse | null>(null);
  const [focusGalaxyId, setFocusGalaxyId] = useState<string | null>(null);
  const [totals, setTotals] = useState({ users: 0, donations: 0, logs: 0, metrics: 0, galaxies: 0 });
  const [sectionState, setSectionState] = useState<Record<AdminSection, SectionLoadState>>(createSectionState);

  const rangeFrom = useMemo(() => start(parseDateInput(from)), [from]);
  const rangeTo = useMemo(() => end(parseDateInput(to)), [to]);
  const totalRangeDays = useMemo(() => totalDaysInRange(rangeFrom, rangeTo), [rangeFrom, rangeTo]);
  const trafficRangeCapped = totalRangeDays > TRAFFIC_MAX_RANGE_DAYS;
  const trafficQueryFrom = useMemo(
    () => (trafficRangeCapped ? toDateInput(addDays(parseDateInput(to), -(TRAFFIC_MAX_RANGE_DAYS - 1))) : from),
    [from, to, trafficRangeCapped],
  );
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

  const setSectionLoading = (target: AdminSection, loadingState: boolean, error: string | null = null) => {
    setSectionState((prev) => ({
      ...prev,
      [target]: { loading: loadingState, error },
    }));
  };

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

  const loadUsersData = async () => {
    const response = await fetchAll((offset) =>
      userApi.list({ orderBy: "createdAt", orderDir: "desc", limit: PAGE_SIZE, offset }),
    );
    const mapped = response.rows.map((row: UserApiResponse | AdminUserListItemApiResponse) =>
      mapUserDomainToView(
        mapUserApiToDomain("verified" in row ? row : { ...row, verified: row.isVerified }),
      ),
    );
    setUsers(mapped);
    setTotals((prev) => ({ ...prev, users: response.total }));
  };

  const loadDonationsData = async () => {
    const response = await fetchAll((offset) =>
      donationApi.list({ orderBy: "createdAt", orderDir: "desc", limit: PAGE_SIZE, offset }),
    );
    setDonations(response.rows.map((row: DonationApiResponse) => mapDonationDomainToView(mapDonationApiToDomain(row))));
    setTotals((prev) => ({ ...prev, donations: response.total }));
  };

  const loadLogsData = async () => {
    const response = await fetchAll((offset) =>
      logApi.list({ from: rangeFrom, to: rangeTo, orderBy: "occurredAt", orderDir: "desc", limit: PAGE_SIZE, offset, view: "dashboard" }),
    );
    setLogs(response.rows.map((row: LogApiResponse) => mapLogDomainToView(mapLogApiToDomain(row))));
    setTotals((prev) => ({ ...prev, logs: response.total }));
  };

  const loadSecurityLogsData = async () => {
    const response = await fetchAll((offset) =>
      logApi.list({
        from: rangeFrom,
        to: rangeTo,
        category: "security",
        orderBy: "occurredAt",
        orderDir: "desc",
        limit: PAGE_SIZE,
        offset,
        view: "dashboard",
      }),
    );
    setSecurityLogs(response.rows.map((row: LogApiResponse) => mapLogDomainToView(mapLogApiToDomain(row))));
  };

  const loadMetricsData = async () => {
    const response = await fetchAll((offset) =>
      metricApi.list({ from: rangeFrom, to: rangeTo, orderBy: "occurredAt", orderDir: "desc", limit: PAGE_SIZE, offset, view: "dashboard" }),
    );
    setMetrics(response.rows.map((row: MetricApiResponse) => mapMetricDomainToView(mapMetricApiToDomain(row))));
    setTotals((prev) => ({ ...prev, metrics: response.total }));
  };

  const loadTrafficData = async () => {
    const trafficAnalytics = await metricApi.traffic({
      from: trafficQueryFrom,
      to,
      limitRecent: 200,
      limitRoutes: 200,
      limitReferrers: 20,
    });
    setTraffic({
      overview: trafficAnalytics.overview,
      viewsByDay: trafficAnalytics.viewsByDay.map((row) => ({
        date: new Date(`${row.date}T00:00:00.000Z`),
        views: row.views,
      })),
      routes: trafficAnalytics.routes,
      referrers: trafficAnalytics.referrers,
      recentViews: trafficAnalytics.recentViews.map((row) => ({
        ...row,
        occurredAt: new Date(row.occurredAt),
      })),
    });
  };

  const loadBansData = async () => {
    const bans = await userApi.listActiveBans(200);
    setBannedUsers(
      bans.users.map((row) => ({
        ...row,
        createdAt: new Date(row.createdAt),
        expiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
      })),
    );
    setBannedIps(
      bans.ips.map((row) => ({
        ...row,
        createdAt: new Date(row.createdAt),
        expiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
      })),
    );
  };

  const loadEntitiesData = async () => {
    const [g, gc] = await Promise.all([
      fetchAll((offset) => galaxyApi.list({ orderBy: "createdAt", orderDir: "desc", limit: PAGE_SIZE, offset })),
      galaxyApi.globalCounts(),
    ]);
    setGalaxies(g.rows.map((row: GalaxyApiResponse) => ({ ...row, createdAt: new Date(row.createdAt) })));
    setGlobalCounts(gc);
    setTotals((prev) => ({ ...prev, galaxies: g.total }));
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== "Admin") {
      router.replace("/dashboard");
      return;
    }

    const loadSection = async (target: AdminSection) => {
      setSectionLoading(target, true);
      try {
        if (target === "overview") {
          await Promise.all([
            loadUsersData(),
            loadDonationsData(),
            loadLogsData(),
            loadMetricsData(),
            loadTrafficData(),
            loadBansData(),
            loadEntitiesData(),
            loadSecurityLogsData(),
          ]);
        } else if (target === "users") {
          await loadUsersData();
        } else if (target === "donations") {
          await loadDonationsData();
        } else if (target === "logs") {
          await loadLogsData();
        } else if (target === "metrics") {
          await loadMetricsData();
        } else if (target === "traffic") {
          await loadTrafficData();
        } else if (target === "bans") {
          await Promise.all([loadBansData(), loadSecurityLogsData()]);
        } else if (target === "entities") {
          await loadEntitiesData();
        }
        setSectionLoading(target, false);
      } catch (error: unknown) {
        if (isHandledSessionExpiryError(error)) {
          setSectionLoading(target, false);
          return;
        }
        const message = describeApiError(error, "Could not load admin section data.");
        setSectionLoading(target, false, message);
        sileo.error({ title: "Admin data load failed", description: message });
      }
    };

    void loadSection(section);
    // Loader helpers are recreated on render because they close over current filters.
    // This effect is intentionally keyed by active section and date range.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, router, user, rangeFrom, rangeTo, trafficQueryFrom, to]);

  const usersFiltered = useMemo(
    () =>
      users
        .filter((u) => u.createdAt >= rangeFrom && u.createdAt <= rangeTo)
        .filter((u) => `${u.username} ${u.email}`.toLowerCase().includes(debouncedUserSearch.toLowerCase()))
        .filter((u) => (role === "all" ? true : u.role === role))
        .filter((u) => (supporter === "all" ? true : supporter === "yes" ? u.isSupporter : !u.isSupporter))
        .filter((u) => (verified === "all" ? true : verified === "yes" ? u.verified : !u.verified)),
    [debouncedUserSearch, rangeFrom, rangeTo, role, supporter, users, verified],
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
  const donationsFiltered = useMemo(
    () => donations.filter((donation) => donation.createdAt >= rangeFrom && donation.createdAt <= rangeTo),
    [donations, rangeFrom, rangeTo],
  );
  const usersTotalPages = Math.max(1, Math.ceil(usersFiltered.length / USERS_PAGE_SIZE));
  const usersPageSafe = Math.min(usersPage, usersTotalPages);
  const usersVisible = usersFiltered.slice((usersPageSafe - 1) * USERS_PAGE_SIZE, usersPageSafe * USERS_PAGE_SIZE);
  const donationsTotalPages = Math.max(1, Math.ceil(donationsFiltered.length / DONATIONS_PAGE_SIZE));
  const donationsPageSafe = Math.min(donationsPage, donationsTotalPages);
  const donationsVisible = donationsFiltered.slice((donationsPageSafe - 1) * DONATIONS_PAGE_SIZE, donationsPageSafe * DONATIONS_PAGE_SIZE);
  const entitiesTotalPages = Math.max(1, Math.ceil(galaxiesFiltered.length / ENTITIES_PAGE_SIZE));
  const entitiesPageSafe = Math.min(entitiesPage, entitiesTotalPages);
  const entitiesVisible = galaxiesFiltered.slice((entitiesPageSafe - 1) * ENTITIES_PAGE_SIZE, entitiesPageSafe * ENTITIES_PAGE_SIZE);
  const activeBans = bansListView === "users" ? bannedUsers : bannedIps;
  const bansTotalPages = Math.max(1, Math.ceil(activeBans.length / BANS_PAGE_SIZE));
  const bansPageSafe = Math.min(bansPage, bansTotalPages);
  const activeBansVisible = activeBans.slice((bansPageSafe - 1) * BANS_PAGE_SIZE, bansPageSafe * BANS_PAGE_SIZE);
  const trafficRoutes = traffic?.routes ?? [];
  const trafficRoutesTotalPages = Math.max(1, Math.ceil(trafficRoutes.length / TRAFFIC_ROUTES_PAGE_SIZE));
  const trafficRoutesPageSafe = Math.min(trafficRoutesPage, trafficRoutesTotalPages);
  const trafficRoutesVisible = trafficRoutes.slice((trafficRoutesPageSafe - 1) * TRAFFIC_ROUTES_PAGE_SIZE, trafficRoutesPageSafe * TRAFFIC_ROUTES_PAGE_SIZE);
  const recentTraffic = traffic?.recentViews ?? [];
  const trafficRecentTotalPages = Math.max(1, Math.ceil(recentTraffic.length / TRAFFIC_RECENT_PAGE_SIZE));
  const trafficRecentPageSafe = Math.min(trafficRecentPage, trafficRecentTotalPages);
  const recentTrafficVisible = recentTraffic.slice((trafficRecentPageSafe - 1) * TRAFFIC_RECENT_PAGE_SIZE, trafficRecentPageSafe * TRAFFIC_RECENT_PAGE_SIZE);

  const usersHistoricByDay = useMemo(() => {
    const points: Array<{ label: string; value: number }> = [];
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
    const points: Array<{ label: string; value: number }> = [];
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
    const points: Array<{ label: string; value: number }> = [];
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
    const points: Array<{ label: string; value: number }> = [];
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
    const points: Array<{ label: string; value: number }> = [];
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
        if (!cancelled && !isHandledSessionExpiryError(error)) {
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
    setUsersPage(1);
  }, [userSearch, role, supporter, verified, from, to]);

  useEffect(() => {
    setDonationsPage(1);
  }, [from, to]);

  useEffect(() => {
    setEntitiesPage(1);
  }, [entitySearch, shape, from, to]);

  useEffect(() => {
    setBansPage(1);
  }, [bansListView, from, to]);

  useEffect(() => {
    setTrafficRoutesPage(1);
    setTrafficRecentPage(1);
  }, [from, to]);

  useEffect(() => {
    setAdminNoteDraft(selectedLog?.adminNote ?? "");
  }, [selectedLog]);

  useEffect(() => {
    if (!banDraft) {
      setBanReasonDraft("");
      setBanExpiresAtDraft("");
    }
  }, [banDraft]);

  const unresolvedLogs = logs.filter((l) => !l.resolvedAt).length;
  const metricFailures = metrics.filter((m) => !m.success).length;
  const metricByType: Array<{ type: MetricProps["metricType"]; count: number; avg: number; errors: number }> = (() => {
    const map = new Map<MetricProps["metricType"], { count: number; avg: number; errors: number }>();
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
  const trafficViewsByDay = (traffic?.viewsByDay ?? []).map((item) => ({
    label: `${item.date.getUTCMonth() + 1}/${item.date.getUTCDate()}`,
    value: item.views,
  }));
  const topTrafficBars = (traffic?.routes ?? []).slice(0, 8).map((item) => ({ label: item.path, value: item.views }));
  const currentSectionState = sectionState[section];
  const securitySignalsByDay = useMemo(() => {
    const points: Array<{ label: string; value: number }> = [];
    const totalDays = totalDaysInRange(rangeFrom, rangeTo);
    for (let i = 0; i < totalDays; i += 1) {
      const day = addDays(rangeFrom, i);
      const dayStart = start(day);
      const dayEnd = end(day);
      points.push({
        label: `${day.getMonth() + 1}/${day.getDate()}`,
        value: securityLogs.filter((log) => log.occurredAt >= dayStart && log.occurredAt <= dayEnd).length,
      });
    }
    return points;
  }, [rangeFrom, rangeTo, securityLogs]);
  const securityTopIps = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of securityLogs) {
      if (!log.ip) continue;
      counts.set(log.ip, (counts.get(log.ip) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 8);
  }, [securityLogs]);
  const autoBanSignals = securityLogs.filter((log) => log.message.toLowerCase().includes("auto-ban"));
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

  const patchUserState = (userId: string, patch: Partial<UserProps>) => {
    setUsers((prev) =>
      prev.map((item) => (item.id === userId ? { ...item, ...patch } : item)),
    );
    setEditingUser((prev) => (prev?.id === userId ? { ...prev, ...patch } : prev));
  };

  const openLogDetails = async (logId: string) => {
    setLoadingLogDetails(true);
    try {
      const response = await logApi.findById(logId, "dashboard");
      if (!response) {
        sileo.error({
          title: "Log not found",
          description: "The selected log is no longer available.",
        });
        return;
      }
      setSelectedLog(mapLogDomainToView(mapLogApiToDomain(response)));
    } finally {
      setLoadingLogDetails(false);
    }
  };

  const openBanModal = (draft: BanDraft) => {
    setBanDraft(draft);
    setBanReasonDraft(`Admin ban from log ${draft.logId}`);
    setBanExpiresAtDraft(toDateTimeInput(addDays(new Date(), 7)));
  };

  const closeBanModal = () => {
    setBanDraft(null);
    setBanSaving(false);
  };

  const submitBan = async () => {
    if (!banDraft) return;
    const reason = banReasonDraft.trim();
    if (reason.length < 5) {
      sileo.error({
        title: "Invalid reason",
        description: "Ban reason must be at least 5 characters.",
      });
      return;
    }

    setBanSaving(true);
    try {
      const expiresAt = banExpiresAtDraft ? new Date(banExpiresAtDraft) : undefined;
      if (banDraft.kind === "user") {
        const created = await userApi.banUser(banDraft.userId, { reason, expiresAt });
        setBannedUsers((prev) => [
          {
            id: created.id,
            userId: created.userId ?? banDraft.userId,
            reason: created.reason,
            source: created.source,
            bannedBy: created.bannedBy,
            createdAt: new Date(created.createdAt),
            expiresAt: created.expiresAt ? new Date(created.expiresAt) : null,
          },
          ...prev.filter((item) => item.userId !== (created.userId ?? banDraft.userId)),
        ]);
      } else {
        const created = await userApi.banIp({
          ipAddress: banDraft.ipAddress,
          reason,
          expiresAt,
        });
        setBannedIps((prev) => [
          {
            id: created.id,
            ipAddress: created.ipAddress ?? banDraft.ipAddress,
            reason: created.reason,
            source: created.source,
            bannedBy: created.bannedBy,
            createdAt: new Date(created.createdAt),
            expiresAt: created.expiresAt ? new Date(created.expiresAt) : null,
          },
          ...prev.filter((item) => item.ipAddress !== (created.ipAddress ?? banDraft.ipAddress)),
        ]);
      }
      closeBanModal();
    } finally {
      setBanSaving(false);
    }
  };

  const unbanUser = async (userId: string) => {
    await userApi.unbanUser(userId);
    setBannedUsers((prev) => prev.filter((item) => item.userId !== userId));
  };

  const unbanIp = async (ipAddress: string) => {
    await userApi.unbanIp({ ipAddress });
    setBannedIps((prev) => prev.filter((item) => item.ipAddress !== ipAddress));
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
        adminNoteUpdatedAt: new Date(),
        adminNoteUpdatedBy: user?.id ?? null,
      });
    } finally {
      setAdminNoteSaving(false);
    }
  };

  const closeCreateAdminModal = () => {
    setCreateAdminOpen(false);
    setCreateAdminUsername("");
    setCreateAdminEmail("");
    setCreateAdminPassword("");
  };

  const submitCreateAdmin = async () => {
    setCreateAdminSaving(true);
    try {
      const created = await userApi.createAdmin({
        username: createAdminUsername.trim(),
        email: createAdminEmail.trim(),
        rawPassword: createAdminPassword,
      });
      const mapped = mapUserDomainToView(mapUserApiToDomain(created.user as UserApiResponse));
      setUsers((prev) => [mapped, ...prev]);
      setTotals((prev) => ({ ...prev, users: prev.users + 1 }));
      closeCreateAdminModal();
      sileo.success({
        title: "Admin created",
        description: "The new admin user was created successfully.",
      });
    } catch (error: unknown) {
      if (isHandledSessionExpiryError(error)) {
        return;
      }
      sileo.error({
        title: "Admin creation failed",
        description: describeApiError(error, "Could not create the admin user."),
      });
    } finally {
      setCreateAdminSaving(false);
    }
  };

  const openEditUserModal = (target: UserProps) => {
    setEditingUser(target);
    setEditingUserRole(target.role);
  };

  const closeEditUserModal = () => {
    setEditingUser(null);
    setEditingUserRole("User");
  };

  const saveEditedUserRole = async () => {
    if (!editingUser) return;
    setEditingUserSaving(true);
    try {
      await userApi.changeRole(editingUser.id, { newRole: editingUserRole });
      patchUserState(editingUser.id, { role: editingUserRole });
      sileo.success({
        title: "User updated",
        description: "The user role was updated successfully.",
      });
    } catch (error: unknown) {
      if (isHandledSessionExpiryError(error)) {
        return;
      }
      sileo.error({
        title: "User update failed",
        description: describeApiError(error, "Could not update the selected user."),
      });
    } finally {
      setEditingUserSaving(false);
    }
  };

  const softDeleteEditedUser = async () => {
    if (!editingUser) return;
    setEditingUserSaving(true);
    try {
      await userApi.softDelete({ id: editingUser.id });
      patchUserState(editingUser.id, { isDeleted: true, deletedAt: new Date() });
      sileo.success({
        title: "User deleted",
        description: "The user was soft-deleted successfully.",
      });
    } catch (error: unknown) {
      if (isHandledSessionExpiryError(error)) {
        return;
      }
      sileo.error({
        title: "Delete failed",
        description: describeApiError(error, "Could not soft-delete the selected user."),
      });
    } finally {
      setEditingUserSaving(false);
    }
  };

  const restoreEditedUser = async () => {
    if (!editingUser) return;
    setEditingUserSaving(true);
    try {
      await userApi.restore({ id: editingUser.id });
      patchUserState(editingUser.id, { isDeleted: false, deletedAt: null });
      sileo.success({
        title: "User restored",
        description: "The user was restored successfully.",
      });
    } catch (error: unknown) {
      if (isHandledSessionExpiryError(error)) {
        return;
      }
      sileo.error({
        title: "Restore failed",
        description: describeApiError(error, "Could not restore the selected user."),
      });
    } finally {
      setEditingUserSaving(false);
    }
  };

  if (!user) return <p className={commonStyles.meta}>Checking permissions...</p>;
  if (user.role !== "Admin") return null;

  const selectedLogBanUserTarget = selectedLog ? getBanUserTarget(selectedLog) : null;
  const selectedLogBanIpTarget = selectedLog ? getBanIpTarget(selectedLog) : null;

  return (
    <section className={styles.page}>
      <AdminSidebar section={section} loading={currentSectionState.loading} onSectionChange={setSection} />

      <article className={styles.content}>
        <AdminDateFilterCard from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

        {section === "overview" && (
          <OverviewSection
            usersCount={usersFiltered.length}
            supportersCount={usersFiltered.filter((userItem) => userItem.isSupporter).length}
            totalReceived={euro(donationGlobalCards.totalAmountMinor)}
            activeMonthlyDonors={donationGlobalCards.activeMonthlySupporters}
            unresolvedLogs={unresolvedLogs}
            metricErrorRate={`${pct(metricFailures, metrics.length).toFixed(2)}%`}
            usersHistoricByDay={usersHistoricByDay}
            donationsHistoricByDay={donationsHistoricByDay}
            galaxyCreationsHistoricByDay={galaxyCreationsHistoricByDay}
            lineChartTicks={lineChartTicks}
            loading={sectionState.overview.loading}
            error={sectionState.overview.error}
          />
        )}

        {section === "users" && (
          <UsersSection
            usersFilteredCount={usersFiltered.length}
            totalUsers={totals.users}
            userSearch={userSearch}
            role={role}
            supporter={supporter}
            verified={verified}
            onUserSearchChange={setUserSearch}
            onRoleChange={setRole}
            onSupporterChange={setSupporter}
            onVerifiedChange={setVerified}
            onExportCsv={onExportUsersCsv}
            onOpenCreateAdmin={() => setCreateAdminOpen(true)}
            userGlobalCards={userGlobalCards}
            loading={sectionState.users.loading}
            error={sectionState.users.error}
            usersVisible={usersVisible}
            summary={`Showing ${usersFiltered.length === 0 ? 0 : (usersPageSafe - 1) * USERS_PAGE_SIZE + 1} - ${Math.min(usersPageSafe * USERS_PAGE_SIZE, usersFiltered.length)} of ${usersFiltered.length}`}
            usersPageSafe={usersPageSafe}
            usersTotalPages={usersTotalPages}
            onPrevPage={() => setUsersPage((prev) => Math.max(1, prev - 1))}
            onNextPage={() => setUsersPage((prev) => Math.min(usersTotalPages, prev + 1))}
            onEditUser={openEditUserModal}
            userRoleClassName={userRoleClassName}
            dateText={dateText}
          />
        )}

        {section === "donations" && (
          <DonationsSection
            donationsFilteredCount={donationsFiltered.length}
            totalDonations={totals.donations}
            totalAmount={euro(donationGlobalCards.totalAmountMinor)}
            activeMonthlySupporters={donationGlobalCards.activeMonthlySupporters}
            loading={sectionState.donations.loading}
            error={sectionState.donations.error}
            donationsVisible={donationsVisible}
            summary={`Showing ${donationsFiltered.length === 0 ? 0 : (donationsPageSafe - 1) * DONATIONS_PAGE_SIZE + 1} - ${Math.min(donationsPageSafe * DONATIONS_PAGE_SIZE, donationsFiltered.length)} of ${donationsFiltered.length}`}
            donationsPageSafe={donationsPageSafe}
            donationsTotalPages={donationsTotalPages}
            onPrevPage={() => setDonationsPage((prev) => Math.max(1, prev - 1))}
            onNextPage={() => setDonationsPage((prev) => Math.min(donationsTotalPages, prev + 1))}
            donationStatusClassName={donationStatusClassName}
            euro={euro}
            dateText={dateText}
          />
        )}
        {section === "logs" && (
          <LogsSection
            logsFilteredCount={logsFiltered.length}
            totalLogs={totals.logs}
            loading={sectionState.logs.loading}
            error={sectionState.logs.error}
            logState={logState}
            logLevelFilter={logLevelFilter}
            logCategoryFilter={logCategoryFilter}
            resolveLogLevel={resolveLogLevel}
            openLogs={openLogs}
            closedLogs={closedLogs}
            logByLevel={logByLevel}
            logByCategory={logByCategory}
            bulkResolvableCount={bulkResolvableLogs.length}
            logsVisible={logsVisible}
            summary={`Showing ${logsFiltered.length === 0 ? 0 : (logsPageSafe - 1) * LOGS_PAGE_SIZE + 1} - ${Math.min(logsPageSafe * LOGS_PAGE_SIZE, logsFiltered.length)} of ${logsFiltered.length}`}
            logsPageSafe={logsPageSafe}
            logsTotalPages={logsTotalPages}
            loadingLogDetails={loadingLogDetails}
            onLogStateChange={setLogState}
            onLogLevelFilterChange={setLogLevelFilter}
            onLogCategoryFilterChange={setLogCategoryFilter}
            onResolveLogLevelChange={setResolveLogLevel}
            onResolveAll={() => {
              void resolveLogs(bulkResolvableLogs.map((log) => log.id)).then(() => {
                sileo.success({
                  title: "Logs resolved",
                  description: `${bulkResolvableLogs.length} log(s) marked as resolved.`,
                });
              }).catch((error: unknown) => {
                if (isHandledSessionExpiryError(error)) {
                  return;
                }
                sileo.error({
                  title: "Bulk resolve failed",
                  description: describeApiError(error, "Could not resolve selected logs."),
                });
              });
            }}
            onResolveLog={(logId) => {
              void resolveLogs([logId]).then(() => {
                sileo.success({
                  title: "Log resolved",
                  description: "The selected log was marked as resolved.",
                });
              }).catch((error: unknown) => {
                if (isHandledSessionExpiryError(error)) {
                  return;
                }
                sileo.error({ title: "Log update failed", description: describeApiError(error, "Could not resolve log.") });
              });
            }}
            onReopenLog={(logId) => {
              void reopenLog(logId).then(() => {
                sileo.success({
                  title: "Log reopened",
                  description: "The selected log was marked as open again.",
                });
              }).catch((error: unknown) => {
                if (isHandledSessionExpiryError(error)) {
                  return;
                }
                sileo.error({
                  title: "Log reopen failed",
                  description: describeApiError(error, "Could not reopen log."),
                });
              });
            }}
            onOpenDetails={(logId) => {
              void openLogDetails(logId).catch((error: unknown) => {
                if (isHandledSessionExpiryError(error)) {
                  return;
                }
                sileo.error({
                  title: "Log load failed",
                  description: describeApiError(error, "Could not load log details."),
                });
              });
            }}
            onPrevPage={() => setLogsPage((prev) => Math.max(1, prev - 1))}
            onNextPage={() => setLogsPage((prev) => Math.min(logsTotalPages, prev + 1))}
            logLevelClassName={logLevelClassName}
            dateText={dateText}
          />
        )}
        {section === "metrics" && (
          <MetricsSection
            metricsCount={metrics.length}
            metricErrorsCount={metricErrors.length}
            errorRate={`${pct(metricErrors.length, metrics.length).toFixed(2)}%`}
            avgDuration={metrics.length ? (metrics.reduce((acc, metric) => acc + metric.durationMs, 0) / metrics.length).toFixed(2) : "0.00"}
            loading={sectionState.metrics.loading}
            error={sectionState.metrics.error}
            metricByType={metricByType}
            metricErrorsByType={metricErrorsByType}
            metricErrors={metricErrors}
            dateText={dateText}
          />
        )}

        {section === "traffic" && (
          <TrafficSection
            overview={traffic?.overview ?? null}
            loading={sectionState.traffic.loading}
            error={sectionState.traffic.error}
            trafficViewsByDay={trafficViewsByDay}
            lineChartTicks={lineChartTicks}
            topTrafficBars={topTrafficBars}
            referrers={traffic?.referrers ?? []}
            trafficRoutes={trafficRoutes}
            trafficRoutesVisible={trafficRoutesVisible}
            trafficRoutesPageSafe={trafficRoutesPageSafe}
            trafficRoutesTotalPages={trafficRoutesTotalPages}
            trafficRoutesSummary={`Showing ${trafficRoutes.length === 0 ? 0 : (trafficRoutesPageSafe - 1) * TRAFFIC_ROUTES_PAGE_SIZE + 1} - ${Math.min(trafficRoutesPageSafe * TRAFFIC_ROUTES_PAGE_SIZE, trafficRoutes.length)} of ${trafficRoutes.length}`}
            onPrevRoutesPage={() => setTrafficRoutesPage((prev) => Math.max(1, prev - 1))}
            onNextRoutesPage={() => setTrafficRoutesPage((prev) => Math.min(trafficRoutesTotalPages, prev + 1))}
            recentTraffic={recentTraffic}
            recentTrafficVisible={recentTrafficVisible}
            trafficRecentPageSafe={trafficRecentPageSafe}
            trafficRecentTotalPages={trafficRecentTotalPages}
            recentTrafficSummary={`Showing ${recentTraffic.length === 0 ? 0 : (trafficRecentPageSafe - 1) * TRAFFIC_RECENT_PAGE_SIZE + 1} - ${Math.min(trafficRecentPageSafe * TRAFFIC_RECENT_PAGE_SIZE, recentTraffic.length)} of ${recentTraffic.length}`}
            onPrevRecentPage={() => setTrafficRecentPage((prev) => Math.max(1, prev - 1))}
            onNextRecentPage={() => setTrafficRecentPage((prev) => Math.min(trafficRecentTotalPages, prev + 1))}
            dateText={dateText}
            rangeCapped={trafficRangeCapped}
          />
        )}

        {section === "bans" && (
          <BansSection
            loading={sectionState.bans.loading}
            error={sectionState.bans.error}
            totalActiveBans={totalActiveBans}
            bannedUsersCount={bannedUsers.length}
            bannedIpsCount={bannedIps.length}
            adminIssuedBans={adminIssuedBans}
            expiringBans={expiringBans}
            userBansByDay={bannedUsersByDay}
            ipBansByDay={bannedIpsByDay}
            lineChartTicks={lineChartTicks}
            listView={bansListView}
            onListViewChange={setBansListView}
            userBansVisible={activeBansVisible as ActiveUserBanRow[]}
            ipBansVisible={activeBansVisible as ActiveIpBanRow[]}
            totalUserBans={bannedUsers.length}
            totalIpBans={bannedIps.length}
            bansPageSafe={bansPageSafe}
            bansTotalPages={bansTotalPages}
            bansSummary={`Page ${bansPageSafe} / ${bansTotalPages}`}
            onPrevPage={() => setBansPage((prev) => Math.max(1, prev - 1))}
            onNextPage={() => setBansPage((prev) => Math.min(bansTotalPages, prev + 1))}
            onUnbanUser={(userId) => {
              void unbanUser(userId).then(() => {
                sileo.success({
                  title: "User unbanned",
                  description: "The selected user ban was removed.",
                });
              }).catch((error: unknown) => {
                if (isHandledSessionExpiryError(error)) {
                  return;
                }
                sileo.error({
                  title: "User unban failed",
                  description: describeApiError(error, "Could not unban the selected user."),
                });
              });
            }}
            onUnbanIp={(ipAddress) => {
              void unbanIp(ipAddress).then(() => {
                sileo.success({
                  title: "IP unbanned",
                  description: "The selected IP ban was removed.",
                });
              }).catch((error: unknown) => {
                if (isHandledSessionExpiryError(error)) {
                  return;
                }
                sileo.error({
                  title: "IP unban failed",
                  description: describeApiError(error, "Could not unban the selected IP."),
                });
              });
            }}
            securitySignalsCount={securityLogs.length}
            autoBanEventsCount={autoBanSignals.length}
            distinctIpsCount={securityTopIps.length}
            securitySignalsByDay={securitySignalsByDay}
            securityTopIps={securityTopIps}
            dateText={dateText}
          />
        )}

        {section === "entities" && (
          <EntitiesSection
            galaxiesFilteredCount={galaxiesFiltered.length}
            totalGalaxies={totals.galaxies}
            entitySearch={entitySearch}
            shape={shape}
            onEntitySearchChange={setEntitySearch}
            onShapeChange={setShape}
            onRefreshCounts={() => void loadGalaxyCounts(galaxiesFiltered.map((galaxy) => galaxy.id))}
            entityGlobalCards={entityGlobalCards}
            loading={sectionState.entities.loading}
            error={sectionState.entities.error}
            entitiesVisible={entitiesVisible}
            galaxyCounts={galaxyCounts}
            entitiesPageSafe={entitiesPageSafe}
            entitiesTotalPages={entitiesTotalPages}
            summary={`Showing ${galaxiesFiltered.length === 0 ? 0 : (entitiesPageSafe - 1) * ENTITIES_PAGE_SIZE + 1} - ${Math.min(entitiesPageSafe * ENTITIES_PAGE_SIZE, galaxiesFiltered.length)} of ${galaxiesFiltered.length}`}
            onPrevPage={() => setEntitiesPage((prev) => Math.max(1, prev - 1))}
            onNextPage={() => setEntitiesPage((prev) => Math.min(entitiesTotalPages, prev + 1))}
            onFocusGalaxy={setFocusGalaxyId}
          />
        )}
      </article>
      <AdminOverlayModals
        focusGalaxyId={focusGalaxyId}
        onCloseGalaxy={() => setFocusGalaxyId(null)}
        selectedLog={selectedLog}
        adminNoteDraft={adminNoteDraft}
        adminNoteSaving={adminNoteSaving}
        selectedLogBanUserTarget={selectedLogBanUserTarget}
        selectedLogBanIpTarget={selectedLogBanIpTarget}
        dateText={dateText}
        onCloseLog={() => setSelectedLog(null)}
        onNoteChange={setAdminNoteDraft}
        onSaveNote={saveAdminNote}
        onDeleteNote={clearAdminNote}
        onOpenBanUser={(log, target) => openBanModal({ kind: "user", logId: log.id, userId: target, ipAddress: null })}
        onOpenBanIp={(log, target) => openBanModal({ kind: "ip", logId: log.id, userId: null, ipAddress: target })}
        banDraft={banDraft}
        banReasonDraft={banReasonDraft}
        banExpiresAtDraft={banExpiresAtDraft}
        banSaving={banSaving}
        onCloseBan={closeBanModal}
        onBanReasonChange={setBanReasonDraft}
        onBanExpiresAtChange={setBanExpiresAtDraft}
        onConfirmBan={submitBan}
      />
      <CreateAdminModal
        open={createAdminOpen}
        username={createAdminUsername}
        email={createAdminEmail}
        rawPassword={createAdminPassword}
        saving={createAdminSaving}
        onClose={closeCreateAdminModal}
        onUsernameChange={setCreateAdminUsername}
        onEmailChange={setCreateAdminEmail}
        onPasswordChange={setCreateAdminPassword}
        onSubmit={submitCreateAdmin}
      />
      <EditUserModal
        user={editingUser}
        draftRole={editingUserRole}
        saving={editingUserSaving}
        dateText={dateText}
        onClose={closeEditUserModal}
        onRoleChange={setEditingUserRole}
        onSaveRole={saveEditedUserRole}
        onSoftDelete={softDeleteEditedUser}
        onRestore={restoreEditedUser}
      />
    </section>
  );
}
