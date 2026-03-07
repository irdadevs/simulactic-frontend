"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../application/hooks/useAuth";
import styles from "../../../../styles/layout.module.css";
import { ActionButton } from "../../buttons/ActionButton";

export function NavBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, loadMe, logout } = useAuth();
  const isAdmin = user?.role === "Admin";
  const isPublicAuthPage = pathname === "/login" || pathname === "/signup";
  const isEmbeddedDashboard = pathname === "/dashboard" && searchParams.get("embed") === "1";
  const [authResolved, setAuthResolved] = useState(false);
  const hasResolvedRef = useRef(false);

  useEffect(() => {
    if (hasResolvedRef.current) return;
    hasResolvedRef.current = true;

    const resolveAuth = async () => {
      if (isAuthenticated) {
        setAuthResolved(true);
        return;
      }

      try {
        await loadMe();
      } catch {}
      setAuthResolved(true);
    };

    void resolveAuth();
  }, [isAuthenticated, loadMe]);

  const shouldShowNav = authResolved && !isPublicAuthPage && !isEmbeddedDashboard && isAuthenticated;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-topbar-offset",
      shouldShowNav ? "72px" : "0px",
    );
    return () => {
      document.documentElement.style.setProperty("--app-topbar-offset", "0px");
    };
  }, [shouldShowNav]);

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  if (!shouldShowNav) {
    return null;
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarContent}>
        <Link href="/" className={styles.brand}>
          Simulactic
        </Link>
        <nav className={styles.nav}>
          {isAuthenticated && <Link href="/me">Me</Link>}
          <Link href="/dashboard">Dashboard</Link>
          {isAdmin && <Link href="/admin">Admin</Link>}
          <Link href="/donations" className={styles.donateLink}>
            Donate
          </Link>
        </nav>
        <div className={styles.navActions}>
          {isAuthenticated && (
            <ActionButton
              variant="secondary"
              className={styles.logoutLikeDonate}
              onClick={() => void onLogout()}
            >
              Logout
            </ActionButton>
          )}
        </div>
      </div>
    </header>
  );
}
