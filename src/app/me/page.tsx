"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import { useAuth } from "../../application/hooks/useAuth";
import { useDonations } from "../../application/hooks/useDonations";
import { useGalaxy } from "../../application/hooks/useGalaxy";
import { galaxyApi } from "../../infra/api/galaxy.api";
import { SupporterProgressResponse, userApi } from "../../infra/api/user.api";
import { describeApiError } from "../../lib/errors/apiErrorMessage";
import { ActionButton } from "../../ui/components/buttons/ActionButton";
import commonStyles from "../../styles/skeleton.module.css";
import styles from "../../styles/me.module.css";

type SectionId = "personal" | "creations" | "donations";

type GalaxyStats = {
  systems: number;
  stars: number;
  planets: number;
  moons: number;
  asteroids: number;
};

type BadgeLevel = {
  id: string;
  branch: "amount" | "months";
  name: string;
  quantityLabel: string;
  threshold: number;
};

const amountBadges: BadgeLevel[] = [
  { id: "amount_l1", branch: "amount", name: "Bronze Patron", quantityLabel: "5 EUR", threshold: 5 },
  { id: "amount_l2", branch: "amount", name: "Silver Patron", quantityLabel: "20 EUR", threshold: 20 },
  { id: "amount_l3", branch: "amount", name: "Gold Patron", quantityLabel: "50 EUR", threshold: 50 },
  { id: "amount_l4", branch: "amount", name: "Platinum Patron", quantityLabel: "100 EUR", threshold: 100 },
  { id: "amount_l5", branch: "amount", name: "Titan Patron", quantityLabel: "250 EUR", threshold: 250 },
  { id: "amount_l6", branch: "amount", name: "Legend Patron", quantityLabel: "500 EUR", threshold: 500 },
];

const monthlyBadges: BadgeLevel[] = [
  { id: "months_l1", branch: "months", name: "Monthly Initiate", quantityLabel: "1 month", threshold: 1 },
  { id: "months_l2", branch: "months", name: "Monthly Cadet", quantityLabel: "3 months", threshold: 3 },
  { id: "months_l3", branch: "months", name: "Monthly Officer", quantityLabel: "6 months", threshold: 6 },
  { id: "months_l4", branch: "months", name: "Monthly Captain", quantityLabel: "12 months", threshold: 12 },
  { id: "months_l5", branch: "months", name: "Monthly Admiral", quantityLabel: "24 months", threshold: 24 },
  { id: "months_l6", branch: "months", name: "Monthly Sovereign", quantityLabel: "36 months", threshold: 36 },
];

const allBadges = [...amountBadges, ...monthlyBadges];

const euro = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const toDate = (value: Date) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(value);

const donationStatusTone = (status: string) => {
  if (status === "pending") return "pending";
  if (status === "completed" || status === "active") return "completed";
  if (status === "failed" || status === "canceled" || status === "expired") return "failed";
  return "default";
};

const donationBadgeClassByStatus = (status: string) => {
  const tone = donationStatusTone(status);
  if (tone === "pending") return styles.statusBadgePending;
  if (tone === "completed") return styles.statusBadgeCompleted;
  if (tone === "failed") return styles.statusBadgeFailed;
  return styles.statusBadgeDefault;
};

