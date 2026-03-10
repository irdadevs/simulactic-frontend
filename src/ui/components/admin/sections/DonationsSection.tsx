import { DonationProps } from "../../../../types/donation.types";
import commonStyles from "../../../../styles/skeleton.module.css";
import styles from "../../../../styles/admin.module.css";
import { AdminPagination } from "../AdminPagination";
import { AdminSectionStateNotice } from "../AdminSectionStateNotice";

type DonationsSectionProps = {
  donationsFilteredCount: number;
  totalDonations: number;
  totalAmount: string;
  activeMonthlySupporters: number;
  loading: boolean;
  error: string | null;
  donationsVisible: DonationProps[];
  summary: string;
  donationsPageSafe: number;
  donationsTotalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  donationStatusClassName: (status: string) => string;
  euro: (amount: number) => string;
  dateText: (date: Date) => string;
};

export function DonationsSection(props: DonationsSectionProps) {
  return (
    <section className={styles.sectionGrid}>
      <article className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Donations ({props.donationsFilteredCount} / {props.totalDonations})</h2>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}><span>Total amount</span><strong>{props.totalAmount}</strong></div>
          <div className={styles.summaryCard}><span>Active monthly supporters</span><strong>{props.activeMonthlySupporters}</strong></div>
        </div>
        <AdminSectionStateNotice loading={props.loading} error={props.error} empty={props.donationsFilteredCount === 0} emptyMessage="No donations in the selected range." />
        <AdminPagination currentPage={props.donationsPageSafe} totalPages={props.donationsTotalPages} onPrev={props.onPrevPage} onNext={props.onNextPage} summary={props.summary} />
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>User</th><th>Type</th><th>Status</th><th>Amount</th><th>Created</th></tr></thead>
            <tbody>
              {props.donationsVisible.map((donation) => (
                <tr key={donation.id}>
                  <td>{donation.userId}</td>
                  <td>{donation.donationType}</td>
                  <td><span className={`${styles.cellBadge} ${props.donationStatusClassName(donation.status)}`}>{donation.status}</span></td>
                  <td>{props.euro(donation.amountMinor)}</td>
                  <td>{props.dateText(donation.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminPagination currentPage={props.donationsPageSafe} totalPages={props.donationsTotalPages} onPrev={props.onPrevPage} onNext={props.onNextPage} centered />
      </article>
    </section>
  );
}
