import { useMemo, useState } from "react";
import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/me.module.css";
import {
  SupporterBadgeLevelResponse,
  SupporterProgressResponse,
} from "../../../infra/api/user.api";

type SupporterProgressSectionProps = {
  supporterProgress: SupporterProgressResponse | null;
  euro: Intl.NumberFormat;
  toDate: (value: Date) => string;
};

const badgeCatalog: Record<SupporterBadgeLevelResponse["branch"], SupporterBadgeLevelResponse[]> = {
  amount: [
    { level: 1, branch: "amount", name: "Bronze Patron", quantityLabel: "5 EUR", threshold: 500 },
    { level: 2, branch: "amount", name: "Silver Patron", quantityLabel: "20 EUR", threshold: 2000 },
    { level: 3, branch: "amount", name: "Gold Patron", quantityLabel: "50 EUR", threshold: 5000 },
    { level: 4, branch: "amount", name: "Platinum Patron", quantityLabel: "100 EUR", threshold: 10000 },
    { level: 5, branch: "amount", name: "Titan Patron", quantityLabel: "250 EUR", threshold: 25000 },
    { level: 6, branch: "amount", name: "Legend Patron", quantityLabel: "500 EUR", threshold: 50000 },
  ],
  months: [
    { level: 1, branch: "months", name: "Monthly Initiate", quantityLabel: "1 month", threshold: 1 },
    { level: 2, branch: "months", name: "Monthly Cadet", quantityLabel: "3 months", threshold: 3 },
    { level: 3, branch: "months", name: "Monthly Officer", quantityLabel: "6 months", threshold: 6 },
    { level: 4, branch: "months", name: "Monthly Captain", quantityLabel: "12 months", threshold: 12 },
    { level: 5, branch: "months", name: "Monthly Admiral", quantityLabel: "24 months", threshold: 24 },
    { level: 6, branch: "months", name: "Monthly Sovereign", quantityLabel: "36 months", threshold: 36 },
    { level: 7, branch: "months", name: "Monthly Sovereign", quantityLabel: "48 months", threshold: 48 },
  ],
};

const branchLabel = (branch: SupporterBadgeLevelResponse["branch"]) =>
  branch === "amount" ? "Total donated" : "Monthly support";

export function SupporterProgressSection({
  supporterProgress,
  euro,
  toDate,
}: SupporterProgressSectionProps) {
  const [badgeBranchView, setBadgeBranchView] =
    useState<SupporterBadgeLevelResponse["branch"]>("amount");
  const unlockedCount = supporterProgress?.unlockedBadges.length ?? 0;
  const unlockedBadgeMap = useMemo(() => {
    const entries =
      supporterProgress?.unlockedBadges.map((badge) => [`${badge.branch}-${badge.level}`, badge] as const) ?? [];
    return new Map(entries);
  }, [supporterProgress]);
  const visibleBadges = badgeCatalog[badgeBranchView];

  return (
    <div className={styles.sectionGrid}>
      <section className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Supporter progress</h2>
        <div className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <span>Total donated</span>
            <strong>{euro.format((supporterProgress?.totalDonatedEurMinor ?? 0) / 100)}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>Monthly support</span>
            <strong>{supporterProgress?.monthlySupportingMonths ?? 0} months</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>Unlocked badges</span>
            <strong>{unlockedCount}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>Progress updated</span>
            <strong>
              {supporterProgress?.updatedAt ? toDate(new Date(supporterProgress.updatedAt)) : "-"}
            </strong>
          </article>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Branch progression</h2>
        <div className={styles.supporterToggleBar}>
          <button
            type="button"
            className={badgeBranchView === "amount" ? styles.supporterToggleActive : styles.supporterToggle}
            onClick={() => setBadgeBranchView("amount")}
          >
            Amount
          </button>
          <button
            type="button"
            className={badgeBranchView === "months" ? styles.supporterToggleActive : styles.supporterToggle}
            onClick={() => setBadgeBranchView("months")}
          >
            Monthly
          </button>
        </div>
        {supporterProgress ? (
          <div className={styles.badgeGrid}>
            {visibleBadges.map((badge) => {
              const unlockedBadge = unlockedBadgeMap.get(`${badge.branch}-${badge.level}`);
              const unlocked = Boolean(unlockedBadge);
              const currentValue =
                badge.branch === "amount"
                  ? euro.format((supporterProgress.totalDonatedEurMinor ?? 0) / 100)
                  : `${supporterProgress.monthlySupportingMonths ?? 0} months`;

              return (
                <article
                  key={`${badge.branch}-${badge.level}`}
                  className={unlocked ? `${styles.badgeCard} ${styles.badgeUnlocked}` : `${styles.badgeCard} ${styles.badgeLocked}`}
                >
                  <div className={styles.badgeArtPlaceholder}>
                    <div className={styles.badgePlaceholderMark}>Badge</div>
                    <div className={styles.badgePlaceholderNote}>Image placeholder</div>
                  </div>
                  <div className={styles.rowBetween}>
                    <h3 className={styles.cardTitle}>{badge.name}</h3>
                    <span className={styles.badge}>Lv. {badge.level}</span>
                  </div>
                  <p className={styles.metaText}>Branch: {branchLabel(badge.branch)}</p>
                  <p className={styles.metaText}>Target: {badge.quantityLabel}</p>
                  <p className={styles.metaText}>Progress: {currentValue}</p>
                  <p className={styles.metaText}>
                    Status: {unlocked && unlockedBadge ? `Unlocked on ${toDate(new Date(unlockedBadge.unlockedAt))}` : "Locked"}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <p className={styles.empty}>No supporter progress available yet.</p>
        )}
      </section>
    </div>
  );
}
