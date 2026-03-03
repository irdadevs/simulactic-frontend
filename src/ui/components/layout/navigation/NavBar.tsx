"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../application/hooks/useAuth";
import styles from "../../../../styles/skeleton.module.css";
import { ActionButton } from "../../buttons/ActionButton";

export function NavBar() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarContent}>
        <Link href="/dashboard" className={styles.brand}>
          Simulactic
        </Link>
        <nav className={styles.nav}>
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign up</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/admin">Admin</Link>
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
