import commonStyles from "../../../../styles/skeleton.module.css";
import styles from "../../../../styles/admin.module.css";
import { AdminPagination } from "../AdminPagination";
import { AdminSectionStateNotice } from "../AdminSectionStateNotice";
import { BarChart } from "../charts/BarChart";
import { LineChart, LineChartPoint } from "../charts/LineChart";

type UserBanRow = {
  id: string;
  userId: string;
  reason: string;
  source: string;
  bannedBy: string | null;
  createdAt: Date;
  expiresAt: Date | null;
};

type IpBanRow = {
  id: string;
  ipAddress: string;
  reason: string;
  source: string;
  bannedBy: string | null;
  createdAt: Date;
  expiresAt: Date | null;
};

type BansSectionProps = {
  loading: boolean;
  error: string | null;
  totalActiveBans: number;
  bannedUsersCount: number;
  bannedIpsCount: number;
  adminIssuedBans: number;
  expiringBans: number;
  userBansByDay: LineChartPoint[];
  ipBansByDay: LineChartPoint[];
  lineChartTicks: number;
  listView: "users" | "ips";
  onListViewChange: (value: "users" | "ips") => void;
  userBansVisible: UserBanRow[];
  ipBansVisible: IpBanRow[];
  totalUserBans: number;
  totalIpBans: number;
  bansPageSafe: number;
  bansTotalPages: number;
  bansSummary: string;
  onPrevPage: () => void;
  onNextPage: () => void;
  onUnbanUser: (userId: string) => void;
  onUnbanIp: (ipAddress: string) => void;
  securitySignalsCount: number;
  autoBanEventsCount: number;
  distinctIpsCount: number;
  securitySignalsByDay: LineChartPoint[];
  securityTopIps: Array<{ label: string; value: number }>;
  dateText: (date: Date) => string;
};

export function BansSection(props: BansSectionProps) {
  return (
    <section className={styles.sectionGrid}>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Active bans overview</h2>
        <AdminSectionStateNotice
          loading={props.loading}
          error={props.error}
          empty={props.totalActiveBans === 0 && props.securitySignalsCount === 0}
          emptyMessage="No bans or abuse signals in the selected range."
        />
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}><span>Total active bans</span><strong>{props.totalActiveBans}</strong></div>
          <div className={styles.summaryCard}><span>Banned users</span><strong>{props.bannedUsersCount}</strong></div>
          <div className={styles.summaryCard}><span>Banned IPs</span><strong>{props.bannedIpsCount}</strong></div>
          <div className={styles.summaryCard}><span>Admin issued</span><strong>{props.adminIssuedBans}</strong></div>
          <div className={styles.summaryCard}><span>System issued</span><strong>{props.totalActiveBans - props.adminIssuedBans}</strong></div>
          <div className={styles.summaryCard}><span>Expiring bans</span><strong>{props.expiringBans}</strong></div>
        </div>
      </article>
      <article className={styles.card}>
        <div className={styles.chartGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>User bans by day</h3>
            <LineChart points={props.userBansByDay} maxTicks={props.lineChartTicks} />
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>IP bans by day</h3>
            <LineChart points={props.ipBansByDay} maxTicks={props.lineChartTicks} />
          </div>
        </div>
      </article>
      <article className={styles.card}>
        <div className={styles.rowBetween}>
          <h2 className={commonStyles.panelTitle}>Active ban list</h2>
          <div className={styles.inlineToggleGroup}>
            <button
              className={props.listView === "users" ? styles.inlineToggleActive : styles.inlineToggle}
              onClick={() => props.onListViewChange("users")}
            >
              Users
            </button>
            <button
              className={props.listView === "ips" ? styles.inlineToggleActive : styles.inlineToggle}
              onClick={() => props.onListViewChange("ips")}
            >
              IPs
            </button>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              {props.listView === "users" ? (
                <tr><th>User ID</th><th>Reason</th><th>Source</th><th>Banned by</th><th>Created</th><th>Expires</th><th>Action</th></tr>
              ) : (
                <tr><th>IP address</th><th>Reason</th><th>Source</th><th>Banned by</th><th>Created</th><th>Expires</th><th>Action</th></tr>
              )}
            </thead>
            <tbody>
              {props.listView === "users" ? (
                props.totalUserBans === 0 ? (
                  <tr>
                    <td colSpan={7}>No active user bans.</td>
                  </tr>
                ) : (
                  props.userBansVisible.map((ban) => (
                    <tr key={ban.id}>
                      <td>{ban.userId}</td>
                      <td>{ban.reason}</td>
                      <td><span className={styles.cellBadge}>{ban.source}</span></td>
                      <td>{ban.bannedBy ?? "-"}</td>
                      <td>{props.dateText(ban.createdAt)}</td>
                      <td>{ban.expiresAt ? props.dateText(ban.expiresAt) : "Never"}</td>
                      <td>
                        <button className={styles.exportButton} onClick={() => props.onUnbanUser(ban.userId)}>
                          Unban
                        </button>
                      </td>
                    </tr>
                  ))
                )
              ) : props.totalIpBans === 0 ? (
                <tr>
                  <td colSpan={7}>No active IP bans.</td>
                </tr>
              ) : (
                props.ipBansVisible.map((ban) => (
                  <tr key={ban.id}>
                    <td>{ban.ipAddress}</td>
                    <td>{ban.reason}</td>
                    <td><span className={styles.cellBadge}>{ban.source}</span></td>
                    <td>{ban.bannedBy ?? "-"}</td>
                    <td>{props.dateText(ban.createdAt)}</td>
                    <td>{ban.expiresAt ? props.dateText(ban.expiresAt) : "Never"}</td>
                    <td>
                      <button className={styles.exportButton} onClick={() => props.onUnbanIp(ban.ipAddress)}>
                        Unban
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          currentPage={props.bansPageSafe}
          totalPages={props.bansTotalPages}
          onPrev={props.onPrevPage}
          onNext={props.onNextPage}
          summary={props.bansSummary}
          centered
        />
      </article>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Abuse observability</h2>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}><span>Security signals</span><strong>{props.securitySignalsCount}</strong></div>
          <div className={styles.summaryCard}><span>Auto-ban events</span><strong>{props.autoBanEventsCount}</strong></div>
          <div className={styles.summaryCard}><span>Distinct IPs</span><strong>{props.distinctIpsCount}</strong></div>
        </div>
        <div className={styles.chartGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Security signals by day</h3>
            <LineChart points={props.securitySignalsByDay} maxTicks={props.lineChartTicks} />
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Top abusive IPs</h3>
            <BarChart points={props.securityTopIps} />
          </div>
        </div>
      </article>
    </section>
  );
}
