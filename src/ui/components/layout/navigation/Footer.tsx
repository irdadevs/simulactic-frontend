"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "../../../../styles/layout.module.css";

export function Footer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEmbeddedDashboard = pathname === "/dashboard" && searchParams.get("embed") === "1";
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isEmbeddedDashboard) {
      document.documentElement.style.setProperty("--app-footer-offset", "0px");
      return;
    }

    const applyOffset = () => {
      const height = footerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--app-footer-offset", `${height}px`);
    };

    applyOffset();
    window.addEventListener("resize", applyOffset);
    return () => {
      window.removeEventListener("resize", applyOffset);
      document.documentElement.style.setProperty("--app-footer-offset", "0px");
    };
  }, [isEmbeddedDashboard]);

  if (isEmbeddedDashboard) {
    return null;
  }

  return (
    <footer ref={footerRef} className={styles.globalFooter}>
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
