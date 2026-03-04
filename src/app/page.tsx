import Link from "next/link";
import { ActionButton } from "../ui/components/buttons/ActionButton";
import styles from "../styles/skeleton.module.css";

export default function Home() {
  return (
    <section className={styles.landing}>
      <p className={styles.meta}>Galactic simulation platform</p>
      <h1 className={styles.title}>Simulactic</h1>
      <p className={styles.subtitle}>
        Explore your galaxies, manage systems, and monitor platform health from a single place.
      </p>
      <div className={styles.landingCtas}>
        <Link href="/login">
          <ActionButton>Login</ActionButton>
        </Link>
        <Link href="/signup">
          <ActionButton variant="secondary">Sign up</ActionButton>
        </Link>
      </div>
    </section>
  );
}
