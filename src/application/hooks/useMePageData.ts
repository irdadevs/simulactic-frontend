"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import { useAuth } from "./useAuth";
import { useDonations } from "./useDonations";
import { useGalaxy } from "./useGalaxy";
import { donationApi, SupporterBadgeCatalogItemResponse } from "../../infra/api/donation.api";
import { galaxyApi } from "../../infra/api/galaxy.api";
import { SupporterProgressResponse, userApi } from "../../infra/api/user.api";
import { describeApiError } from "../../lib/errors/apiErrorMessage";
import { useAuthStore } from "../../state/auth.store";

export type MeSectionId = "personal" | "creations" | "donations";

export type GalaxyStats = {
  systems: number;
  stars: number;
  planets: number;
  moons: number;
  asteroids: number;
};

export function useMePageData() {
  const router = useRouter();
  const { user, isAuthenticated, loadMe, changeEmail, changePassword, changeUsername } = useAuth();
  const { galaxies, loadGalaxiesForOwner } = useGalaxy();
  const { donations, list, createPortalSession } = useDonations();

  const [activeSection, setActiveSection] = useState<MeSectionId>("personal");
  const [creationOrder, setCreationOrder] = useState<"created" | "name" | "systems" | "stars">(
    "created",
  );
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
  const [openingPortal, setOpeningPortal] = useState(false);
  const [portalPopupOpen, setPortalPopupOpen] = useState(false);

  const [supporterProgress, setSupporterProgress] = useState<SupporterProgressResponse | null>(null);
  const [supporterBadges, setSupporterBadges] = useState<SupporterBadgeCatalogItemResponse[]>([]);
  const [galaxyStats, setGalaxyStats] = useState<Record<string, GalaxyStats>>({});

  const hasBootstrappedRef = useRef(false);
  const supporterRefreshInFlightRef = useRef<Promise<void> | null>(null);
  const portalPopupRef = useRef<Window | null>(null);
  const portalPopupWatcherRef = useRef<number | null>(null);

  const refreshSupporterData = useCallback(async () => {
    if (supporterRefreshInFlightRef.current) {
      await supporterRefreshInFlightRef.current;
      return;
    }

    const task = (async () => {
      await loadMe();
      const currentUserId = user?.id ?? useAuthStore.getState().user?.id;
      if (!currentUserId) {
        throw new Error("Authenticated user id is required to load profile donations.");
      }

      const [, supporter] = await Promise.all([
        list({ userId: currentUserId, orderBy: "createdAt", orderDir: "desc", limit: 100 }),
        userApi.mySupporterProgress().catch(() => null),
      ]);

      setSupporterProgress(supporter);
    })();

    supporterRefreshInFlightRef.current = task;
    try {
      await task;
    } finally {
      supporterRefreshInFlightRef.current = null;
    }
  }, [list, loadMe, user?.id]);

  useEffect(() => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;

    const bootstrap = async () => {
      try {
        if (!isAuthenticated || !user) {
          await loadMe();
        }

        const currentUserId = user?.id ?? useAuthStore.getState().user?.id;
        if (!currentUserId) {
          throw new Error("Authenticated user id is required to load profile data.");
        }

        const galaxiesResult = await loadGalaxiesForOwner(currentUserId, {
          orderBy: "createdAt",
          orderDir: "desc",
        });

        const [, supporter, badgeCatalog] = await Promise.all([
          list({ userId: currentUserId, orderBy: "createdAt", orderDir: "desc", limit: 100 }),
          userApi.mySupporterProgress().catch(() => null),
          donationApi.listBadges().then((response) => response.rows).catch(() => []),
        ]);
        setSupporterProgress(supporter);
        setSupporterBadges(badgeCatalog);

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
  }, [isAuthenticated, list, loadGalaxiesForOwner, loadMe, router, user]);

  useEffect(() => {
    const onFocus = () => {
      void refreshSupporterData();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshSupporterData();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refreshSupporterData]);

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

  const onOpenCustomerPortal = useCallback(async () => {
    if (!user?.isSupporter) {
      return;
    }

    setOpeningPortal(true);
    try {
      const returnUrl = `${window.location.origin}/me`;
      const result = await createPortalSession({ returnUrl });

      const width = 520;
      const height = 760;
      const left = Math.max(0, Math.floor(window.screenX + (window.outerWidth - width) / 2));
      const top = Math.max(0, Math.floor(window.screenY + (window.outerHeight - height) / 2));
      const features =
        `popup=yes,width=${width},height=${height},left=${left},top=${top},` +
        "resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=yes";

      const popup = window.open(result.url, "simulactic_stripe_customer_portal", features);
      if (!popup) {
        sileo.error({
          title: "Popup blocked",
          description: "Please allow popups for this site to continue to Stripe customer portal.",
        });
        return;
      }

      portalPopupRef.current = popup;
      setPortalPopupOpen(true);
      popup.focus();

      if (portalPopupWatcherRef.current) {
        window.clearInterval(portalPopupWatcherRef.current);
      }

      portalPopupWatcherRef.current = window.setInterval(() => {
        if (!portalPopupRef.current || portalPopupRef.current.closed) {
          setPortalPopupOpen(false);
          void refreshSupporterData();
          if (portalPopupWatcherRef.current) {
            window.clearInterval(portalPopupWatcherRef.current);
            portalPopupWatcherRef.current = null;
          }
        }
      }, 400);
    } catch (error: unknown) {
      sileo.error({
        title: "Could not open customer portal",
        description: describeApiError(
          error,
          "We could not create your Stripe customer portal session right now.",
        ),
      });
    } finally {
      setOpeningPortal(false);
    }
  }, [createPortalSession, refreshSupporterData, user?.isSupporter]);

  useEffect(() => {
    return () => {
      if (portalPopupWatcherRef.current) {
        window.clearInterval(portalPopupWatcherRef.current);
        portalPopupWatcherRef.current = null;
      }
    };
  }, []);

  return {
    user,
    donations,
    galaxies,
    activeSection,
    setActiveSection,
    creationOrder,
    setCreationOrder,
    bootstrapping,
    newUsername,
    setNewUsername,
    newEmail,
    setNewEmail,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    savingUsername,
    savingEmail,
    savingPassword,
    supporterProgress,
    supporterBadges,
    openingPortal,
    portalPopupOpen,
    galaxyStats,
    totalStats,
    sortedGalaxies,
    onUsernameSubmit,
    onEmailSubmit,
    onPasswordSubmit,
    onOpenCustomerPortal,
  };
}
