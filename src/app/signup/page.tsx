"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "../../application/hooks/useAuth";
import { ActionButton } from "../../ui/components/buttons/ActionButton";
import { AuthCard } from "../../ui/components/layout/auth/AuthCard";
import styles from "../../styles/skeleton.module.css";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [rawPassword, setRawPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await signup({ username, email, rawPassword });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Sign up"
      subtitle="Create your Simulactic account."
      error={error}
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
