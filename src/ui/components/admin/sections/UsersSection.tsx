import { UserProps, UserRole } from "../../../../types/user.types";
import commonStyles from "../../../../styles/skeleton.module.css";
import styles from "../../../../styles/admin.module.css";
import { AdminPagination } from "../AdminPagination";
import { AdminSectionStateNotice } from "../AdminSectionStateNotice";

type UsersSectionProps = {
  usersFilteredCount: number;
  totalUsers: number;
  userSearch: string;
  role: "all" | UserRole;
  supporter: "all" | "yes" | "no";
  verified: "all" | "yes" | "no";
  onUserSearchChange: (value: string) => void;
  onRoleChange: (value: "all" | UserRole) => void;
  onSupporterChange: (value: "all" | "yes" | "no") => void;
  onVerifiedChange: (value: "all" | "yes" | "no") => void;
  onExportCsv: () => void;
  onOpenCreateAdmin: () => void;
  userGlobalCards: { total: number; week: number; month: number; year: number };
  loading: boolean;
  error: string | null;
  usersVisible: UserProps[];
  summary: string;
  usersPageSafe: number;
  usersTotalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onEditUser: (user: UserProps) => void;
  userRoleClassName: (role: string, isSupporter: boolean) => string;
  dateText: (date: Date) => string;
};

export function UsersSection(props: UsersSectionProps) {
  return (
    <section className={styles.sectionGrid}>
      <article className={styles.card}>
        <div className={styles.rowBetween}>
          <h2 className={commonStyles.panelTitle}>
            Users ({props.usersFilteredCount} / {props.totalUsers})
          </h2>
          <div className={styles.paginationControls}>
            <button className={styles.exportButton} onClick={props.onOpenCreateAdmin}>
              Create admin
            </button>
            <button className={styles.exportButton} onClick={props.onExportCsv}>
              Export CSV
            </button>
          </div>
        </div>
        <div className={styles.filtersGrid}>
          <div className={styles.filterField}>
            <label>Search</label>
            <input
              value={props.userSearch}
              onChange={(event) => props.onUserSearchChange(event.target.value)}
            />
          </div>
          <div className={styles.filterField}>
            <label>Role</label>
            <select
              value={props.role}
              onChange={(event) => props.onRoleChange(event.target.value as "all" | UserRole)}
            >
              <option value="all">All</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
          </div>
          <div className={styles.filterField}>
            <label>Supporter</label>
            <select
              value={props.supporter}
              onChange={(event) =>
                props.onSupporterChange(event.target.value as "all" | "yes" | "no")
              }
            >
              <option value="all">All</option>
              <option value="yes">True</option>
              <option value="no">False</option>
            </select>
          </div>
          <div className={styles.filterField}>
            <label>Verified</label>
            <select
              value={props.verified}
              onChange={(event) =>
                props.onVerifiedChange(event.target.value as "all" | "yes" | "no")
              }
            >
              <option value="all">All</option>
              <option value="yes">True</option>
              <option value="no">False</option>
            </select>
          </div>
        </div>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span>Total users</span>
            <strong>{props.userGlobalCards.total}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span>This week</span>
            <strong>{props.userGlobalCards.week}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span>This month</span>
            <strong>{props.userGlobalCards.month}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span>This year</span>
            <strong>{props.userGlobalCards.year}</strong>
          </div>
        </div>
        <AdminSectionStateNotice
          loading={props.loading}
          error={props.error}
          empty={props.usersFilteredCount === 0}
          emptyMessage="No users match the current filters."
        />
        <AdminPagination
          currentPage={props.usersPageSafe}
          totalPages={props.usersTotalPages}
          onPrev={props.onPrevPage}
          onNext={props.onNextPage}
          summary={props.summary}
        />
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Supporter</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {props.usersVisible.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`${styles.cellBadge} ${props.userRoleClassName(user.role, user.isSupporter)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>{user.isSupporter ? "Yes" : "No"}</td>
                  <td>{props.dateText(user.createdAt)}</td>
                  <td>
                    <button className={styles.exportButton} onClick={() => props.onEditUser(user)}>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminPagination
          currentPage={props.usersPageSafe}
          totalPages={props.usersTotalPages}
          onPrev={props.onPrevPage}
          onNext={props.onNextPage}
          centered
        />
      </article>
    </section>
  );
}
