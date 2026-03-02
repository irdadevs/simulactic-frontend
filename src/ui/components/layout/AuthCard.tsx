import { ReactNode } from "react";
import styles from "../../../styles/skeleton.module.css";

type AuthCardProps = {
  title: string;
  subtitle: string;
  error?: string | null;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, subtitle, error, children, footer }: AuthCardProps) {
  return (
    <section className={styles.authPage}>
      <article className={styles.authCard}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        {error && <p className={styles.error}>{error}</p>}

        {children}

        {footer ? <div style={{ marginTop: 12 }}>{footer}</div> : null}
      </article>
    </section>
  );
}
