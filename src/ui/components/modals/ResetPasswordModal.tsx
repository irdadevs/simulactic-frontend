"use client";

import { FormEvent } from "react";
import layoutStyles from "../../../styles/layout.module.css";
import commonStyles from "../../../styles/skeleton.module.css";
import { ActionButton } from "../buttons/ActionButton";

type ResetPasswordModalProps = {
  open: boolean;
  email: string;
  isSubmitting: boolean;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onSubmit: () => Promise<void>;
};

export function ResetPasswordModal({
  open,
  email,
  isSubmitting,
  onClose,
  onEmailChange,
  onSubmit,
}: ResetPasswordModalProps) {
  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit();
  };

  return (
    <div
      className={layoutStyles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-password-modal-title"
    >
      <article className={layoutStyles.modalCard}>
        <h2 id="reset-password-modal-title" className={commonStyles.panelTitle}>
          Forgot your password?
        </h2>
        <p className={commonStyles.subtitle}>
          Enter your account email and we will send a newly generated password there.
        </p>

        <form className={commonStyles.form} onSubmit={handleSubmit}>
          <div className={commonStyles.field}>
            <label htmlFor="reset-password-email">Email</label>
            <input
              id="reset-password-email"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={commonStyles.modalActions}>
            <ActionButton type="submit" disabled={isSubmitting || email.trim().length === 0}>
              {isSubmitting ? "Sending..." : "Send new password"}
            </ActionButton>
            <ActionButton variant="secondary" type="button" onClick={onClose}>
              Cancel
            </ActionButton>
          </div>
        </form>
      </article>
    </div>
  );
}
