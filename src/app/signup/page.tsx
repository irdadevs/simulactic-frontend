"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { sileo } from "sileo";
import { useAuth } from "../../application/hooks/useAuth";
import { useVerificationCodeFlow } from "../../application/hooks/useVerificationCodeFlow";
import { describeApiError } from "../../lib/errors/apiErrorMessage";
import { ActionButton } from "../../ui/components/buttons/ActionButton";
import { AuthCard } from "../../ui/components/layout/auth/AuthCard";
import { VerificationCodeModal } from "../../ui/components/modals/VerificationCodeModal";
import styles from "../../styles/skeleton.module.css";

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, loadMe, signup } = useAuth();
  const verificationFlow = useVerificationCodeFlow({
    onVerified: () => router.push("/dashboard"),
  });

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [rawPassword, setRawPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const createdUser = await signup({ username, email, rawPassword });
      if (!createdUser.verified) {
        sileo.success({
          title: "Account created",
          description: "Enter the verification code sent to your email to finish setup.",
        });
        verificationFlow.open(createdUser.email);
        return;
      }
      sileo.success({
        title: "Account created",
        description: "Your account is ready. Redirecting to dashboard.",
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      sileo.error({
        title: "Signup failed",
        description: describeApiError(
          err,
          "We could not create your account. Review your data and try again.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Sign up"
      subtitle="Create your Simulactic account."
      footer={
        <p className={styles.subtitle}>
          Already have an account?{" "}
          <Link href="/login" className={styles.signupLoginLink}>
            Login
          </Link>
        </p>
      }
    >
      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.field}>
          <label htmlFor="signup-username">Username</label>
          <input
            id="signup-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={25}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="signup-password">Password</label>
          <div className={styles.passwordField}>
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={rawPassword}
              onChange={(event) => setRawPassword(event.target.value)}
              minLength={6}
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
        </div>

        <ActionButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign up"}
        </ActionButton>
      </form>
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
