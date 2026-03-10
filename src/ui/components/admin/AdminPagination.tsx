import styles from "../../../styles/admin.module.css";

type AdminPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  summary?: string;
  centered?: boolean;
};

export function AdminPagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  summary,
  centered = false,
}: AdminPaginationProps) {
  const wrapperClassName = centered ? styles.paginationBarCentered : styles.paginationBar;

  return (
    <div className={wrapperClassName}>
      {summary ? <span className={styles.paginationSummary}>{summary}</span> : null}
      <div className={styles.paginationControls}>
        <button className={styles.exportButton} disabled={currentPage <= 1} onClick={onPrev}>
          Prev
        </button>
        <span className={styles.paginationSummary}>Page {currentPage} / {totalPages}</span>
        <button className={styles.exportButton} disabled={currentPage >= totalPages} onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
}
