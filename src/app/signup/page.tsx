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

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, loadMe, signup } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [rawPassword, setRawPassword] = useState("");
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
      await signup({ username, email, rawPassword });
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
          Already have an account? <Link href="/login">Login</Link>
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
          <input
            id="signup-password"
            type="password"
            value={rawPassword}
            onChange={(event) => setRawPassword(event.target.value)}
            minLength={6}
            required
          />
        </div>

        <ActionButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign up"}
        </ActionButton>
      </form>
    </AuthCard>
  );
}
