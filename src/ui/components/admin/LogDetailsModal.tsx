"use client";

import { sileo } from "sileo";
import { LogProps } from "../../../types/log.types";
import { isHandledSessionExpiryError } from "../../../infra/api/client";
import { describeApiError } from "../../../lib/errors/apiErrorMessage";
import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/admin.module.css";

type LogDetailsModalProps = {
  log: LogProps;
  adminNoteDraft: string;
  adminNoteSaving: boolean;
  canBanUser: boolean;
  canBanIp: boolean;
  dateText: (date: Date) => string;
  onClose: () => void;
  onNoteChange: (value: string) => void;
  onSaveNote: () => Promise<void>;
  onDeleteNote: () => Promise<void>;
  onBanUser: () => void;
  onBanIp: () => void;
};

export function LogDetailsModal({
  log,
  adminNoteDraft,
  adminNoteSaving,
  canBanUser,
  canBanIp,
  dateText,
  onClose,
  onNoteChange,
  onSaveNote,
  onDeleteNote,
  onBanUser,
  onBanIp,
}: LogDetailsModalProps) {
  return (
    <div className={styles.logDetailsBackdrop}>
      <div className={styles.logDetailsCard}>
        <div className={styles.rowBetween}>
          <h3 className={commonStyles.panelTitle}>Log Details</h3>
          <button className={styles.exportButton} onClick={onClose}>Close</button>
        </div>
        <section className={styles.adminNoteBlock}>
          <div className={styles.rowBetween}>
            <div>
              <p className={styles.adminNoteLabel}>Admin note</p>
              <p className={styles.adminNoteMeta}>
                {log.adminNoteUpdatedAt
                  ? `Last updated ${dateText(log.adminNoteUpdatedAt)}${log.adminNoteUpdatedBy ? ` by ${log.adminNoteUpdatedBy}` : ""}`
                  : "No admin note saved yet"}
              </p>
            </div>
          </div>
          <textarea
            className={styles.adminNoteTextarea}
            value={adminNoteDraft}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Add internal handling notes for this log."
            rows={4}
          />
          <div className={styles.adminNoteActions}>
            <button
              className={styles.exportButton}
              disabled={adminNoteSaving || adminNoteDraft.trim().length === 0 || adminNoteDraft.trim() === (log.adminNote ?? "")}
              onClick={() => {
                void onSaveNote().then(() => {
                  sileo.success({
                    title: "Admin note saved",
                    description: "The log note was updated.",
                  });
                }).catch((error: unknown) => {
                  if (isHandledSessionExpiryError(error)) {
                    return;
                  }
                  sileo.error({
                    title: "Admin note save failed",
                    description: describeApiError(error, "Could not save the admin note."),
                  });
                });
              }}
            >
              Save note
            </button>
            <button
              className={styles.exportButton}
              disabled={adminNoteSaving || !log.adminNote}
              onClick={() => {
                void onDeleteNote().then(() => {
                  sileo.success({
                    title: "Admin note deleted",
                    description: "The log note was cleared.",
                  });
                }).catch((error: unknown) => {
                  if (isHandledSessionExpiryError(error)) {
                    return;
                  }
                  sileo.error({
                    title: "Admin note delete failed",
                    description: describeApiError(error, "Could not delete the admin note."),
                  });
                });
              }}
            >
              Delete note
            </button>
          </div>
        </section>
        <pre className={styles.logDetailsPre}>{JSON.stringify(log, null, 2)}</pre>
        <div className={styles.logActionBar}>
          <button type="button" className={styles.exportButton} disabled={!canBanUser} onClick={onBanUser}>
            Ban user
          </button>
          <button type="button" className={styles.exportButton} disabled={!canBanIp} onClick={onBanIp}>
            Ban IP
          </button>
        </div>
      </div>
    </div>
  );
}
