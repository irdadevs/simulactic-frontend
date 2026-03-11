"use client";

import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/admin.module.css";
import { UserProps, UserRole } from "../../../types/user.types";

type EditUserModalProps = {
  user: UserProps | null;
  draftRole: UserRole;
  saving: boolean;
  dateText: (date: Date) => string;
  onClose: () => void;
  onRoleChange: (value: UserRole) => void;
  onSaveRole: () => Promise<void>;
  onSoftDelete: () => Promise<void>;
  onRestore: () => Promise<void>;
};

export function EditUserModal(props: EditUserModalProps) {
  if (!props.user) return null;

  const user = props.user;

  return (
    <div className={styles.nestedModalBackdrop}>
      <div className={styles.banModalCard}>
        <div className={styles.rowBetween}>
          <h3 className={commonStyles.panelTitle}>Details</h3>
          <button type="button" className={styles.exportButton} onClick={props.onClose}>
            Close
          </button>
        </div>

        <div className={styles.filtersGrid}>
          <div className={styles.filterField}>
            <label>Username</label>
            <input value={user.username} readOnly />
          </div>
          <div className={styles.filterField}>
            <label>Email</label>
            <input value={user.email} readOnly />
          </div>
          <div className={styles.filterField}>
            <label>Role</label>
            <select
              value={props.draftRole}
              onChange={(event) => props.onRoleChange(event.target.value as UserRole)}
            >
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
          </div>
          <div className={styles.filterField}>
            <label>Verified</label>
            <input value={user.verified ? "True" : "False"} readOnly />
          </div>
          <div className={styles.filterField}>
            <label>Supporter</label>
            <input value={user.isSupporter ? "True" : "False"} readOnly />
          </div>
          <div className={styles.filterField}>
            <label>Status</label>
            <input value={user.isDeleted ? "Deleted" : "Active"} readOnly />
          </div>
          <div className={styles.filterField}>
            <label>Created</label>
            <input value={props.dateText(user.createdAt)} readOnly />
          </div>
          <div className={styles.filterField}>
            <label>Last activity</label>
            <input value={props.dateText(user.lastActivityAt)} readOnly />
          </div>
        </div>

        <p className={commonStyles.meta}>
          This is an extended information panel. Just role and delete/restore states are allowed to
          change.
        </p>

        <div className={styles.logActionBar}>
          <button
            type="button"
            className={styles.exportButton}
            disabled={props.saving || props.draftRole === user.role}
            onClick={() => void props.onSaveRole()}
          >
            {props.saving ? "Saving..." : "Save role"}
          </button>
          {user.isDeleted ? (
            <button
              type="button"
              className={styles.exportButton}
              disabled={props.saving}
              onClick={() => void props.onRestore()}
            >
              Restore user
            </button>
          ) : (
            <button
              type="button"
              className={styles.exportButton}
              disabled={props.saving}
              onClick={() => void props.onSoftDelete()}
            >
              Soft delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
