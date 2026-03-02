"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import Link from "next/link";
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
  const { user, isAuthenticated, loadMe } = useAuth();
  const { dashboard, loadDashboard, isLoading, error } = useMetrics();

  useEffect(() => {
    const run = async () => {
      if (!isAuthenticated) {
        try {
          await loadMe();
        } catch {
          return;
        }
      }
      if (user?.role === "Admin") {
        await loadDashboard({ hours: 24, topLimit: 10 });
      }
    };
    void run();
  }, [isAuthenticated, loadDashboard, loadMe, user?.role]);

  const isAdmin = useMemo(() => user?.role === "Admin", [user?.role]);

  if (!isAdmin) {
    return (
      <section className={styles.authCard}>
        <h1 className={styles.title}>Admin Access</h1>
        <p className={styles.subtitle}>This area is restricted to administrators.</p>
        <Link href="/dashboard">Back to dashboard</Link>
      </section>
    );
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
