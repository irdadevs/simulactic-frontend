import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/me.module.css";
import { DonationProps } from "../../../types/donation.types";

type DonationsHistorySectionProps = {
  donations: DonationProps[];
  isSupporter: boolean;
  openingPortal: boolean;
  portalPopupOpen: boolean;
  euro: Intl.NumberFormat;
  toDate: (value: Date) => string;
  donationBadgeClassByStatus: (status: string) => string;
  onOpenCustomerPortal: () => void;
};

export function DonationsHistorySection(props: DonationsHistorySectionProps) {
  return (
    <section className={styles.card}>
      <div className={styles.rowBetween}>
        <h2 className={commonStyles.panelTitle}>Donations history</h2>
        <button
          type="button"
          className={props.isSupporter ? styles.portalButtonEnabled : styles.portalButtonDisabled}
          onClick={props.onOpenCustomerPortal}
          disabled={!props.isSupporter || props.openingPortal || props.portalPopupOpen}
        >
          {props.openingPortal
            ? "Opening..."
            : props.portalPopupOpen
              ? "Portal open"
              : "Customer portal"}
        </button>
      </div>
      <div className={styles.listGrid}>
        {props.donations.map((donation) => (
          <article key={donation.id} className={`${styles.listCard} ${styles.donationCard}`}>
            <div className={styles.rowBetween}>
              <h3 className={styles.cardTitle}>
                {donation.donationType === "monthly" ? "Monthly" : "One-time"} donation
              </h3>
              <span
                className={`${styles.badge} ${styles.statusBadge} ${props.donationBadgeClassByStatus(donation.status)}`}
              >
                {donation.status}
              </span>
            </div>
            <p className={styles.metaText}>
              Amount: {props.euro.format(donation.amountMinor / 100)}
            </p>
            <p className={styles.metaText}>Created: {props.toDate(donation.createdAt)}</p>
            <p className={styles.metaText}>
              Current period:{" "}
              {donation.currentPeriodStart ? props.toDate(donation.currentPeriodStart) : "-"} to{" "}
              {donation.currentPeriodEnd ? props.toDate(donation.currentPeriodEnd) : "-"}
            </p>
          </article>
        ))}
        {props.donations.length === 0 ? <p className={styles.empty}>No donations yet.</p> : null}
      </div>
    </section>
  );
}
