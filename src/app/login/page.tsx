"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { sileo } from "sileo";
import { useAuth } from "../../application/hooks/useAuth";
import { describeApiError } from "../../lib/errors/apiErrorMessage";
import { ActionButton } from "../../ui/components/buttons/ActionButton";
import { AuthCard } from "../../ui/components/layout/auth/AuthCard";
import styles from "../../styles/skeleton.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loadMe, login } = useAuth();

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
      await login({ email, rawPassword });
      sileo.success({
        title: "Welcome back",
        description: "Login successful. Redirecting to your dashboard.",
      });
      router.push("/dashboard");
    } catch (err: unknown) {
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
              <img
                src={showPassword ? "/icons/hide.svg" : "/icons/view.svg"}
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <ActionButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </ActionButton>
      </form>
    </AuthCard>
  );
}
