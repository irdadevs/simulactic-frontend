import type { Metadata } from "next";
import legalStyles from "../../styles/legal.module.css";
import styles from "../../styles/skeleton.module.css";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Simulactic terms governing account usage, donations, acceptable use, and liabilities.",
};

export default function TermsPage() {
  return (
    <section className={legalStyles.page}>
      <h1 className={styles.title}>Terms of Service</h1>
      <p className={styles.subtitle}>Effective date: March 8, 2026</p>

      <article className={legalStyles.card}>
        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>1. Agreement</h2>
          <p className={legalStyles.text}>
            By accessing or using Simulactic, you agree to these Terms of Service. If you do not agree,
            do not use the platform.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>2. Eligibility and Accounts</h2>
          <ul className={legalStyles.list}>
            <li>You are responsible for account credentials and account activity.</li>
            <li>You must provide accurate information and keep it updated.</li>
            <li>We may suspend or terminate accounts for security or policy violations.</li>
          </ul>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>3. Service Description</h2>
          <p className={legalStyles.text}>
            Simulactic provides galaxy-creation and simulation features, account dashboards, supporter
            progression, and optional donation functionality. Features may evolve over time.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>4. Acceptable Use</h2>
          <p className={legalStyles.text}>You agree not to:</p>
          <ul className={legalStyles.list}>
            <li>Attempt unauthorized access, scraping, reverse abuse, or service disruption.</li>
            <li>Use bots/scripts to bypass limits, controls, or security checks.</li>
            <li>Exploit vulnerabilities or interfere with platform availability.</li>
            <li>Use the platform for unlawful, fraudulent, or harmful purposes.</li>
          </ul>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>5. Donations and Supporter Status</h2>
          <ul className={legalStyles.list}>
            <li>Donations are voluntary and can include one-time or monthly options.</li>
            <li>Payments are processed by third-party providers (for example, Stripe).</li>
            <li>Supporter benefits are service features, not financial products.</li>
            <li>If provider/payment errors occur, we may adjust status after reconciliation.</li>
          </ul>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>6. Availability and Changes</h2>
          <p className={legalStyles.text}>
            We may modify, pause, or discontinue features at any time, including for maintenance,
            security, legal compliance, or product evolution.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>7. Intellectual Property</h2>
          <p className={legalStyles.text}>
            Simulactic branding, software, and platform content are protected by applicable intellectual
            property laws. Use of the service does not transfer ownership rights.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>8. Suspension and Termination</h2>
          <p className={legalStyles.text}>
            We may suspend, restrict, or terminate access for policy violations, security threats,
            fraud indicators, legal requirements, or abuse of platform systems.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>9. Warranty Disclaimer</h2>
          <p className={legalStyles.text}>
            The service is provided on an “as is” and “as available” basis without warranties of any kind,
            to the maximum extent permitted by law.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>10. Limitation of Liability</h2>
          <p className={legalStyles.text}>
            To the extent permitted by law, Simulactic is not liable for indirect, incidental,
            special, consequential, or punitive damages arising from use of the platform.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>11. Indemnification</h2>
          <p className={legalStyles.text}>
            You agree to indemnify and hold Simulactic harmless from claims resulting from your misuse
            of the service or violation of these Terms.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>12. Governing Law</h2>
          <p className={legalStyles.text}>
            These Terms are governed by applicable local laws, without prejudice to mandatory consumer
            rights in your jurisdiction.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>13. Changes to Terms</h2>
          <p className={legalStyles.text}>
            We may revise these Terms as the service evolves. Continued use after updates means you
            accept the revised Terms.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>14. Contact</h2>
          <p className={legalStyles.text}>
            Terms-related questions: <strong>contact@simulactic.com</strong>.
          </p>
        </section>
      </article>
    </section>
  );
}

