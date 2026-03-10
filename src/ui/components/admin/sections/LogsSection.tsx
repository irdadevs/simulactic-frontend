import commonStyles from "../../../../styles/skeleton.module.css";
import styles from "../../../../styles/admin.module.css";
import { LogProps } from "../../../../types/log.types";
import { AdminPagination } from "../AdminPagination";
import { AdminSectionStateNotice } from "../AdminSectionStateNotice";

type LogCountByLevel = {
  level: "debug" | "info" | "warn" | "error" | "critical";
  count: number;
};

type LogCountByCategory = {
  category: "application" | "security" | "audit" | "infrastructure";
  count: number;
};

type LogsSectionProps = {
  logsFilteredCount: number;
  totalLogs: number;
  loading: boolean;
  error: string | null;
  logState: "all" | "open" | "resolved";
  logLevelFilter: "all" | "debug" | "info" | "warn" | "error" | "critical";
  logCategoryFilter: "all" | "application" | "security" | "audit" | "infrastructure";
  resolveLogLevel: "all" | "debug" | "warn" | "error" | "critical";
  openLogs: number;
  closedLogs: number;
  logByLevel: LogCountByLevel[];
  logByCategory: LogCountByCategory[];
  bulkResolvableCount: number;
  logsVisible: LogProps[];
  summary: string;
  logsPageSafe: number;
  logsTotalPages: number;
  loadingLogDetails: boolean;
  onLogStateChange: (value: "all" | "open" | "resolved") => void;
  onLogLevelFilterChange: (value: "all" | "debug" | "info" | "warn" | "error" | "critical") => void;
  onLogCategoryFilterChange: (value: "all" | "application" | "security" | "audit" | "infrastructure") => void;
  onResolveLogLevelChange: (value: "all" | "debug" | "warn" | "error" | "critical") => void;
  onResolveAll: () => void;
  onResolveLog: (logId: string) => void;
  onReopenLog: (logId: string) => void;
  onOpenDetails: (logId: string) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  logLevelClassName: (level: string) => string;
  dateText: (date: Date) => string;
};

export function LogsSection(props: LogsSectionProps) {
  return (
    <section className={styles.sectionGrid}>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Logs ({props.logsFilteredCount} / {props.totalLogs})</h2>
        <AdminSectionStateNotice
          loading={props.loading}
          error={props.error}
          empty={props.logsFilteredCount === 0}
          emptyMessage="No logs match the current filters."
        />
        <div className={styles.filtersGrid}>
          <div className={styles.filterField}>
            <label>State</label>
            <select
              value={props.logState}
              onChange={(event) => props.onLogStateChange(event.target.value as "all" | "open" | "resolved")}
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className={styles.filterField}>
            <label>Category</label>
            <select
              value={props.logCategoryFilter}
              onChange={(event) =>
                props.onLogCategoryFilterChange(
                  event.target.value as "all" | "application" | "security" | "audit" | "infrastructure",
                )
              }
            >
              <option value="all">All</option>
              <option value="application">Application</option>
              <option value="security">Security</option>
              <option value="audit">Audit</option>
              <option value="infrastructure">Infrastructure</option>
            </select>
          </div>
          <div className={styles.filterField}>
            <label>Level</label>
            <select
              value={props.logLevelFilter}
              onChange={(event) =>
                props.onLogLevelFilterChange(
                  event.target.value as "all" | "debug" | "info" | "warn" | "error" | "critical",
                )
              }
            >
              <option value="all">All</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}><span>Open logs</span><strong>{props.openLogs}</strong></div>
          <div className={styles.summaryCard}><span>Closed logs</span><strong>{props.closedLogs}</strong></div>
        </div>
        <p className={styles.summarySubtitle}>By level totals</p>
        <div className={styles.summaryGrid}>
          {props.logByLevel.map((item) => (
            <div key={item.level} className={styles.summaryCard}>
              <span>{item.level}</span>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
        <p className={styles.summarySubtitle}>By category totals</p>
        <div className={styles.summaryGrid}>
          {props.logByCategory.map((item) => (
            <div key={item.category} className={styles.summaryCard}>
              <span>{item.category}</span>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
        <div className={styles.bulkResolveBar}>
          <div className={styles.bulkResolveControls}>
            <div className={styles.bulkResolveField}>
              <label>Resolve level</label>
              <select
                value={props.resolveLogLevel}
                onChange={(event) =>
                  props.onResolveLogLevelChange(
                    event.target.value as "all" | "debug" | "warn" | "error" | "critical",
                  )
                }
              >
                <option value="all">All</option>
                <option value="debug">Debug</option>
                <option value="warn">Warn</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <button
              className={styles.exportButton}
              disabled={props.bulkResolvableCount === 0}
              onClick={props.onResolveAll}
            >
              Resolve all
            </button>
          </div>
        </div>
        <AdminPagination
          currentPage={props.logsPageSafe}
          totalPages={props.logsTotalPages}
          onPrev={props.onPrevPage}
          onNext={props.onNextPage}
          summary={props.summary}
        />
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>When</th>
                <th>Level</th>
                <th>Category</th>
                <th>Source</th>
                <th>Message</th>
                <th>State</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {props.logsVisible.map((log) => (
                <tr key={log.id}>
                  <td>{props.dateText(log.occurredAt)}</td>
                  <td><span className={`${styles.cellBadge} ${props.logLevelClassName(log.level)}`}>{log.level}</span></td>
                  <td>{log.category}</td>
                  <td>{log.source}</td>
                  <td>{log.message}</td>
                  <td>{log.resolvedAt ? "Resolved" : "Open"}</td>
                  <td>
                    {!log.resolvedAt ? (
                      <button className={styles.exportButton} onClick={() => props.onResolveLog(log.id)}>
                        Mark as Resolved
                      </button>
                    ) : log.level !== "info" ? (
                      <button className={styles.exportButton} onClick={() => props.onReopenLog(log.id)}>
                        Reopen
                      </button>
                    ) : (
                      "No action"
                    )}
                  </td>
                  <td>
                    <button
                      className={styles.exportButton}
                      disabled={props.loadingLogDetails}
                      onClick={() => props.onOpenDetails(log.id)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminPagination
          currentPage={props.logsPageSafe}
          totalPages={props.logsTotalPages}
          onPrev={props.onPrevPage}
          onNext={props.onNextPage}
          centered
        />
      </article>
    </section>
  );
}
