import Link from "next/link";
import { ActionButton } from "../ui/components/buttons/ActionButton";
import styles from "../styles/landing.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.zoneHero}>
        <div className={styles.zoneInner}>
          <article className={styles.card}>
            <h1 className={styles.title}>Simulactic</h1>
            <p className={styles.text}>
              Placeholder: short introduction about your platform mission, galaxy simulation concept, and
              core value for players and creators.
            </p>
          </article>

          <article className={styles.cardCta}>
            <h2 className={styles.cardTitle}>Get Started</h2>
            <p className={styles.text}>Access your account or create a new one to start exploring.</p>
            <div className={styles.ctaRow}>
              <Link href="/login">
                <ActionButton>Login</ActionButton>
              </Link>
              <Link href="/signup">
                <ActionButton variant="secondary">Sign up</ActionButton>
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.zoneSupport}>
        <div className={styles.zoneInnerSingle}>
          <article className={styles.cardWide}>
            <h2 className={styles.cardTitle}>Why Support Simulactic</h2>
            <p className={styles.text}>
              Placeholder: explain project roadmap, infrastructure costs, development effort, and why
              community support accelerates the platform.
            </p>
            <p className={styles.text}>
              Placeholder: mention one-time donations, monthly support options, and how supporters unlock
              badges and help maintain long-term growth.
            </p>
            <div className={styles.supportLinkRow}>
              <Link href="/donations" className={styles.supportLink}>
                Open donations
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.zoneFaq}>
        <div className={styles.zoneInnerSingle}>
          <article className={styles.cardWide}>
            <h2 className={styles.cardTitle}>FAQs</h2>
            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>Placeholder question 1</summary>
                <p>Placeholder answer 1. Replace this with your real FAQ content.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>Placeholder question 2</summary>
                <p>Placeholder answer 2. Replace this with your real FAQ content.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>Placeholder question 3</summary>
                <p>Placeholder answer 3. Replace this with your real FAQ content.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>Placeholder question 4</summary>
                <p>Placeholder answer 4. Replace this with your real FAQ content.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>Placeholder question 5</summary>
                <p>Placeholder answer 5. Replace this with your real FAQ content.</p>
              </details>
            </div>
          </article>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>Copyright 2026 Simulactic. All rights reserved.</p>
          <nav className={styles.footerLinks}>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