export default function MePage() {
  const router = useRouter();
  const { user, isAuthenticated, loadMe, changeEmail, changePassword, changeUsername } = useAuth();
  const { galaxies, loadGalaxies } = useGalaxy();
  const { donations, list } = useDonations();

  const [activeSection, setActiveSection] = useState<SectionId>("personal");
  const [creationOrder, setCreationOrder] = useState<"created" | "name" | "systems" | "stars">("created");
  const [bootstrapping, setBootstrapping] = useState(true);

  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [savingUsername, setSavingUsername] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [supporterProgress, setSupporterProgress] = useState<SupporterProgressResponse | null>(null);
  const [galaxyStats, setGalaxyStats] = useState<Record<string, GalaxyStats>>({});

  const hasBootstrappedRef = useRef(false);

  useEffect(() => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;

    const bootstrap = async () => {
      try {
        if (!isAuthenticated || !user) {
          await loadMe();
        }

        const galaxiesResult = await loadGalaxies({ orderBy: "createdAt", orderDir: "desc" });

        const [, supporter] = await Promise.all([
          list({ orderBy: "createdAt", orderDir: "desc", limit: 100 }),
          userApi.mySupporterProgress().catch(() => null),
        ]);
        setSupporterProgress(supporter);

        if (galaxiesResult.rows.length > 0) {
          const entries = await Promise.all(
            galaxiesResult.rows.map(async (galaxy) => {
              try {
                const counts = await galaxyApi.counts(galaxy.id);
                return [galaxy.id, counts] as const;
              } catch {
                return [
                  galaxy.id,
                  {
                    systems: galaxy.systemCount,
                    stars: 0,
                    planets: 0,
                    moons: 0,
                    asteroids: 0,
                  },
                ] as const;
              }
            }),
          );
          setGalaxyStats(Object.fromEntries(entries));
        }
      } catch {
        sileo.error({
          title: "Session required",
          description: "Please sign in to access your profile page.",
        });
        router.push("/login");
      } finally {
        setBootstrapping(false);
      }
    };

    void bootstrap();
  }, [isAuthenticated, list, loadGalaxies, loadMe, router, user]);

  useEffect(() => {
    if (!user) return;
    setNewUsername(user.username);
    setNewEmail(user.email);
  }, [user]);

  const totalStats = useMemo(() => {
    return galaxies.reduce(
      (acc, galaxy) => {
        const stats = galaxyStats[galaxy.id];
        acc.systems += stats?.systems ?? galaxy.systemCount;
        acc.stars += stats?.stars ?? 0;
        acc.planets += stats?.planets ?? 0;
        acc.moons += stats?.moons ?? 0;
        acc.asteroids += stats?.asteroids ?? 0;
        return acc;
      },
      { systems: 0, stars: 0, planets: 0, moons: 0, asteroids: 0 },
    );
  }, [galaxies, galaxyStats]);

  const sortedGalaxies = useMemo(() => {
    return [...galaxies].sort((left, right) => {
      if (creationOrder === "name") return left.name.localeCompare(right.name);
      if (creationOrder === "systems") return right.systemCount - left.systemCount;
      if (creationOrder === "stars") {
        const leftStars = galaxyStats[left.id]?.stars ?? -1;
        const rightStars = galaxyStats[right.id]?.stars ?? -1;
        return rightStars - leftStars;
      }
      return right.createdAt.getTime() - left.createdAt.getTime();
    });
  }, [creationOrder, galaxies, galaxyStats]);

  const onUsernameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingUsername(true);
    try {
      await changeUsername({ newUsername });
      await loadMe();
      sileo.success({
        title: "Username updated",
        description: "Your new username has been saved successfully.",
      });
    } catch (error: unknown) {
      sileo.error({
        title: "Could not update username",
        description: describeApiError(
          error,
          "We could not update your username. Check that the value is valid and unique.",
        ),
      });
    } finally {
      setSavingUsername(false);
    }
  };

  const onEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingEmail(true);
    try {
      await changeEmail({ newEmail });
      await loadMe();
      sileo.success({
        title: "Email updated",
        description: "Your account email has been updated successfully.",
      });
    } catch (error: unknown) {
      sileo.error({
        title: "Could not update email",
        description: describeApiError(
          error,
          "We could not update your email. Verify the address format and try again.",
        ),
      });
    } finally {
      setSavingEmail(false);
    }
  };

  const onPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      sileo.success({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error: unknown) {
      sileo.error({
        title: "Could not update password",
        description: describeApiError(
          error,
          "We could not update your password. Ensure your current password is correct.",
        ),
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const amountNow = (supporterProgress?.totalDonatedEurMinor ?? 0) / 100;
  const monthsNow = supporterProgress?.monthlySupportingMonths ?? 0;

  if (bootstrapping) {
    return <section className={styles.loading}>Loading profile...</section>;
  }

  return (
    <section className={styles.page}>
      <aside className={styles.sidebar}>
        <h1 className={commonStyles.title}>My Profile</h1>
        <p className={commonStyles.subtitle}>Manage account data, creations and supporter status.</p>

        <div className={styles.sidebarActions}>
          <button
            type="button"
            className={activeSection === "personal" ? styles.sidebarButtonActive : styles.sidebarButton}
            onClick={() => setActiveSection("personal")}
          >
            Personal info
          </button>
          <button
            type="button"
            className={activeSection === "creations" ? styles.sidebarButtonActive : styles.sidebarButton}
            onClick={() => setActiveSection("creations")}
          >
            My creations
          </button>
          <button
            type="button"
            className={activeSection === "donations" ? styles.sidebarButtonActive : styles.sidebarButton}
            onClick={() => setActiveSection("donations")}
          >
            Donations and badges
          </button>
        </div>
      </aside>

      <article className={styles.content}>
        {activeSection === "personal" && (
          <div className={styles.sectionGrid}>
            <section className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Current account</h2>
              <div className={styles.kvList}>
                <div>
                  <span className={styles.kvLabel}>Username</span>
                  <strong>{user?.username ?? "-"}</strong>
                </div>
                <div>
                  <span className={styles.kvLabel}>Email</span>
                  <strong>{user?.email ?? "-"}</strong>
                </div>
                <div>
                  <span className={styles.kvLabel}>Role</span>
                  <strong>{user?.role ?? "-"}</strong>
                </div>
                <div>
                  <span className={styles.kvLabel}>Supporter</span>
                  <strong>{user?.isSupporter ? "Yes" : "No"}</strong>
                </div>
                <div>
                  <span className={styles.kvLabel}>Created</span>
                  <strong>{user ? toDate(user.createdAt) : "-"}</strong>
                </div>
                <div>
                  <span className={styles.kvLabel}>Last activity</span>
                  <strong>{user ? toDate(user.lastActivityAt) : "-"}</strong>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Update username</h2>
              <form className={commonStyles.form} onSubmit={onUsernameSubmit}>
                <div className={commonStyles.field}>
                  <label htmlFor="new-username">New username</label>
                  <input
                    id="new-username"
                    type="text"
                    value={newUsername}
                    onChange={(event) => setNewUsername(event.target.value)}
                    minLength={3}
                    maxLength={25}
                    required
                  />
                </div>
                <ActionButton type="submit" disabled={savingUsername}>
                  {savingUsername ? "Saving..." : "Save username"}
                </ActionButton>
              </form>
            </section>

            <section className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Update email</h2>
              <form className={commonStyles.form} onSubmit={onEmailSubmit}>
                <div className={commonStyles.field}>
                  <label htmlFor="new-email">New email</label>
                  <input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(event) => setNewEmail(event.target.value)}
                    required
                  />
                </div>
                <ActionButton type="submit" disabled={savingEmail}>
                  {savingEmail ? "Saving..." : "Save email"}
                </ActionButton>
              </form>
            </section>

            <section className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Update password</h2>
              <form className={commonStyles.form} onSubmit={onPasswordSubmit}>
                <div className={commonStyles.field}>
                  <label htmlFor="current-password">Current password</label>
                  <div className={commonStyles.passwordField}>
                    <input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={commonStyles.passwordToggle}
                      onClick={() => setShowCurrentPassword((current) => !current)}
                      aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                    >
                      <img
                        src={showCurrentPassword ? "/icons/hide.svg" : "/icons/view.svg"}
                        alt=""
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
                <div className={commonStyles.field}>
                  <label htmlFor="new-password">New password</label>
                  <div className={commonStyles.passwordField}>
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      className={commonStyles.passwordToggle}
                      onClick={() => setShowNewPassword((current) => !current)}
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                    >
                      <img src={showNewPassword ? "/icons/hide.svg" : "/icons/view.svg"} alt="" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <ActionButton type="submit" disabled={savingPassword}>
                  {savingPassword ? "Saving..." : "Save password"}
                </ActionButton>
              </form>
            </section>

          </div>
        )}

        {activeSection === "creations" && (
          <div className={styles.sectionGrid}>
            <section className={styles.card}>
              <div className={styles.rowBetween}>
                <h2 className={commonStyles.panelTitle}>My galaxy stats</h2>
                <div className={styles.inlineField}>
                  <label htmlFor="creation-order">Order by</label>
                  <select
                    id="creation-order"
                    value={creationOrder}
                    onChange={(event) =>
                      setCreationOrder(event.target.value as "created" | "name" | "systems" | "stars")
                    }
                  >
                    <option value="created">Latest</option>
                    <option value="name">Name</option>
                    <option value="systems">Systems</option>
                    <option value="stars">Stars</option>
                  </select>
                </div>
              </div>

              <div className={styles.summaryGrid}>
                <article className={styles.summaryCard}>
                  <span>Galaxies</span>
                  <strong>{galaxies.length}</strong>
                </article>
                <article className={styles.summaryCard}>
                  <span>Systems</span>
                  <strong>{totalStats.systems}</strong>
                </article>
                <article className={styles.summaryCard}>
                  <span>Stars</span>
                  <strong>{totalStats.stars}</strong>
                </article>
                <article className={styles.summaryCard}>
                  <span>Planets</span>
                  <strong>{totalStats.planets}</strong>
                </article>
                <article className={styles.summaryCard}>
                  <span>Moons</span>
                  <strong>{totalStats.moons}</strong>
                </article>
                <article className={styles.summaryCard}>
                  <span>Asteroids</span>
                  <strong>{totalStats.asteroids}</strong>
                </article>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Galaxy list</h2>
              <div className={styles.listGrid}>
                {sortedGalaxies.map((galaxy) => {
                  const stats = galaxyStats[galaxy.id];
                  return (
                    <article key={galaxy.id} className={styles.listCard}>
                      <div className={styles.rowBetween}>
                        <h3 className={styles.cardTitle}>{galaxy.name}</h3>
                        <span className={styles.badge}>{galaxy.shape}</span>
                      </div>
                      <p className={styles.metaText}>Created {toDate(galaxy.createdAt)}</p>
                      <div className={styles.detailGrid}>
                        <p>Systems: {stats?.systems ?? galaxy.systemCount}</p>
                        <p>Stars: {stats?.stars ?? "..."}</p>
                        <p>Planets: {stats?.planets ?? "..."}</p>
                        <p>Moons: {stats?.moons ?? "..."}</p>
                        <p>Asteroids: {stats?.asteroids ?? "..."}</p>
                      </div>
                    </article>
                  );
                })}
                {sortedGalaxies.length === 0 ? <p className={styles.empty}>No galaxies yet.</p> : null}
              </div>
            </section>
          </div>
        )}

        {activeSection === "donations" && (
          <div className={styles.sectionGrid}>
            <section className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Supporter progress</h2>
              <div className={styles.summaryGrid}>
                <article className={styles.summaryCard}>
                  <span>Total donated</span>
                  <strong>{euro.format(amountNow)}</strong>
                </article>
                <article className={styles.summaryCard}>
                  <span>Monthly support</span>
                  <strong>{monthsNow} months</strong>
                </article>
                <article className={styles.summaryCard}>
                  <span>Unlocked badges</span>
                  <strong>{supporterProgress?.unlockedBadges.length ?? 0} / 12</strong>
                </article>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Badge collection</h2>
              <div className={styles.badgeGrid}>
                {allBadges.map((badge) => {
                  const unlocked = Boolean(supporterProgress?.unlockedBadges.includes(badge.id));
                  const progressValue =
                    badge.branch === "amount"
                      ? `${euro.format(amountNow)} / ${badge.quantityLabel}`
                      : `${monthsNow} / ${badge.threshold} months`;

                  return (
                    <article
                      key={badge.id}
                      className={
                        unlocked
                          ? `${styles.badgeCard} ${styles.badgeUnlocked}`
                          : `${styles.badgeCard} ${styles.badgeLocked}`
                      }
                    >
                      <div className={styles.badgeArtPlaceholder}>Badge image slot</div>
                      <h3 className={styles.cardTitle}>{badge.name}</h3>
                      <p className={styles.metaText}>{badge.branch === "amount" ? "Total donation" : "Monthly streak"}</p>
                      <p className={styles.metaText}>Quantity: {unlocked ? 1 : 0}</p>
                      <p className={styles.metaText}>Target: {badge.quantityLabel}</p>
                      <p className={styles.metaText}>Progress: {progressValue}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={commonStyles.panelTitle}>Donations history</h2>
              <div className={styles.listGrid}>
                {donations.map((donation) => (
                  <article
                    key={donation.id}
                    className={`${styles.listCard} ${styles.donationCard}`}
                  >
                    <div className={styles.rowBetween}>
                      <h3 className={styles.cardTitle}>
                        {donation.donationType === "monthly" ? "Monthly" : "One-time"} donation
                      </h3>
                      <span className={`${styles.badge} ${styles.statusBadge} ${donationBadgeClassByStatus(donation.status)}`}>
                        {donation.status}
                      </span>
                    </div>
                    <p className={styles.metaText}>Amount: {euro.format(donation.amountMinor / 100)}</p>
                    <p className={styles.metaText}>Created: {toDate(donation.createdAt)}</p>
                    <p className={styles.metaText}>
                      Current period: {donation.currentPeriodStart ? toDate(donation.currentPeriodStart) : "-"} to {" "}
                      {donation.currentPeriodEnd ? toDate(donation.currentPeriodEnd) : "-"}
                    </p>
                  </article>
                ))}
                {donations.length === 0 ? <p className={styles.empty}>No donations yet.</p> : null}
              </div>
            </section>
          </div>
        )}
      </article>
    </section>
  );
}
