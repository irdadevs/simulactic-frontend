"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../../../application/hooks/useAuth";
import styles from "../../../../styles/skeleton.module.css";
import { ActionButton } from "../../buttons/ActionButton";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === "Admin";
  const hideOnAuthPages = pathname === "/login" || pathname === "/signup";

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  if (hideOnAuthPages) {
    return null;
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarContent}>
        <Link href="/dashboard" className={styles.brand}>
          Simulactic
        </Link>
        <nav className={styles.nav}>
          <Link href="/dashboard">Dashboard</Link>
          {isAdmin && <Link href="/admin">Admin</Link>}
          {isAuthenticated && (
            <ActionButton variant="secondary" onClick={() => void onLogout()}>
              Logout
            </ActionButton>
          )}
        </nav>
      </div>
    </header>
  );
}
