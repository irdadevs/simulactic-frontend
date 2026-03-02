"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "../../application/hooks/useAuth";
import { ActionButton } from "../../ui/components/buttons/ActionButton";
import { AuthCard } from "../../ui/components/layout/AuthCard";
import styles from "../../styles/skeleton.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [rawPassword, setRawPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await login({ email, rawPassword });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Login"
      subtitle="Enter your credentials to continue."
      error={error}
      footer={
        <p className={styles.subtitle}>
          No account? <Link href="/register">Create one</Link>
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
            <input
              id="login-password"
              type="password"
              value={rawPassword}
              onChange={(event) => setRawPassword(event.target.value)}
              required
            />
          </div>

          <ActionButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </ActionButton>
        </form>
    </AuthCard>
  );
}
