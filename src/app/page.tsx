import Link from "next/link";
import { ActionButton } from "../ui/components/buttons/ActionButton";
import styles from "../styles/landing.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.zoneHero}>
        <div className={styles.zoneInner}>
          <article className={styles.card}>
            <h1 className={styles.title}>Simulactic</h1>
            <p className={styles.text}>Creating your own galaxy is at three fields of distance.</p>
            <p className={styles.text}>
              Signup in our app, select a name for your new galaxy, choose its shape and the number
              of solar systems that it will include and that is it.
            </p>
            <p className={styles.text}>
              Our 3D render will show your new creation and you will can interact direct on the
              screen. Take a look about the info of your creation and look how your universe comes
              into life.
            </p>
          </article>

          <article className={styles.cardCta}>
            <h2 className={styles.cardTitle}>Get Started</h2>
            <p className={styles.getStartedText}>
              Access your account or create a new one to start exploring.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/login">
                <ActionButton>Login</ActionButton>
              </Link>
              <Link href="/signup">
                <ActionButton variant="secondary">Sign up</ActionButton>
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.zoneHowItWorks}>
        <div className={styles.zoneInnerSingle}>
          <article className={styles.cardWide}>
            <h2 className={styles.cardTitle}>How it works</h2>
            <div className={styles.howGrid}>
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
                  moons and asteroids. Play with your creations
                </p>
              </article>
              <article className={styles.howStep}>
                <h3 className={styles.cardSubtitle}>Track growth</h3>
                <p className={styles.text}>
                  Use your profile to monitor your activity and platform evolution over time. Become
                  a supporter and unlock a badge progress.
                </p>
              </article>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.zoneSupport}>
        <div className={styles.zoneInnerSingle}>
          <article className={styles.cardWide}>
            <h2 className={styles.cardTitle}>Why Support Simulactic</h2>
            <p className={styles.text}>
              This project was born as a side portfolio project but the love for the astronomy and
              galaxy dynamics and the passion for 4X strategy games made that this project became
              the main project. As a solo developer with no graphic design experience, this will
              need some help of the community in order to grow fast enough. As nowadays it is just a
              galaxy simulator with a pretty 3D render the donations are totally voluntary and
              without any minnimum quantity. If you decide to become supporter you will get some
              benefits as unlimited galaxy creation, being part of the private community newsletter
              that include an email of advance tracking of the project each 15 days (no spam at all)
              and more playable benefits when it keeps becoming a real playable game.
            </p>
            <p className={styles.text}>
              There are two types of donations: one-time and monthly supporting, both unlocks the
              badges progress career and marks you as a supporter, no matter the time or the
              quantity.
            </p>
            <div className={styles.supportLinkRow}>
              <Link href="/donations" className={styles.supportLink}>
                Open donations
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.zoneFaq}>
        <div className={styles.zoneInnerSingle}>
          <article className={styles.cardWide}>
            <h2 className={styles.cardTitle}>FAQs</h2>
            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>What is this and where are you going?</summary>
                <p>
                  Nowadays Simulactic App is a galaxy creation and simulation app. Users can create
                  his own galaxies just with 3 information fields and our procedural algorithms
                  create unique galaxies to interact with.
                </p>
                <p>
                  Where we are going? Well... the growth planning is to turn it a 4X strategy game
                  with stelar base. Create your own civilization, handle your resources, expand your
                  empire and conquer another players.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>What do you do with my information?</summary>
                <p>Anything</p>
                <p>
                  We just collect basic information about you in order to ensure application
                  security. We will not use or sell your information and never ever will contact you
                  except you are voluntary included in our supporter community newsletter.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>What happens if I become supporter? What benefits I will have?</summary>
                <p>
                  If you become supporter you will have some use benefits: first of all you will
                  have unlimited creation power, also you will unlock a badge supporting career that
                  tracks quantity and your time being supporter. It will include you into our
                  private community newsletter, which we send every 15 days and where we explain our
                  growth plan, sprint by sprint and where we are pointing our project.
                </p>
                <p>
                  When it become a real playable game, supporters will have some benefits, never pay
                  to win but aestethic and unique unlockables.
                </p>
                <p>
                  Once you have supported our app you always will be kept as a supporter, no matter
                  the quantity or the time that you were supporting. This is our way to thank
                  everyone that helps the app growing.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>What limits the app have?</summary>
                <p>
                  For now the only limit is that non-supporter users just can create up to 3
                  galaxies. If you want to create more and you are not a supporter of the app you
                  will have to delete at least one in order to make space for the new one.
                  Supporters and admins have unlimited power creation.
                </p>
                <p>
                  Non-admin users can not enter to the admin dashboard panel, where can track how
                  the app is growing, data about the use and logs and metric about the app.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>When it will become a real game?</summary>
                <p>
                  There is no real date. The growth plan include 15 day sprints to enhance
                  functionalities, improve and fix bugs and make the app to grow, but there are not
                  a date when this switch to a playable game.
                </p>
                <p>
                  I am a solo developer and it will depend mainly on the support that I get, not
                  only monetary, but with feedback and ideas of the community on how improve the app
                  while transforming it into a game.
                </p>
              </details>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
