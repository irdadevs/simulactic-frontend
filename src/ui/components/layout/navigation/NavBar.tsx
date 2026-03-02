import Link from "next/link";
import styles from "../../../../styles/skeleton.module.css";

export function NavBar() {
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
        </nav>
      </div>
    </header>
  );
}
