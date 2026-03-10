"use client";

import { useMePageData } from "../../application/hooks/useMePageData";
import { DonationsHistorySection } from "../../ui/components/profile/DonationsHistorySection";
import { CreationsSection } from "../../ui/components/profile/CreationsSection";
import { PersonalInfoSection } from "../../ui/components/profile/PersonalInfoSection";
import { ProfileSidebar } from "../../ui/components/profile/ProfileSidebar";
import { SupporterProgressSection } from "../../ui/components/settings/SupporterProgressSection";
import styles from "../../styles/me.module.css";

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
  const me = useMePageData();

  if (me.bootstrapping) {
    return <section className={styles.loading}>Loading profile...</section>;
  }

  return (
    <section className={styles.page}>
      <ProfileSidebar activeSection={me.activeSection} onSectionChange={me.setActiveSection} />

      <article className={styles.content}>
        {me.activeSection === "personal" && (
          <PersonalInfoSection
            user={me.user}
            toDate={toDate}
            newUsername={me.newUsername}
            newEmail={me.newEmail}
            currentPassword={me.currentPassword}
            newPassword={me.newPassword}
            showCurrentPassword={me.showCurrentPassword}
            showNewPassword={me.showNewPassword}
            savingUsername={me.savingUsername}
            savingEmail={me.savingEmail}
            savingPassword={me.savingPassword}
            onUsernameChange={me.setNewUsername}
            onEmailChange={me.setNewEmail}
            onCurrentPasswordChange={me.setCurrentPassword}
            onNewPasswordChange={me.setNewPassword}
            onToggleCurrentPassword={() => me.setShowCurrentPassword((current) => !current)}
            onToggleNewPassword={() => me.setShowNewPassword((current) => !current)}
            onUsernameSubmit={me.onUsernameSubmit}
            onEmailSubmit={me.onEmailSubmit}
            onPasswordSubmit={me.onPasswordSubmit}
          />
        )}

        {me.activeSection === "creations" && (
          <CreationsSection
            creationOrder={me.creationOrder}
            onCreationOrderChange={me.setCreationOrder}
            galaxies={me.galaxies}
            totalStats={me.totalStats}
            sortedGalaxies={me.sortedGalaxies}
            galaxyStats={me.galaxyStats}
            toDate={toDate}
          />
        )}

        {me.activeSection === "donations" && (
          <div className={styles.sectionGrid}>
            <SupporterProgressSection
              supporterProgress={me.supporterProgress}
              supporterBadges={me.supporterBadges}
              euro={euro}
              toDate={toDate}
            />
            <DonationsHistorySection
              donations={me.donations}
              euro={euro}
              toDate={toDate}
              donationBadgeClassByStatus={donationBadgeClassByStatus}
            />
          </div>
        )}
      </article>
    </section>
  );
}
