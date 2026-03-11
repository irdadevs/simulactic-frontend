import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ActionButton } from "../ui/components/buttons/ActionButton";
import { LandingSnapController } from "../ui/components/landing/LandingSnapController";
import { LandingSceneDemoCard } from "../ui/components/landing/LandingSceneDemoCard";
import styles from "../styles/landing.module.css";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Design galaxies in seconds, explore them in 3D, and follow Simulactic as it grows from a polished space simulator into a full strategy experience.",
};

export default function Home() {
  return (
    <section id="landing-root" className={styles.page}>
      <LandingSnapController containerId="landing-root" sectionSelector="[data-landing-section]" />
      <header className={styles.zoneHero} data-landing-section>
        <div className={styles.zoneInner}>
          <article className={styles.card}>
            <Image
              src="/logo.png"
              alt="Simulactic"
              width={220}
              height={54}
              priority
              className={styles.heroLogo}
            />
            <p className={styles.text}>
              Build a galaxy of your own in minutes, then fly straight into it.
            </p>
            <p className={styles.text}>
              Simulactic turns a simple creation flow into a living 3D experience. Pick a name,
              choose a galaxy shape, decide how many systems you want, and let the backend generate
              the structure for you.
            </p>
            <p className={styles.text}>
              From there, you can move from galaxy-scale exploration into system detail, inspect
              stars, planets, moons, and asteroid fields, and interact with your own generated
              universe as if you were navigating a real map of space.
            </p>
            <p className={styles.text}>
              It starts as a creation tool, but it is being built with a larger destination in
              mind: a deeper long-term simulation and strategy platform shaped around galaxies you
              actually care about.
            </p>
          </article>

          <article className={styles.cardCta}>
            <h2 className={styles.cardTitle}>Enter Your First Galaxy</h2>
            <p className={styles.getStartedText}>
              Create an account, generate your first universe, and start exploring immediately.
            </p>
            <p className={styles.getStartedText}>
              If you already have an account, log in and continue building from your dashboard.
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
          <div className={styles.howStack}>
            <article className={`${styles.cardWide} ${styles.howCard}`}>
              <h2 className={styles.cardTitle}>How it works</h2>
              <section className={styles.howGrid} aria-label="How Simulactic works">
                <article className={styles.howStep}>
                  <h3 className={styles.cardSubtitle}>Create your galaxy</h3>
                  <p className={styles.text}>
                    Start with three decisions only: name, shape, and system count. Simulactic
                    handles the heavy lifting and generates the structure behind the scenes.
                  </p>
                </article>
                <article className={styles.howStep}>
                  <h3 className={styles.cardSubtitle}>Explore in 3D</h3>
                  <p className={styles.text}>
                    Move from the galaxy map into system detail, inspect celestial bodies, and
                    navigate your creation with a real-time renderer designed to make exploration
                    feel immediate and tactile.
                  </p>
                </article>
                <article className={styles.howStep}>
                  <h3 className={styles.cardSubtitle}>Grow with the project</h3>
                  <p className={styles.text}>
                    Follow your profile activity, track your supporter progression, and stay close
                    to the roadmap as Simulactic evolves toward a larger simulation and strategy
                    experience.
                  </p>
                </article>
              </section>
            </article>
            <LandingSceneDemoCard />
          </div>
        </div>
      </section>

      <section className={styles.zoneSupport} data-landing-section>
        <div className={styles.zoneInnerSingle}>
          <article className={styles.cardWide}>
            <h2 className={styles.cardTitle}>Why Support Simulactic</h2>
            <p className={styles.text}>
              Simulactic began as a portfolio project, but it has grown into a serious long-term
              build shaped by astronomy, galaxy simulation, and strategy-game ambition. It is being
              developed solo, so community support has a direct effect on how fast quality improves
              and how much of the roadmap can be pushed forward each cycle.
            </p>
            <p className={styles.text}>
              Donations are optional, but meaningful. They help fund development time, infrastructure,
              tooling, and the steady polishing needed to move from a promising simulator into a
              platform that feels stable, ambitious, and worth coming back to.
            </p>
            <p className={styles.text}>
              If you become a supporter, you unlock unlimited galaxy creation, real supporter badge
              progression, and closer visibility into where the project is going next. One-time and
              monthly donations both count, and both push your supporter progression forward.
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
                  Simulactic is currently a galaxy creation and exploration app. You define the
                  starting inputs, the backend generates the structure, and the frontend turns that
                  into a navigable 3D experience.
                </p>
                <p>
                  The long-term goal is bigger: a richer space simulation and 4X strategy direction
                  where creation, discovery, progression, and eventually larger game systems can
                  live together without rebuilding the core product from scratch.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>What do you do with my information?</summary>
                <p>
                  Simulactic keeps data collection narrow and practical. The app stores what it needs
                  to run accounts securely, operate the platform, and support the features you use.
                </p>
                <p>
                  Your data is not sold, and supporter communications only happen when you explicitly
                  choose to be part of them.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>What happens if I become a supporter?</summary>
                <p>
                  Supporters get unlimited galaxy creation and unlock a real badge wall that tracks
                  both total contribution and long-term monthly support.
                </p>
                <p>
                  Support also gives you a closer relationship to the roadmap, clearer progress
                  visibility, and recognition inside the platform as the project grows.
                </p>
                <p>
                  The intent is to reward support with progression and recognition, never with
                  pay-to-win advantages.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>What limits does the app have right now?</summary>
                <p>
                  Right now, non-supporter users can create up to three galaxies. If you reach that
                  cap, you need to remove one before creating another. Supporters and admins are not
                  limited by that cap.
                </p>
                <p>
                  This is still an actively developing product, so parts of the long-term game vision
                  are not public yet. The admin dashboard also remains admin-only.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>When will this become a full game?</summary>
                <p>
                  There is no fixed launch date for a full game stage yet. Development moves in
                  short iterations focused on features, stability, and platform quality.
                </p>
                <p>
                  The speed of that transition depends heavily on support, feedback, and how much
                  sustained development time can be invested into the roadmap.
                </p>
              </details>
            </section>
          </article>
        </div>
      </section>
    </section>
  );
}
