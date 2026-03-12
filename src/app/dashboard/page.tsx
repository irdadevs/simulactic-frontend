"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sileo } from "sileo";
import { useAuth } from "../../application/hooks/useAuth";
import { useGalaxy } from "../../application/hooks/useGalaxy";
import { useRenderCoordinator } from "../../application/hooks/useRenderCoordinator";
import { isHandledSessionExpiryError } from "../../infra/api/client";
import { describeApiError } from "../../lib/errors/apiErrorMessage";
import { useRenderStore } from "../../state/render.store";
import { useAuthStore } from "../../state/auth.store";
import { GalaxyListPanel } from "../../ui/components/layout/galaxy/GalaxyListPanel";
import styles from "../../styles/layout.module.css";

const MockCanvasPanel = dynamic(
  () => import("../../ui/components/layout/MockCanvasPanel").then((mod) => mod.MockCanvasPanel),
  { ssr: false },
);

const CreateGalaxyModal = dynamic(
  () => import("../../ui/components/modals/CreateGalaxyModal").then((mod) => mod.CreateGalaxyModal),
  { ssr: false },
);

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loadMe } = useAuth();
  const {
    machineState,
    serializedGalaxyData,
    serializedSystemData,
    loadGalaxyForRender,
    onWheelZoom,
    pendingSystemName,
  } = useRenderCoordinator();

  const {
    galaxies,
    selectedGalaxy,
    isLoading,
    loadGalaxies,
    loadGalaxiesForOwner,
    loadGalaxyById,
    createGalaxy,
    deleteGalaxy,
  } = useGalaxy();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingGalaxyId, setDeletingGalaxyId] = useState<string | null>(null);
  const hasBootstrappedRef = useRef(false);
  const isEmbedded = searchParams.get("embed") === "1";
  const isAdmin = user?.role === "Admin";
  const isSupporter = Boolean(user?.isSupporter);
  const canCreateGalaxy = isAdmin || isSupporter || galaxies.length < 3;

  useEffect(() => {
    if (!isEmbedded) return;
    document.documentElement.style.setProperty("--app-shell-max-width", "100vw");
    document.documentElement.style.setProperty("--app-shell-side-pad", "0px");
    document.documentElement.style.setProperty("--app-shell-top-pad", "0px");
    document.documentElement.style.setProperty("--app-footer-offset", "0px");
    return () => {
      document.documentElement.style.removeProperty("--app-shell-max-width");
      document.documentElement.style.removeProperty("--app-shell-side-pad");
      document.documentElement.style.removeProperty("--app-shell-top-pad");
      document.documentElement.style.removeProperty("--app-footer-offset");
    };
  }, [isEmbedded]);

  useEffect(() => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;

    const bootstrap = async () => {
      try {
        if (!isAuthenticated) {
          await loadMe();
        }
        const currentUserId = user?.id ?? useAuthStore.getState().user?.id ?? null;
        const result =
          isAdmin && currentUserId
            ? await loadGalaxiesForOwner(currentUserId)
            : await loadGalaxies();
        if (result.rows.length > 0) {
          const requestedGalaxyId = searchParams.get("galaxyId");
          const initialGalaxyId =
            requestedGalaxyId && result.rows.some((item) => item.id === requestedGalaxyId)
              ? requestedGalaxyId
              : result.rows[0].id;
          await loadGalaxyById(initialGalaxyId);
          await loadGalaxyForRender(initialGalaxyId);
        }
      } catch (error: unknown) {
        if (isHandledSessionExpiryError(error)) {
          return;
        }

        sileo.error({
          title: "Dashboard load failed",
          description: describeApiError(error, "Could not load dashboard data."),
        });
      }
    };
    void bootstrap();
  }, [isAdmin, isAuthenticated, loadGalaxies, loadGalaxiesForOwner, loadGalaxyById, loadGalaxyForRender, loadMe, router, searchParams, user?.id]);

  const onCreateGalaxy = async (payload: {
    name: string;
    shape: Parameters<typeof createGalaxy>[0]["shape"];
    systemCount: number;
  }) => {
    if (!canCreateGalaxy) return;
    const created = await createGalaxy(payload);
    await loadGalaxyById(created.id);
    await loadGalaxyForRender(created.id);
  };

  const onDeleteGalaxy = async (galaxyId: string) => {
    const target = galaxies.find((item) => item.id === galaxyId);
    if (!target) return;

    const accepted = window.confirm(
      `Delete galaxy "${target.name}"? This action cannot be undone.`,
    );
    if (!accepted) return;

    try {
      setDeletingGalaxyId(galaxyId);
      await deleteGalaxy(galaxyId);

      const remaining = galaxies.filter((item) => item.id !== galaxyId);
      const next = remaining[0] ?? null;

      if (next) {
        await loadGalaxyById(next.id);
        await loadGalaxyForRender(next.id);
      } else {
        useRenderStore.getState().resetRender();
      }

      sileo.success({
        title: "Galaxy deleted",
        description: `"${target.name}" was removed successfully.`,
      });
    } catch (error: unknown) {
      if (isHandledSessionExpiryError(error)) {
        return;
      }
      sileo.error({
        title: "Delete failed",
        description: describeApiError(error, "Could not delete galaxy."),
      });
    } finally {
      setDeletingGalaxyId(null);
    }
  };

  if (isEmbedded) {
    return (
      <section className={styles.renderStage} style={{ minHeight: "calc(100vh - 40px)" }}>
        <button
          type="button"
          className={styles.fullViewFloating}
          onClick={() => {
            if (window.top && window.top !== window) {
              window.top.postMessage({ type: "simulactic:close-embedded-view" }, "*");
            } else {
              router.push("/admin");
            }
          }}
        >
          Close
        </button>
        <MockCanvasPanel
          selectedGalaxy={selectedGalaxy}
          hasGalaxies={galaxies.length > 0}
          isLoading={isLoading}
          isRenderReady={Boolean(selectedGalaxy)}
          machineState={machineState}
          galaxyData={serializedGalaxyData}
          systemData={serializedSystemData}
          onWheelZoom={onWheelZoom}
          loadingSystemName={pendingSystemName}
        />
      </section>
    );
  }

  return (
    <>
      <section className={styles.dashboardGrid}>
        <GalaxyListPanel
          currentUsername={user?.username ?? null}
          galaxies={galaxies}
          selectedGalaxyId={selectedGalaxy?.id ?? null}
          onSelectGalaxy={(galaxyId) => {
            void loadGalaxyById(galaxyId);
            void loadGalaxyForRender(galaxyId);
          }}
          onDeleteGalaxy={(galaxyId) => {
            void onDeleteGalaxy(galaxyId);
          }}
          deletingGalaxyId={deletingGalaxyId}
          onCreateClick={() => setShowCreateModal(true)}
          canCreateGalaxy={canCreateGalaxy}
          isSupporter={isSupporter}
        />

        <MockCanvasPanel
          selectedGalaxy={selectedGalaxy}
          hasGalaxies={galaxies.length > 0}
          isLoading={isLoading}
          isRenderReady={Boolean(selectedGalaxy)}
          machineState={machineState}
          galaxyData={serializedGalaxyData}
          systemData={serializedSystemData}
          onWheelZoom={onWheelZoom}
          loadingSystemName={pendingSystemName}
        />
      </section>

      <CreateGalaxyModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={onCreateGalaxy}
        disabled={!canCreateGalaxy}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<section className={styles.renderStage} style={{ minHeight: "60vh" }} />}>
      <DashboardPageContent />
    </Suspense>
  );
}
