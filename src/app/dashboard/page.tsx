"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../application/hooks/useAuth";
import { useGalaxy } from "../../application/hooks/useGalaxy";
import { useRenderCoordinator } from "../../application/hooks/useRenderCoordinator";
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loadMe } = useAuth();
  const {
    machineState,
    serializedGalaxyData,
    serializedSystemData,
    loadGalaxyForRender,
    onWheelZoom,
  } = useRenderCoordinator();

  const {
    galaxies,
    selectedGalaxy,
    isLoading,
    error,
    loadGalaxies,
    loadGalaxyById,
    createGalaxy,
  } = useGalaxy();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const hasBootstrappedRef = useRef(false);
  const isSupporter = Boolean(user?.isSupporter);
  const canCreateGalaxy = isSupporter || galaxies.length < 3;

  useEffect(() => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;

    const bootstrap = async () => {
      try {
        if (!isAuthenticated) {
          await loadMe();
        }
        const result = await loadGalaxies();
        if (result.rows.length > 0) {
          const initialGalaxyId = result.rows[0].id;
          await loadGalaxyById(initialGalaxyId);
          await loadGalaxyForRender(initialGalaxyId);
        }
      } catch {
        router.push("/login");
      }
    };
    void bootstrap();
  }, [isAuthenticated, loadGalaxies, loadGalaxyById, loadGalaxyForRender, loadMe, router]);

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
          onCreateClick={() => setShowCreateModal(true)}
          canCreateGalaxy={canCreateGalaxy}
          isSupporter={isSupporter}
          error={error}
        />

        <MockCanvasPanel
          selectedGalaxy={selectedGalaxy}
          isLoading={isLoading}
          isRenderReady={Boolean(selectedGalaxy)}
          machineState={machineState}
          galaxyData={serializedGalaxyData}
          systemData={serializedSystemData}
          onWheelZoom={onWheelZoom}
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
