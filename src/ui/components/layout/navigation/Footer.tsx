import Link from "next/link";
import styles from "../../../../styles/layout.module.css";

export function Footer() {
  return (
    <footer className={styles.globalFooter}>
      <div className={styles.globalFooterInner}>
        <p>Copyright 2026 Simulactic. All rights reserved.</p>
        <nav className={styles.globalFooterLinks}>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <a href="mailto:contact@simulactic.com">Contact</a>
        </nav>
      </div>
    </footer>
  );
}

