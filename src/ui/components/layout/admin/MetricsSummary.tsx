import adminStyles from "../../../../styles/admin.module.css";
import commonStyles from "../../../../styles/skeleton.module.css";
import { MetricsDashboardResponse } from "../../../../infra/api/metric.api";

type MetricsSummaryProps = {
  summary: MetricsDashboardResponse["summary"];
};

export function MetricsSummary({ summary }: MetricsSummaryProps) {
  return (
    <section className={adminStyles.adminCard}>
      <h2 className={commonStyles.panelTitle}>Performance Summary</h2>
      <div className={adminStyles.adminGrid}>
        <p className={commonStyles.meta}>Total: {summary.total}</p>
        <p className={commonStyles.meta}>Avg: {summary.avgDurationMs.toFixed(2)}ms</p>
        <p className={commonStyles.meta}>P95: {summary.p95DurationMs.toFixed(2)}ms</p>
        <p className={commonStyles.meta}>P99: {summary.p99DurationMs.toFixed(2)}ms</p>
        <p className={commonStyles.meta}>Max: {summary.maxDurationMs.toFixed(2)}ms</p>
        <p className={commonStyles.meta}>Error Rate: {(summary.errorRate * 100).toFixed(2)}%</p>
      </div>
    </section>
  );
}
