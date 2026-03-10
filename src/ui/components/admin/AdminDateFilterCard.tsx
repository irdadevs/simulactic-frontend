import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/admin.module.css";

type AdminDateFilterCardProps = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

export function AdminDateFilterCard({
  from,
  to,
  onFromChange,
  onToChange,
}: AdminDateFilterCardProps) {
  return (
    <section className={styles.card}>
      <h2 className={commonStyles.panelTitle}>Global date filter</h2>
      <div className={styles.filtersGrid}>
        <div className={styles.filterField}>
          <label>From</label>
          <input type="date" value={from} onChange={(event) => onFromChange(event.target.value)} />
        </div>
        <div className={styles.filterField}>
          <label>To</label>
          <input type="date" value={to} onChange={(event) => onToChange(event.target.value)} />
        </div>
      </div>
    </section>
  );
}
