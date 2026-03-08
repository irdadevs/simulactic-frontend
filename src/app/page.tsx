import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton } from "../ui/components/buttons/ActionButton";
import { LandingSnapController } from "../ui/components/landing/LandingSnapController";
import styles from "../styles/landing.module.css";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Create galaxies, explore star systems in 3D, and support the growth of Simulactic into a complete strategy simulation experience.",
};

export default function Home() {
  return (
    <section id="landing-root" className={styles.page}>
      <LandingSnapController containerId="landing-root" sectionSelector="[data-landing-section]" />
      <header className={styles.zoneHero} data-landing-section>
        <div className={styles.zoneInner}>
          <article className={styles.card}>
            <h1 className={styles.title}>Simulactic</h1>
            <p className={styles.text}>Creating your own galaxy is just three fields away.</p>
            <p className={styles.text}>
              Sign up, choose a name, select the galaxy shape, and define how many solar systems
              you want to generate. That is all you need to start.
            </p>
            <p className={styles.text}>
              Our 3D renderer brings your creation to life immediately. Explore systems, inspect
              stars, planets, moons and asteroids, and interact directly on screen with your own
              generated universe.
            </p>
          </article>

          <article className={styles.cardCta}>
            <h2 className={styles.cardTitle}>Get Started</h2>
            <p className={styles.getStartedText}>
              Access your account or create a new one to start exploring.
            </p>
            <nav className={styles.ctaRow} aria-label="Authentication shortcuts">
              <Link href="/login">
                <ActionButton>Login</ActionButton>
              </Link>
              <Link href="/signup">
                <ActionButton variant="secondary">Sign up</ActionButton>
              </Link>
            </nav>
          </article>
        </div>
      </header>

      <section className={styles.zoneHowItWorks} data-landing-section>
        <div className={styles.zoneInnerSingle}>
          <article className={`${styles.cardWide} ${styles.howCard}`}>
            <h2 className={styles.cardTitle}>How it works</h2>
            <section className={styles.howGrid} aria-label="How Simulactic works">
              <article className={styles.howStep}>
                <h3 className={styles.cardSubtitle}>Create your galaxy</h3>
                <p className={styles.text}>
                  Choose a name, shape, and system count. The backend will generate the full
                  structure.
                </p>
              </article>
              <article className={styles.howStep}>
                <h3 className={styles.cardSubtitle}>Explore in 3D</h3>
                <p className={styles.text}>
                  Start in galaxy view, inspect systems, and zoom into system detail for planets,
                  moons and asteroids. Play with your creations in real time.
                </p>
              </article>
              <article className={styles.howStep}>
                <h3 className={styles.cardSubtitle}>Track growth</h3>
                <p className={styles.text}>
                  Use your profile to monitor your activity and platform evolution over time. Become
                  a supporter and unlock a badge progress.
                </p>
              </article>
            </section>
          </article>
        </div>
      </section>

      <section className={styles.zoneSupport} data-landing-section>
        <div className={styles.zoneInnerSingle}>
          <article className={styles.cardWide}>
            <h2 className={styles.cardTitle}>Why Support Simulactic</h2>
            <p className={styles.text}>
              Simulactic started as a portfolio side project, but love for astronomy, galaxy
              dynamics, and 4X strategy design turned it into my main long-term project. I am
              building it solo, so community support helps a lot to keep quality and progress moving
              sprint by sprint.
            </p>
            <p className={styles.text}>
              Donations are fully voluntary and there is no minimum amount. If you become a
              supporter, you unlock unlimited galaxy creation, supporter badge progression, and
              access to a private progress newsletter sent every 15 days with clear updates and no
              spam.
            </p>
            <p className={styles.text}>
              You can support with one-time or monthly donations. Both options unlock supporter
              status and progress tracking, independently of amount or duration.
            </p>
            <nav className={styles.supportLinkRow} aria-label="Support actions">
              <Link href="/donations" className={styles.supportLink}>
                Open donations
              </Link>
            </nav>
          </article>
        </div>
      </section>

      <section className={styles.zoneFaq} data-landing-section>
        <div className={styles.zoneInnerSingle}>
          <article className={styles.cardWide}>
            <h2 className={styles.cardTitle}>FAQs</h2>
            <section className={styles.faqList} aria-label="Frequently asked questions">
              <details className={styles.faqItem}>
                <summary>What is this and where are you going?</summary>
                <p>
                  Simulactic is currently a galaxy creation and simulation app. Users can create
                  unique galaxies with just three fields, and our procedural engine builds the full
                  structure to explore in 3D.
                </p>
                <p>
                  The long-term direction is to evolve into a stellar 4X strategy game where you can
                  build civilizations, manage resources, expand your empire, and compete with other
                  players.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>What do you do with my information?</summary>
                <p>
                  We collect only the minimum required information to keep the platform secure and
                  functional. We do not sell your data and we only contact you when you explicitly
                  opt into supporter communications.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>What happens if I become supporter? What benefits I will have?</summary>
                <p>
                  Supporters get unlimited galaxy creation and unlock a supporter badge career that
                  tracks both total support and support time.
                </p>
                <p>
                  You are also included in the private 15-day newsletter with transparent progress
                  updates. As Simulactic grows into a full game, supporters will receive benefits,
                  but never pay-to-win advantages.
                </p>
                <p>
                  Once you support the project, you remain recognized as supporter. This is the way
                  to thank everyone who helps the app grow.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>What limits the app have?</summary>
                <p>
                  Right now, non-supporter users can create up to three galaxies. To create a new
                  one after that, you need to delete an existing one first. Supporters and admins
                  have unlimited creation.
                </p>
                <p>
                  Non-admin users cannot access the admin dashboard, where growth, usage, logs and
                  performance metrics are monitored.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>When it will become a real game?</summary>
                <p>
                  There is no fixed launch date yet. Development runs in 15-day sprints focused on
                  features, stability, and continuous improvements.
                </p>
                <p>
                  As a solo developer, progress depends heavily on community support, feedback, and
                  ideas while the project transitions from simulator to playable game.
                </p>
              </details>
            </section>
          </article>
        </div>
      </section>
    </section>
  );
}
