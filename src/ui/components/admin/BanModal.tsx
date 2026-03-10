"use client";

import { sileo } from "sileo";
import { describeApiError } from "../../../lib/errors/apiErrorMessage";
import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/admin.module.css";

type BanModalProps = {
  kind: "user" | "ip";
  logId: string;
  target: string;
  reason: string;
  expiresAt: string;
  saving: boolean;
  onClose: () => void;
  onReasonChange: (value: string) => void;
  onExpiresAtChange: (value: string) => void;
  onConfirm: () => Promise<void>;
};

export function BanModal({
  kind,
  logId,
  target,
  reason,
  expiresAt,
  saving,
  onClose,
  onReasonChange,
  onExpiresAtChange,
  onConfirm,
}: BanModalProps) {
  return (
    <div className={styles.nestedModalBackdrop}>
      <div className={styles.banModalCard}>
        <div className={styles.rowBetween}>
          <h3 className={commonStyles.panelTitle}>{kind === "user" ? "Ban user" : "Ban IP"}</h3>
          <button type="button" className={styles.exportButton} onClick={onClose}>Close</button>
        </div>
        <div className={styles.filtersGrid}>
          <div className={styles.filterField}>
            <label>Source</label>
            <input value="admin" readOnly />
          </div>
          <div className={styles.filterField}>
            <label>Log</label>
            <input value={logId} readOnly />
          </div>
          <div className={styles.filterField}>
            <label>{kind === "user" ? "User ID" : "IP address"}</label>
            <input value={target} readOnly />
          </div>
          <div className={styles.filterField}>
            <label>Expires at</label>
            <input type="datetime-local" value={expiresAt} onChange={(event) => onExpiresAtChange(event.target.value)} />
          </div>
        </div>
        <div className={styles.filterField}>
          <label>Reason</label>
          <textarea
            className={styles.adminNoteTextarea}
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Describe why this user or IP is being banned."
            rows={5}
          />
        </div>
        <div className={styles.logActionBar}>
          <button
            type="button"
            className={styles.exportButton}
            disabled={saving || reason.trim().length < 5}
            onClick={() => {
              void onConfirm().then(() => {
                sileo.success({
                  title: kind === "user" ? "User banned" : "IP banned",
                  description: "The ban was created successfully.",
                });
              }).catch((error: unknown) => {
                sileo.error({
                  title: "Ban failed",
                  description: describeApiError(error, "Could not create the ban."),
                });
              });
            }}
          >
            Confirm ban
          </button>
        </div>
      </div>
    </div>
  );
}
