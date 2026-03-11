"use client";

import { FormEvent } from "react";
import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/admin.module.css";

type CreateAdminModalProps = {
  open: boolean;
  username: string;
  email: string;
  rawPassword: string;
  saving: boolean;
  onClose: () => void;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => Promise<void>;
};

export function CreateAdminModal(props: CreateAdminModalProps) {
  if (!props.open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void props.onSubmit();
  };

  return (
    <div className={styles.nestedModalBackdrop}>
      <div className={styles.banModalCard}>
        <div className={styles.rowBetween}>
          <h3 className={commonStyles.panelTitle}>Create admin</h3>
          <button type="button" className={styles.exportButton} onClick={props.onClose}>Close</button>
        </div>
        <form className={commonStyles.form} onSubmit={handleSubmit}>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label>Role</label>
              <input value="Admin" readOnly />
            </div>
            <div className={styles.filterField}>
              <label>Verified</label>
              <input value="True" readOnly />
            </div>
            <div className={styles.filterField}>
              <label>Username</label>
              <input
                value={props.username}
                onChange={(event) => props.onUsernameChange(event.target.value)}
                minLength={5}
                maxLength={30}
                required
              />
            </div>
            <div className={styles.filterField}>
              <label>Email</label>
              <input
                type="email"
                value={props.email}
                onChange={(event) => props.onEmailChange(event.target.value)}
                required
              />
            </div>
            <div className={styles.filterField}>
              <label>Password</label>
              <input
                type="password"
                value={props.rawPassword}
                onChange={(event) => props.onPasswordChange(event.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>
          <div className={styles.logActionBar}>
            <button
              type="submit"
              className={styles.exportButton}
              disabled={
                props.saving ||
                props.username.trim().length < 5 ||
                props.email.trim().length === 0 ||
                props.rawPassword.length < 6
              }
            >
              {props.saving ? "Creating..." : "Create admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
