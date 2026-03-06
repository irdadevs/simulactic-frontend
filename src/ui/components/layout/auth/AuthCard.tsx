import { ReactNode } from "react";
import layoutStyles from "../../../../styles/layout.module.css";
import commonStyles from "../../../../styles/skeleton.module.css";

type AuthCardProps = {
  title: string;
  subtitle: string;
  error?: string | null;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, subtitle, error, children, footer }: AuthCardProps) {
  return (
    <section className={layoutStyles.authPage}>
      <article className={layoutStyles.authCard}>
        <h1 className={commonStyles.title}>{title}</h1>
        <p className={commonStyles.subtitle}>{subtitle}</p>

        {error && <p className={commonStyles.error}>{error}</p>}

        {children}

        {footer ? <div style={{ marginTop: 12 }}>{footer}</div> : null}
      </article>
    </section>
  );
}
