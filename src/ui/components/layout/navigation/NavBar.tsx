"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../application/hooks/useAuth";
import styles from "../../../../styles/layout.module.css";
import { ActionButton } from "../../buttons/ActionButton";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loadMe, logout } = useAuth();
  const isAdmin = user?.role === "Admin";
  const isPublicAuthPage = pathname === "/login" || pathname === "/signup";
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

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  if (!authResolved) {
    return null;
  }

  if (isPublicAuthPage) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarContent}>
        <Link href="/dashboard" className={styles.brand}>
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
            <ActionButton variant="secondary" onClick={() => void onLogout()}>
              Logout
            </ActionButton>
          )}
        </div>
      </div>
    </header>
  );
}
