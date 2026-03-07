"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import styles from "../../../../styles/layout.module.css";

export function Footer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEmbeddedDashboard = pathname === "/dashboard" && searchParams.get("embed") === "1";

  useEffect(() => {
    document.documentElement.style.setProperty("--app-footer-offset", isEmbeddedDashboard ? "0px" : "114px");
    return () => {
      document.documentElement.style.setProperty("--app-footer-offset", "114px");
    };
  }, [isEmbeddedDashboard]);

  if (isEmbeddedDashboard) {
    return null;
  }

  return (
    <footer className={styles.globalFooter}>
      <div className={styles.globalFooterInner}>
        <p>Copyright 2026 Simulactic. All rights reserved.</p>
        <nav className={styles.globalFooterLinks}>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <a href="mailto:contact@simulactic.com" target="_blank" rel="noreferrer">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
