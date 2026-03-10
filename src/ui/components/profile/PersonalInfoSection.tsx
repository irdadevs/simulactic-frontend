import Image from "next/image";
import { FormEvent } from "react";
import { ActionButton } from "../buttons/ActionButton";
import { AnalyticsPreferenceCard } from "../settings/AnalyticsPreferenceCard";
import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/me.module.css";
import { UserProps } from "../../../types/user.types";

type PersonalInfoSectionProps = {
  user: UserProps | null | undefined;
  toDate: (value: Date) => string;
  newUsername: string;
  newEmail: string;
  currentPassword: string;
  newPassword: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  savingUsername: boolean;
  savingEmail: boolean;
  savingPassword: boolean;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onToggleCurrentPassword: () => void;
  onToggleNewPassword: () => void;
  onUsernameSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEmailSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PersonalInfoSection(props: PersonalInfoSectionProps) {
  return (
    <div className={styles.sectionGrid}>
      <section className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Current account</h2>
        <div className={styles.kvList}>
          <div>
            <span className={styles.kvLabel}>Username</span>
            <strong>{props.user?.username ?? "-"}</strong>
          </div>
          <div>
            <span className={styles.kvLabel}>Email</span>
            <strong>{props.user?.email ?? "-"}</strong>
          </div>
          <div>
            <span className={styles.kvLabel}>Role</span>
            <strong>{props.user?.role ?? "-"}</strong>
          </div>
          <div>
            <span className={styles.kvLabel}>Supporter</span>
            <strong>{props.user?.isSupporter ? "Yes" : "No"}</strong>
          </div>
          <div>
            <span className={styles.kvLabel}>Created</span>
            <strong>{props.user ? props.toDate(props.user.createdAt) : "-"}</strong>
          </div>
          <div>
            <span className={styles.kvLabel}>Last activity</span>
            <strong>{props.user ? props.toDate(props.user.lastActivityAt) : "-"}</strong>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Update username</h2>
        <form className={commonStyles.form} onSubmit={props.onUsernameSubmit}>
          <div className={commonStyles.field}>
            <label htmlFor="new-username">New username</label>
            <input
              id="new-username"
              type="text"
              value={props.newUsername}
              onChange={(event) => props.onUsernameChange(event.target.value)}
              minLength={3}
              maxLength={25}
              required
            />
          </div>
          <ActionButton type="submit" disabled={props.savingUsername}>
            {props.savingUsername ? "Saving..." : "Save username"}
          </ActionButton>
        </form>
      </section>

      <section className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Update email</h2>
        <form className={commonStyles.form} onSubmit={props.onEmailSubmit}>
          <div className={commonStyles.field}>
            <label htmlFor="new-email">New email</label>
            <input
              id="new-email"
              type="email"
              value={props.newEmail}
              onChange={(event) => props.onEmailChange(event.target.value)}
              required
            />
          </div>
          <ActionButton type="submit" disabled={props.savingEmail}>
            {props.savingEmail ? "Saving..." : "Save email"}
          </ActionButton>
        </form>
      </section>

      <section className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Update password</h2>
        <form className={commonStyles.form} onSubmit={props.onPasswordSubmit}>
          <div className={commonStyles.field}>
            <label htmlFor="current-password">Current password</label>
            <div className={commonStyles.passwordField}>
              <input
                id="current-password"
                type={props.showCurrentPassword ? "text" : "password"}
                value={props.currentPassword}
                onChange={(event) => props.onCurrentPasswordChange(event.target.value)}
                required
              />
              <button
                type="button"
                className={commonStyles.passwordToggle}
                onClick={props.onToggleCurrentPassword}
                aria-label={props.showCurrentPassword ? "Hide current password" : "Show current password"}
              >
                <Image
                  src={props.showCurrentPassword ? "/icons/hide.svg" : "/icons/view.svg"}
                  alt=""
                  aria-hidden="true"
                  width={18}
                  height={18}
                />
              </button>
            </div>
          </div>
          <div className={commonStyles.field}>
            <label htmlFor="new-password">New password</label>
            <div className={commonStyles.passwordField}>
              <input
                id="new-password"
                type={props.showNewPassword ? "text" : "password"}
                value={props.newPassword}
                onChange={(event) => props.onNewPasswordChange(event.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                className={commonStyles.passwordToggle}
                onClick={props.onToggleNewPassword}
                aria-label={props.showNewPassword ? "Hide new password" : "Show new password"}
              >
                <Image
                  src={props.showNewPassword ? "/icons/hide.svg" : "/icons/view.svg"}
                  alt=""
                  aria-hidden="true"
                  width={18}
                  height={18}
                />
              </button>
            </div>
          </div>
          <ActionButton type="submit" disabled={props.savingPassword}>
            {props.savingPassword ? "Saving..." : "Save password"}
          </ActionButton>
        </form>
      </section>

      <AnalyticsPreferenceCard />
    </div>
  );
}
