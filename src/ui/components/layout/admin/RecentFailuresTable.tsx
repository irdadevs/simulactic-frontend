import styles from "../../../../styles/skeleton.module.css";
import { MetricsDashboardResponse } from "../../../../infra/api/metric.api";

type RecentFailuresTableProps = {
  rows: MetricsDashboardResponse["recentFailures"];
};

export function RecentFailuresTable({ rows }: RecentFailuresTableProps) {
  return (
    <section className={styles.adminCard}>
      <h2 className={styles.panelTitle}>Recent Failures</h2>
      <div className={styles.adminTableWrap}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Source</th>
              <th>Duration</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.metricName}</td>
                <td>{row.metricType}</td>
                <td>{row.source}</td>
                <td>{row.durationMs}ms</td>
                <td>{new Date(row.occurredAt).toLocaleString()}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.meta}>
                  No failures in selected window.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
