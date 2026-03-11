"use client";

import Image from "next/image";
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
  const navRef = useRef<HTMLElement | null>(null);

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
    if (!shouldShowNav) {
      document.documentElement.style.setProperty("--app-topbar-offset", "0px");
      return;
    }

    const applyOffset = () => {
      const height = navRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--app-topbar-offset", `${height}px`);
    };

    applyOffset();
    window.addEventListener("resize", applyOffset);
    return () => {
      window.removeEventListener("resize", applyOffset);
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
    <header ref={navRef} className={styles.topbar}>
      <div className={styles.topbarContent}>
        <Link href="/" className={styles.brand}>
          <Image src="/logo.png" alt="Simulactic" width={148} height={36} priority className={styles.brandLogo} />
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
