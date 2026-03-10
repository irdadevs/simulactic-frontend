"use client";

import { FormEvent } from "react";
import layoutStyles from "../../../styles/layout.module.css";
import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/auth-verification.module.css";
import { ActionButton } from "../buttons/ActionButton";

type VerificationCodeModalProps = {
  open: boolean;
  email: string;
  code: string;
  isVerifying: boolean;
  isResending: boolean;
  onClose: () => void;
  onCodeChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  onResend: () => Promise<void>;
};

export function VerificationCodeModal({
  open,
  email,
  code,
  isVerifying,
  isResending,
  onClose,
  onCodeChange,
  onSubmit,
  onResend,
}: VerificationCodeModalProps) {
  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit();
  };

  return (
    <div className={layoutStyles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="verification-modal-title">
      <article className={layoutStyles.modalCard}>
        <h2 id="verification-modal-title" className={commonStyles.panelTitle}>Verify your email</h2>
        <p className={commonStyles.subtitle}>
          Enter the 8-character verification code sent to <strong>{email}</strong>.
        </p>

        <div className={styles.verificationBanner}>
          You need to verify your account before continuing.
        </div>

        <form className={commonStyles.form} onSubmit={handleSubmit}>
          <div className={commonStyles.field}>
            <label htmlFor="verification-code">Verification code</label>
            <input
              id="verification-code"
              className={styles.verificationCodeInput}
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={8}
              value={code}
              onChange={(event) => onCodeChange(event.target.value.toUpperCase())}
              placeholder="XXXXXXXX"
              required
            />
          </div>

          <div className={styles.verificationHintRow}>
            <span className={commonStyles.meta}>Check spam if you do not see the email.</span>
            <button
              type="button"
              className={styles.resendButton}
              disabled={isResending}
              onClick={() => void onResend()}
            >
              {isResending ? "Resending..." : "Resend code"}
            </button>
          </div>

          <div className={commonStyles.modalActions}>
            <ActionButton type="submit" disabled={isVerifying || code.trim().length !== 8}>
              {isVerifying ? "Verifying..." : "Verify account"}
            </ActionButton>
            <ActionButton variant="secondary" type="button" onClick={onClose}>
              Close
            </ActionButton>
          </div>
        </form>
      </article>
    </div>
  );
}
