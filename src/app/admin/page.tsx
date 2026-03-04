"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../application/hooks/useAuth";
import { useMetrics } from "../../application/hooks/useMetrics";
import styles from "../../styles/skeleton.module.css";

const MetricsSummary = dynamic(
  () => import("../../ui/components/layout/admin/MetricsSummary").then((mod) => mod.MetricsSummary),
);

const MetricsByTypeChart = dynamic(
  () => import("../../ui/components/layout/admin/MetricsByTypeChart").then((mod) => mod.MetricsByTypeChart),
  { ssr: false },
);

const RecentFailuresTable = dynamic(
  () => import("../../ui/components/layout/admin/RecentFailuresTable").then((mod) => mod.RecentFailuresTable),
);

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loadMe } = useAuth();
  const { dashboard, loadDashboard, isLoading, error } = useMetrics();
  const hasLoadedUserRef = useRef(false);
  const hasLoadedDashboardRef = useRef(false);
  const isAdmin = useMemo(() => user?.role === "Admin", [user?.role]);

  useEffect(() => {
    if (user) return;
    if (hasLoadedUserRef.current) return;
    hasLoadedUserRef.current = true;

    const bootstrapUser = async () => {
      try {
        await loadMe();
      } catch {
        router.replace("/login");
      }
    };
    void bootstrapUser();
  }, [loadMe, router, user]);

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) {
      router.replace("/dashboard");
      return;
    }
    if (hasLoadedDashboardRef.current) return;
    hasLoadedDashboardRef.current = true;
    void loadDashboard({ hours: 24, topLimit: 10 });
  }, [isAdmin, loadDashboard, router, user]);

  if (!user) {
    return <p className={styles.meta}>Checking permissions...</p>;
  }

  if (!isAdmin) {
    return null;
  }

  if (isLoading && !dashboard) {
    return <p className={styles.meta}>Loading metrics dashboard...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (!dashboard) {
    return <p className={styles.meta}>No dashboard data available.</p>;
  }

  return (
    <section className={styles.adminLayout}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <MetricsSummary summary={dashboard.summary} />
      <MetricsByTypeChart byType={dashboard.byType} />
      <RecentFailuresTable rows={dashboard.recentFailures} />
    </section>
  );
}
