import styles from "../../../../styles/skeleton.module.css";
import { MetricsDashboardResponse } from "../../../../infra/api/metric.api";

type MetricsSummaryProps = {
  summary: MetricsDashboardResponse["summary"];
};

export function MetricsSummary({ summary }: MetricsSummaryProps) {
  return (
    <section className={styles.adminCard}>
      <h2 className={styles.panelTitle}>Performance Summary</h2>
      <div className={styles.adminGrid}>
        <p className={styles.meta}>Total: {summary.total}</p>
        <p className={styles.meta}>Avg: {summary.avgDurationMs.toFixed(2)}ms</p>
        <p className={styles.meta}>P95: {summary.p95DurationMs.toFixed(2)}ms</p>
        <p className={styles.meta}>P99: {summary.p99DurationMs.toFixed(2)}ms</p>
        <p className={styles.meta}>Max: {summary.maxDurationMs.toFixed(2)}ms</p>
        <p className={styles.meta}>Error Rate: {(summary.errorRate * 100).toFixed(2)}%</p>
      </div>
    </section>
  );
}
