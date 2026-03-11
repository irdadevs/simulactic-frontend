"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { sileo } from "sileo";
import { useAuth } from "../../application/hooks/useAuth";
import { useVerificationCodeFlow } from "../../application/hooks/useVerificationCodeFlow";
import { describeApiError, getApiErrorCode } from "../../lib/errors/apiErrorMessage";
import { ActionButton } from "../../ui/components/buttons/ActionButton";
import { AuthCard } from "../../ui/components/layout/auth/AuthCard";
import { ResetPasswordModal } from "../../ui/components/modals/ResetPasswordModal";
import { VerificationCodeModal } from "../../ui/components/modals/VerificationCodeModal";
import styles from "../../styles/skeleton.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loadMe, login, resetPassword } = useAuth();
  const verificationFlow = useVerificationCodeFlow({
    onVerified: async () => {
      try {
        await loadMe();
      } catch {
        await login({ email, rawPassword });
      }
      router.push("/dashboard");
    },
  });

  const [email, setEmail] = useState("");
  const [rawPassword, setRawPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const hasCheckedAuthRef = useRef(false);

  useEffect(() => {
    if (hasCheckedAuthRef.current) return;
    hasCheckedAuthRef.current = true;

    const guard = async () => {
      if (isAuthenticated) {
        router.replace("/");
        return;
      }

      try {
        await loadMe();
        router.replace("/");
      } catch {}
    };

    void guard();
  }, [isAuthenticated, loadMe, router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const signedInUser = await login({ email, rawPassword });
      if (!signedInUser.verified) {
        sileo.success({
          title: "Verification required",
          description: "Enter the code sent to your email to finish signing in.",
        });
        verificationFlow.open(signedInUser.email);
        return;
      }
      sileo.success({
        title: "Welcome back",
        description: "Login successful. Redirecting to your dashboard.",
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      if (getApiErrorCode(err) === "USERS.EMAIL_NOT_VERIFIED") {
        sileo.success({
          title: "Verification required",
          description: "Enter the code sent to your email to finish signing in.",
        });
        verificationFlow.open(email);
        return;
      }
      sileo.error({
        title: "Login failed",
        description: describeApiError(
          err,
          "We could not sign you in. Please check your credentials and try again.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openResetModal = () => {
    setResetEmail(email.trim());
    setResetModalOpen(true);
  };

  const closeResetModal = () => {
    if (isResettingPassword) return;
    setResetModalOpen(false);
  };

  const onResetPassword = async () => {
    setIsResettingPassword(true);
    try {
      await resetPassword({ email: resetEmail.trim() });
      sileo.success({
        title: "New password sent",
        description: "Check your email for the newly generated password.",
      });
      setResetModalOpen(false);
    } catch (err: unknown) {
      sileo.error({
        title: "Password reset failed",
        description: describeApiError(
          err,
          "We could not send a new password right now. Please verify the email and try again.",
        ),
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <AuthCard
      title="Login"
      subtitle="Enter your credentials to continue."
      footer={
        <p className={styles.subtitle}>
          No account?{" "}
          <Link href="/signup" className={styles.signupLoginLink}>
            Create one
          </Link>
        </p>
      }
    >
      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.field}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="login-password">Password</label>
          <div className={styles.passwordField}>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={rawPassword}
              onChange={(event) => setRawPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Image
                src={showPassword ? "/icons/hide.svg" : "/icons/view.svg"}
                alt=""
                aria-hidden="true"
                width={18}
                height={18}
              />
            </button>
          </div>
          <div className={styles.fieldAside}>
            <button type="button" className={styles.inlineLinkButton} onClick={openResetModal}>
              Forgot your password?
            </button>
          </div>
        </div>

        <ActionButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </ActionButton>
      </form>
      <ResetPasswordModal
        open={resetModalOpen}
        email={resetEmail}
        isSubmitting={isResettingPassword}
        onClose={closeResetModal}
        onEmailChange={setResetEmail}
        onSubmit={onResetPassword}
      />
      <VerificationCodeModal
        open={verificationFlow.isOpen}
        email={verificationFlow.email}
        code={verificationFlow.code}
        isVerifying={verificationFlow.isVerifying}
        isResending={verificationFlow.isResending}
        onClose={verificationFlow.close}
        onCodeChange={verificationFlow.setCode}
        onSubmit={verificationFlow.submit}
        onResend={verificationFlow.resend}
      />
    </AuthCard>
  );
}
