"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "../../application/hooks/useAuth";
import { ActionButton } from "../../ui/components/buttons/ActionButton";
import { AuthCard } from "../../ui/components/layout/AuthCard";
import styles from "../../styles/skeleton.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [rawPassword, setRawPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await signup({ email, username, rawPassword });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Register"
      subtitle="Create your account to start building galaxies."
      error={error}
      footer={
        <p className={styles.subtitle}>
          Already registered? <Link href="/login">Go to login</Link>
        </p>
      }
    >
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.field}>
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="register-username">Username</label>
            <input
              id="register-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              minLength={3}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              value={rawPassword}
              onChange={(event) => setRawPassword(event.target.value)}
              required
              minLength={6}
            />
          </div>

          <ActionButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Account"}
          </ActionButton>
        </form>
    </AuthCard>
  );
}
