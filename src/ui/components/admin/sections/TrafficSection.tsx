import commonStyles from "../../../../styles/skeleton.module.css";
import styles from "../../../../styles/admin.module.css";
import { AdminPagination } from "../AdminPagination";
import { AdminSectionStateNotice } from "../AdminSectionStateNotice";
import { BarChart } from "../charts/BarChart";
import { LineChart, LineChartPoint } from "../charts/LineChart";

type TrafficRoute = {
  path: string;
  views: number;
  uniqueSessions: number;
  avgDurationMs: number;
};

type RecentTrafficRow = {
  id: string;
  occurredAt: Date;
  path: string | null;
  fullPath: string | null;
  referrerHost: string | null;
  sessionId: string | null;
  viewport: { width: number; height: number } | null;
};

type TrafficSectionProps = {
  overview: {
    pageViews: number;
    uniqueSessions: number;
    trackedRoutes: number;
    externalReferrals: number;
  } | null;
  loading: boolean;
  error: string | null;
  trafficViewsByDay: LineChartPoint[];
  lineChartTicks: number;
  topTrafficBars: Array<{ label: string; value: number }>;
  referrers: Array<{ referrer: string; views: number }>;
  trafficRoutes: TrafficRoute[];
  trafficRoutesVisible: TrafficRoute[];
  trafficRoutesPageSafe: number;
  trafficRoutesTotalPages: number;
  trafficRoutesSummary: string;
  onPrevRoutesPage: () => void;
  onNextRoutesPage: () => void;
  recentTraffic: RecentTrafficRow[];
  recentTrafficVisible: RecentTrafficRow[];
  trafficRecentPageSafe: number;
  trafficRecentTotalPages: number;
  recentTrafficSummary: string;
  onPrevRecentPage: () => void;
  onNextRecentPage: () => void;
  dateText: (date: Date) => string;
  rangeCapped: boolean;
};

export function TrafficSection(props: TrafficSectionProps) {
  return (
    <section className={styles.sectionGrid}>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Traffic overview</h2>
        <AdminSectionStateNotice
          loading={props.loading}
          error={props.error}
          empty={(props.overview?.pageViews ?? 0) === 0}
          emptyMessage="No traffic in the selected range."
        />
        {props.rangeCapped ? (
          <p className={commonStyles.meta}>Traffic analytics is capped to the latest 366 days of the selected range.</p>
        ) : null}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}><span>Page views</span><strong>{props.overview?.pageViews ?? 0}</strong></div>
          <div className={styles.summaryCard}><span>Unique sessions</span><strong>{props.overview?.uniqueSessions ?? 0}</strong></div>
          <div className={styles.summaryCard}><span>Tracked routes</span><strong>{props.overview?.trackedRoutes ?? 0}</strong></div>
          <div className={styles.summaryCard}><span>External referrals</span><strong>{props.overview?.externalReferrals ?? 0}</strong></div>
        </div>
      </article>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Traffic trend by day</h2>
        <LineChart points={props.trafficViewsByDay} maxTicks={props.lineChartTicks} />
      </article>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Top visited paths</h2>
        <BarChart points={props.topTrafficBars} />
      </article>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Top referrers</h2>
        <div className={styles.summaryGrid}>
          {props.referrers.length === 0 ? (
            <div className={styles.summaryCard}><span>No traffic tracked yet</span><strong>0</strong></div>
          ) : (
            props.referrers.map((item) => (
              <div key={item.referrer} className={styles.summaryCard}>
                <span>{item.referrer}</span>
                <strong>{item.views}</strong>
              </div>
            ))
          )}
        </div>
      </article>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Route breakdown</h2>
        <AdminPagination
          currentPage={props.trafficRoutesPageSafe}
          totalPages={props.trafficRoutesTotalPages}
          onPrev={props.onPrevRoutesPage}
          onNext={props.onNextRoutesPage}
          summary={props.trafficRoutesSummary}
        />
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Path</th>
                <th>Views</th>
                <th>Unique sessions</th>
                <th>Avg duration</th>
              </tr>
            </thead>
            <tbody>
              {props.trafficRoutes.length === 0 ? (
                <tr>
                  <td colSpan={4}>No route traffic in the selected range.</td>
                </tr>
              ) : (
                props.trafficRoutesVisible.map((item) => (
                  <tr key={item.path}>
                    <td>{item.path}</td>
                    <td>{item.views}</td>
                    <td>{item.uniqueSessions}</td>
                    <td>{item.avgDurationMs.toFixed(2)} ms</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          currentPage={props.trafficRoutesPageSafe}
          totalPages={props.trafficRoutesTotalPages}
          onPrev={props.onPrevRoutesPage}
          onNext={props.onNextRoutesPage}
          centered
        />
      </article>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Recent page views</h2>
        <AdminPagination
          currentPage={props.trafficRecentPageSafe}
          totalPages={props.trafficRecentTotalPages}
          onPrev={props.onPrevRecentPage}
          onNext={props.onNextRecentPage}
          summary={props.recentTrafficSummary}
        />
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>When</th>
                <th>Path</th>
                <th>Referrer</th>
                <th>Session</th>
                <th>Viewport</th>
              </tr>
            </thead>
            <tbody>
              {props.recentTraffic.length === 0 ? (
                <tr>
                  <td colSpan={5}>No recent page views in the selected range.</td>
                </tr>
              ) : (
                props.recentTrafficVisible.map((metric, index) => {
                  const viewport = metric.viewport ? `${metric.viewport.width}x${metric.viewport.height}` : "-";
                  const path = metric.fullPath ?? metric.path ?? "-";
                  const session = metric.sessionId ? metric.sessionId.slice(0, 8) : "-";

                  return (
                    <tr key={`${metric.id}-${metric.occurredAt.getTime()}-${path}-${session}-${index}`}>
                      <td>{props.dateText(metric.occurredAt)}</td>
                      <td>{path}</td>
                      <td>{metric.referrerHost ?? "direct"}</td>
                      <td>{session}</td>
                      <td>{viewport}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          currentPage={props.trafficRecentPageSafe}
          totalPages={props.trafficRecentTotalPages}
          onPrev={props.onPrevRecentPage}
          onNext={props.onNextRecentPage}
          centered
        />
      </article>
    </section>
  );
}
