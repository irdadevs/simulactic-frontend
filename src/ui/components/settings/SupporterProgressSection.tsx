import { useMemo, useState } from "react";
import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/me.module.css";
import {
  SupporterProgressResponse,
} from "../../../infra/api/user.api";
import { SupporterBadgeCatalogItemResponse } from "../../../infra/api/donation.api";

type SupporterProgressSectionProps = {
  supporterProgress: SupporterProgressResponse | null;
  supporterBadges: SupporterBadgeCatalogItemResponse[];
  euro: Intl.NumberFormat;
  toDate: (value: Date) => string;
};

const fallbackBadgeCatalog: SupporterBadgeCatalogItemResponse[] = [
  { id: 1, branch: "amount", level: 1, name: "Bronze Patron", quantityLabel: "5 EUR", threshold: 500 },
  { id: 2, branch: "amount", level: 2, name: "Silver Patron", quantityLabel: "20 EUR", threshold: 2000 },
  { id: 3, branch: "amount", level: 3, name: "Gold Patron", quantityLabel: "50 EUR", threshold: 5000 },
  { id: 4, branch: "amount", level: 4, name: "Platinum Patron", quantityLabel: "100 EUR", threshold: 10000 },
  { id: 5, branch: "amount", level: 5, name: "Titan Patron", quantityLabel: "250 EUR", threshold: 25000 },
  { id: 6, branch: "amount", level: 6, name: "Legend Patron", quantityLabel: "500 EUR", threshold: 50000 },
  { id: 7, branch: "months", level: 1, name: "Monthly Initiate", quantityLabel: "1 month", threshold: 1 },
  { id: 8, branch: "months", level: 2, name: "Monthly Cadet", quantityLabel: "3 months", threshold: 3 },
  { id: 9, branch: "months", level: 3, name: "Monthly Officer", quantityLabel: "6 months", threshold: 6 },
  { id: 10, branch: "months", level: 4, name: "Monthly Captain", quantityLabel: "12 months", threshold: 12 },
  { id: 11, branch: "months", level: 5, name: "Monthly Admiral", quantityLabel: "24 months", threshold: 24 },
  { id: 12, branch: "months", level: 6, name: "Monthly Sovereign", quantityLabel: "36 months", threshold: 36 },
  { id: 13, branch: "months", level: 7, name: "Monthly Sovereign", quantityLabel: "48 months", threshold: 48 },
];

const branchLabel = (branch: SupporterBadgeCatalogItemResponse["branch"]) =>
  branch === "amount" ? "Total donated" : "Monthly support";

export function SupporterProgressSection({
  supporterProgress,
  supporterBadges,
  euro,
  toDate,
}: SupporterProgressSectionProps) {
  const [badgeBranchView, setBadgeBranchView] =
    useState<SupporterBadgeCatalogItemResponse["branch"]>("amount");
  const unlockedCount = supporterProgress?.unlockedBadges.length ?? 0;
  const unlockedBadgeMap = useMemo(() => {
    const entries =
      supporterProgress?.unlockedBadges.map((badge) => [`${badge.branch}-${badge.level}`, badge] as const) ?? [];
    return new Map(entries);
  }, [supporterProgress]);
  const resolvedBadgeCatalog = supporterBadges.length > 0 ? supporterBadges : fallbackBadgeCatalog;
  const visibleBadges = useMemo(
    () =>
      resolvedBadgeCatalog
        .filter((badge) => badge.branch === badgeBranchView)
        .sort((left, right) => left.level - right.level),
    [badgeBranchView, resolvedBadgeCatalog],
  );

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
        {visibleBadges.length > 0 ? (
          <div className={styles.badgeGrid}>
            {visibleBadges.map((badge) => {
              const unlockedBadge = unlockedBadgeMap.get(`${badge.branch}-${badge.level}`);
              const unlocked = Boolean(unlockedBadge);
              const currentValue =
                badge.branch === "amount"
                  ? euro.format((supporterProgress?.totalDonatedEurMinor ?? 0) / 100)
                  : `${supporterProgress?.monthlySupportingMonths ?? 0} months`;

              return (
                <article
                  key={badge.id}
                  className={unlocked ? `${styles.badgeCard} ${styles.badgeUnlocked}` : `${styles.badgeCard} ${styles.badgeLocked}`}
                >
                  <div className={styles.badgeArtPlaceholder}>
                    <div className={styles.badgePlaceholderMark}>{badge.name}</div>
                    <div className={styles.badgePlaceholderNote}>{branchLabel(badge.branch)}</div>
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
          <p className={styles.empty}>No supporter badge catalog available yet.</p>
        )}
      </section>
    </div>
  );
}
