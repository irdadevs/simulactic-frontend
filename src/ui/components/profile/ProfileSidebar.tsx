import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/me.module.css";
import { MeSectionId } from "../../../application/hooks/useMePageData";

type ProfileSidebarProps = {
  activeSection: MeSectionId;
  onSectionChange: (section: MeSectionId) => void;
};

export function ProfileSidebar({ activeSection, onSectionChange }: ProfileSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <h1 className={commonStyles.title}>My Profile</h1>
      <p className={commonStyles.subtitle}>
        Manage account data, creations and supporter status.
      </p>

      <div className={styles.sidebarActions}>
        <button
          type="button"
          className={activeSection === "personal" ? styles.sidebarButtonActive : styles.sidebarButton}
          onClick={() => onSectionChange("personal")}
        >
          Personal info
        </button>
        <button
          type="button"
          className={activeSection === "creations" ? styles.sidebarButtonActive : styles.sidebarButton}
          onClick={() => onSectionChange("creations")}
        >
          My creations
        </button>
        <button
          type="button"
          className={activeSection === "donations" ? styles.sidebarButtonActive : styles.sidebarButton}
          onClick={() => onSectionChange("donations")}
        >
          Donations and badges
        </button>
      </div>
    </aside>
  );
}
