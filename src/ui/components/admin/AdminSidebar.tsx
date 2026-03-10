import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/admin.module.css";
import { AdminSection, adminSections } from "../../../app/admin/admin.shared";

type AdminSidebarProps = {
  section: AdminSection;
  loading: boolean;
  onSectionChange: (section: AdminSection) => void;
};

export function AdminSidebar({ section, loading, onSectionChange }: AdminSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <h1 className={commonStyles.title}>Admin Dashboard</h1>
      <p className={commonStyles.subtitle}>{loading ? "Refreshing..." : "Live operational data"}</p>
      <div className={styles.sidebarActions}>
        {adminSections.map((item) => (
          <button
            key={item}
            type="button"
            className={section === item ? styles.sidebarButtonActive : styles.sidebarButton}
            onClick={() => onSectionChange(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
    </aside>
  );
}
