import Link from "next/link";
import { ActionButton } from "../ui/components/buttons/ActionButton";
import layoutStyles from "../styles/layout.module.css";
import commonStyles from "../styles/skeleton.module.css";

export default function Home() {
  return (
    <section className={layoutStyles.landing}>
      <p className={commonStyles.meta}>Galactic simulation platform</p>
      <h1 className={commonStyles.title}>Simulactic</h1>
      <p className={commonStyles.subtitle}>
        Explore your galaxies, manage systems, and monitor platform health from a single place.
      </p>
      <div className={layoutStyles.landingCtas}>
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
