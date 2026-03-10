import commonStyles from "../../../../styles/skeleton.module.css";
import styles from "../../../../styles/admin.module.css";
import { MetricProps, MetricType } from "../../../../types/metric.types";
import { AdminSectionStateNotice } from "../AdminSectionStateNotice";
import { BarChart } from "../charts/BarChart";

type MetricByTypeItem = {
  type: MetricType;
  count: number;
  avg: number;
  errors: number;
};

type MetricsSectionProps = {
  metricsCount: number;
  metricErrorsCount: number;
  errorRate: string;
  avgDuration: string;
  loading: boolean;
  error: string | null;
  metricByType: MetricByTypeItem[];
  metricErrorsByType: Array<{ label: string; value: number }>;
  metricErrors: MetricProps[];
  dateText: (date: Date) => string;
};

export function MetricsSection(props: MetricsSectionProps) {
  return (
    <section className={styles.sectionGrid}>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Global metric cards</h2>
        <AdminSectionStateNotice
          loading={props.loading}
          error={props.error}
          empty={props.metricsCount === 0}
          emptyMessage="No metrics in the selected range."
        />
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}><span>Total metrics</span><strong>{props.metricsCount}</strong></div>
          <div className={styles.summaryCard}><span>Total errors</span><strong>{props.metricErrorsCount}</strong></div>
          <div className={styles.summaryCard}><span>Error rate</span><strong>{props.errorRate}</strong></div>
          <div className={styles.summaryCard}><span>Avg duration</span><strong>{props.avgDuration} ms</strong></div>
        </div>
      </article>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Metrics by type (responses and averages)</h2>
        <div className={styles.summaryGrid}>
          {props.metricByType.map((item) => (
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
        <BarChart points={props.metricErrorsByType} />
      </article>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Metric errors list ({props.metricErrors.length})</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>When</th>
                <th>Name</th>
                <th>Type</th>
                <th>Source</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {props.metricErrors.map((metric, index) => (
                <tr key={`${metric.id}-${metric.occurredAt.getTime()}-${metric.metricName}-${metric.source}-${index}`}>
                  <td>{props.dateText(metric.occurredAt)}</td>
                  <td>{metric.metricName}</td>
                  <td>{metric.metricType}</td>
                  <td>{metric.source}</td>
                  <td>{metric.durationMs.toFixed(2)} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
