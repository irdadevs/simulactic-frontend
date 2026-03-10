import commonStyles from "../../../../styles/skeleton.module.css";
import styles from "../../../../styles/admin.module.css";
import { AdminSectionStateNotice } from "../AdminSectionStateNotice";
import { LineChart, LineChartPoint } from "../charts/LineChart";

type OverviewSectionProps = {
  usersCount: number;
  supportersCount: number;
  totalReceived: string;
  activeMonthlyDonors: number;
  unresolvedLogs: number;
  metricErrorRate: string;
  usersHistoricByDay: LineChartPoint[];
  donationsHistoricByDay: LineChartPoint[];
  galaxyCreationsHistoricByDay: LineChartPoint[];
  lineChartTicks: number;
  loading: boolean;
  error: string | null;
};

export function OverviewSection(props: OverviewSectionProps) {
  return (
    <section className={styles.sectionGrid}>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Core KPIs</h2>
        <AdminSectionStateNotice loading={props.loading} error={props.error} empty={false} emptyMessage="" />
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}><span>Users</span><strong>{props.usersCount}</strong></div>
          <div className={styles.summaryCard}><span>Supporters</span><strong>{props.supportersCount}</strong></div>
          <div className={styles.summaryCard}><span>Total received</span><strong>{props.totalReceived}</strong></div>
          <div className={styles.summaryCard}><span>Active monthly donors</span><strong>{props.activeMonthlyDonors}</strong></div>
          <div className={styles.summaryCard}><span>Unresolved logs</span><strong>{props.unresolvedLogs}</strong></div>
          <div className={styles.summaryCard}><span>Metric error rate</span><strong>{props.metricErrorRate}</strong></div>
        </div>
      </article>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Charts</h2>
        <div className={styles.chartGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Users historic counter (day by day)</h3>
            <LineChart points={props.usersHistoricByDay} maxTicks={props.lineChartTicks} />
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Donations historic counter EUR (day by day)</h3>
            <LineChart points={props.donationsHistoricByDay} maxTicks={props.lineChartTicks} />
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Galaxy creations historic counter (day by day)</h3>
            <LineChart points={props.galaxyCreationsHistoricByDay} maxTicks={props.lineChartTicks} />
          </div>
        </div>
      </article>
    </section>
  );
}
