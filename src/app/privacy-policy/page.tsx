import type { Metadata } from "next";
import legalStyles from "../../styles/legal.module.css";
import styles from "../../styles/skeleton.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Simulactic privacy policy covering data collection, usage, retention, and user rights.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className={legalStyles.page}>
      <h1 className={styles.title}>Privacy Policy</h1>
      <p className={styles.subtitle}>Effective date: March 8, 2026</p>

      <article className={legalStyles.card}>
        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>1. Scope</h2>
          <p className={legalStyles.text}>
            This Privacy Policy explains how Simulactic collects, uses, stores, and protects personal
            data when you use the website, account system, 3D simulation features, and donation flows.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>2. Data We Collect</h2>
          <ul className={legalStyles.list}>
            <li>Account data: email, username, role, verification status, supporter status.</li>
            <li>Activity data: galaxy creation records and related simulation entities.</li>
            <li>Security and audit data: request identifiers, log entries, and abuse-prevention signals.</li>
            <li>Donation data: donation status and billing metadata provided by payment providers.</li>
            <li>Technical data: device/browser information required for stability and fraud prevention.</li>
          </ul>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>3. How We Use Data</h2>
          <ul className={legalStyles.list}>
            <li>Provide account access, galaxy management, and 3D rendering features.</li>
            <li>Process and confirm donations and supporter progression.</li>
            <li>Operate platform security, monitoring, debugging, and incident response.</li>
            <li>Comply with legal obligations and enforce platform terms.</li>
          </ul>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>4. Legal Basis</h2>
          <p className={legalStyles.text}>Depending on your region, we process data based on:</p>
          <ul className={legalStyles.list}>
            <li>Contractual necessity (account and service delivery).</li>
            <li>Legitimate interests (security, abuse prevention, service improvement).</li>
            <li>Legal obligations (financial, fraud, and compliance duties).</li>
            <li>Consent where required (for optional communications).</li>
          </ul>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>5. Sharing and Processors</h2>
          <p className={legalStyles.text}>
            We do not sell personal data. We share data only with service providers needed to operate
            Simulactic, such as hosting, payment processing, email delivery, and security tooling.
            Those processors are contractually required to protect data.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>6. Cookies and Tokens</h2>
          <p className={legalStyles.text}>
            Simulactic may use secure session mechanisms and authentication cookies/tokens to keep you
            logged in and protect account access. Some features may not work correctly if these are blocked.
          </p>
          <p className={legalStyles.text}>
            Anonymous traffic analytics can be disabled from your profile settings. Browser Do Not Track
            preferences are respected automatically when supported.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>7. Retention</h2>
          <p className={legalStyles.text}>
            We keep personal data only for as long as needed to provide services, resolve disputes,
            meet legal obligations, and enforce platform security. Retention periods vary by data type.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>8. Your Rights</h2>
          <ul className={legalStyles.list}>
            <li>Access and update your profile information.</li>
            <li>Request account deletion, subject to legal and security retention requirements.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Object to or restrict certain processing where applicable.</li>
          </ul>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>9. Security</h2>
          <p className={legalStyles.text}>
            We apply technical and organizational safeguards to reduce unauthorized access, misuse, or
            loss of data. No system can guarantee absolute security.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>10. International Transfers</h2>
          <p className={legalStyles.text}>
            If data is processed outside your country, we apply appropriate safeguards as required by law.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>11. Changes to This Policy</h2>
          <p className={legalStyles.text}>
            We may update this policy when product, legal, or security needs change. Material updates will
            be reflected with a new effective date.
          </p>
        </section>

        <section className={legalStyles.section}>
          <h2 className={legalStyles.heading}>12. Contact</h2>
          <p className={legalStyles.text}>
            Privacy requests and questions: <strong>contact@simulactic.com</strong>.
          </p>
        </section>
      </article>
    </section>
  );
}

