"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sileo } from "sileo";
import { useAuth } from "../../application/hooks/useAuth";
import { useDonations } from "../../application/hooks/useDonations";
import { describeApiError } from "../../lib/errors/apiErrorMessage";
import { DonationType } from "../../types/donation.types";
import { ActionButton } from "../../ui/components/buttons/ActionButton";
import commonStyles from "../../styles/skeleton.module.css";
import styles from "../../styles/donation-guide.module.css";

const oneTimePresets = [500, 1000, 2000, 5000, 10000];
const monthlyPresets = [300, 500, 1000, 2000, 5000];

const toEuroText = (amountMinor: number) => (amountMinor / 100).toFixed(2);

function DonationGuidePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loadMe } = useAuth();
  const { createCheckout, confirmBySession } = useDonations();

  const [donationType, setDonationType] = useState<DonationType>("one_time");
  const [amountMinor, setAmountMinor] = useState<number>(1000);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isCheckoutPopupOpen, setIsCheckoutPopupOpen] = useState(false);

  const hasHandledReturnRef = useRef(false);
  const checkoutPopupRef = useRef<Window | null>(null);
  const popupWatcherRef = useRef<number | null>(null);

  const selectedPresets = useMemo(
    () => (donationType === "monthly" ? monthlyPresets : oneTimePresets),
    [donationType],
  );

  useEffect(() => {
    const bootstrap = async () => {
      if (isAuthenticated && user) return;
      try {
        await loadMe();
      } catch {
        sileo.error({
          title: "Login required",
          description: "You need to login before starting a donation.",
        });
        router.push("/login");
      }
    };

    void bootstrap();
  }, [isAuthenticated, loadMe, router, user]);

  useEffect(() => {
    if (hasHandledReturnRef.current) return;

    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (!paymentStatus) return;

    hasHandledReturnRef.current = true;

    const handleReturn = async () => {
      if (paymentStatus === "success") {
        if (!sessionId) {
          sileo.error({
            title: "Donation confirmation failed",
            description: "Stripe returned without a session id, so confirmation could not be completed.",
          });
          router.replace("/donations");
          return;
        }

        try {
          await confirmBySession(sessionId);
          sileo.success({
            title: "Donation confirmed",
            description: "Payment completed and donation saved successfully.",
          });
        } catch (error: unknown) {
          sileo.error({
            title: "Donation confirmation failed",
            description: describeApiError(
              error,
              "Payment may be completed, but we could not confirm it yet. Please try again in a moment.",
            ),
          });
        }
      }

      if (paymentStatus === "cancel") {
        sileo.error({
          title: "Donation canceled",
          description: "Stripe checkout was canceled. No charge was made.",
        });
      }

      router.replace("/donations");
    };

    void handleReturn();
  }, [confirmBySession, router, searchParams]);

  const onStartDonation = async () => {
    if (!user) {
      sileo.error({
        title: "Login required",
        description: "You need to login before starting a donation.",
      });
      router.push("/login");
      return;
    }

    setIsRedirecting(true);
    try {
      const origin = window.location.origin;
      const successUrl = `${origin}/donations?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/donations?payment=cancel`;

      const checkout = await createCheckout({
        donationType,
        amountMinor,
        currency: "EUR",
        successUrl,
        cancelUrl,
        customerEmail: user.email,
      });

      sileo.success({
        title: "Opening Stripe checkout",
        description: `Preparing ${donationType === "monthly" ? "monthly" : "one-time"} donation for EUR ${toEuroText(amountMinor)}.`,
      });

      const width = 520;
      const height = 760;
      const left = Math.max(0, Math.floor(window.screenX + (window.outerWidth - width) / 2));
      const top = Math.max(0, Math.floor(window.screenY + (window.outerHeight - height) / 2));
      const features =
        `popup=yes,width=${width},height=${height},left=${left},top=${top},` +
        "resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=yes";

      const popup = window.open(checkout.checkoutUrl, "simulactic_stripe_checkout", features);
      if (!popup) {
        setIsRedirecting(false);
        sileo.error({
          title: "Popup blocked",
          description: "Please allow popups for this site to continue with Stripe checkout.",
        });
        return;
      }

      checkoutPopupRef.current = popup;
      setIsCheckoutPopupOpen(true);
      setIsRedirecting(false);
      popup.focus();

      if (popupWatcherRef.current) {
        window.clearInterval(popupWatcherRef.current);
      }

      popupWatcherRef.current = window.setInterval(() => {
        if (!checkoutPopupRef.current || checkoutPopupRef.current.closed) {
          setIsCheckoutPopupOpen(false);
          if (popupWatcherRef.current) {
            window.clearInterval(popupWatcherRef.current);
            popupWatcherRef.current = null;
          }
        }
      }, 400);
    } catch (error: unknown) {
      setIsRedirecting(false);
      sileo.error({
        title: "Could not start donation",
        description: describeApiError(
          error,
          "Stripe checkout could not be created. Please verify the selected amount and try again.",
        ),
      });
    }
  };

  useEffect(() => {
    return () => {
      if (popupWatcherRef.current) {
        window.clearInterval(popupWatcherRef.current);
        popupWatcherRef.current = null;
      }
    };
  }, []);

  return (
    <section className={styles.page}>
      {isCheckoutPopupOpen ? <div className={styles.checkoutBackdrop} aria-hidden="true" /> : null}
      <header className={styles.header}>
        <p className={commonStyles.meta}>Support Simulactic</p>
        <h1 className={commonStyles.title}>Donation Guide</h1>
        <p className={commonStyles.subtitle}>
          Donations help keep Simulactic stable, improve 3D rendering quality, and accelerate the
          roadmap from galaxy simulator to full strategy experience.
        </p>
      </header>

      <section className={styles.checkoutCard}>
        <h2 className={commonStyles.panelTitle}>Start a donation</h2>
        <p className={styles.helperText}>Select donation type and amount, then continue to Stripe checkout.</p>

        <div className={styles.typeSwitch}>
          <button
            type="button"
            className={donationType === "one_time" ? styles.typeButtonActive : styles.typeButton}
            onClick={() => {
              setDonationType("one_time");
              setAmountMinor(1000);
            }}
          >
            One-time
          </button>
          <button
            type="button"
            className={donationType === "monthly" ? styles.typeButtonActive : styles.typeButton}
            onClick={() => {
              setDonationType("monthly");
              setAmountMinor(500);
            }}
          >
            Monthly
          </button>
        </div>

        <div className={styles.presetGrid}>
          {selectedPresets.map((preset) => (
            <button
              key={`${donationType}-${preset}`}
              type="button"
              className={amountMinor === preset ? styles.presetActive : styles.preset}
              onClick={() => setAmountMinor(preset)}
            >
              EUR {toEuroText(preset)}
            </button>
          ))}
        </div>

        <div className={styles.manualAmount}>
          <label htmlFor="custom-amount">Custom amount (EUR)</label>
          <input
            id="custom-amount"
            type="number"
            min={1}
            step={0.01}
            value={toEuroText(amountMinor)}
            onChange={(event) => {
              const raw = Number(event.target.value);
              const asMinor = Number.isFinite(raw) ? Math.round(raw * 100) : amountMinor;
              setAmountMinor(Math.max(100, asMinor));
            }}
          />
        </div>

        <div className={styles.summary}>
          <p>
            Type: <strong>{donationType === "monthly" ? "Monthly" : "One-time"}</strong>
          </p>
          <p>
            Amount: <strong>EUR {toEuroText(amountMinor)}</strong>
          </p>
        </div>

        <ActionButton
          onClick={() => void onStartDonation()}
          disabled={isRedirecting || amountMinor < 100 || isCheckoutPopupOpen}
        >
          {isRedirecting ? "Opening..." : "Donate with Stripe"}
        </ActionButton>
      </section>

      <section className={styles.placeholderGrid}>
        <article className={styles.placeholderCard}>
          <h2 className={styles.cardTitle}>Why Donate</h2>
          <p className={commonStyles.meta}>
            Simulactic is built as a long-term solo project. Donations directly support development
            time, infrastructure costs, and feature delivery quality.
          </p>
          <p className={commonStyles.meta}>
            Your support helps fund improvements such as better scene interactions, richer simulation
            depth, and a faster roadmap cadence.
          </p>
        </article>

        <article className={styles.placeholderCard}>
          <h2 className={styles.cardTitle}>Donation Terms</h2>
          <p className={commonStyles.meta}>
            Donations are voluntary and processed through Stripe. You can choose one-time or monthly
            support and cancel monthly subscriptions from your account/provider controls.
          </p>
          <p className={commonStyles.meta}>
            Charges are shown before confirmation. Billing handling, payment methods, and transaction
            validation are managed by the payment provider.
          </p>
        </article>

        <article className={styles.placeholderCard}>
          <h2 className={styles.cardTitle}>Supporter Benefits</h2>
          <p className={commonStyles.meta}>
            Supporter status unlocks unlimited galaxy creation and badge progression that tracks both
            total contribution and support duration over time.
          </p>
          <p className={commonStyles.meta}>
            Supporters are also included in roadmap-focused update communications with transparent
            progress notes and upcoming feature priorities.
          </p>
        </article>
      </section>
    </section>
  );
}

export default function DonationGuidePage() {
  return (
    <Suspense fallback={<section className={styles.page} />}>
      <DonationGuidePageContent />
    </Suspense>
  );
}
