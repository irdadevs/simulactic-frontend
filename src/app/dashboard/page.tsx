"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../application/hooks/useAuth";
import { useGalaxy } from "../../application/hooks/useGalaxy";
import { CreateGalaxyModal } from "../../ui/components/modals/CreateGalaxyModal";
import { GalaxyListPanel } from "../../ui/components/layout/GalaxyListPanel";
import { MockCanvasPanel } from "../../ui/components/layout/MockCanvasPanel";
import styles from "../../styles/skeleton.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loadMe, logout } = useAuth();
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

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (!isAuthenticated) {
          await loadMe();
        }
        const result = await loadGalaxies();
        if (result.rows.length > 0) {
          await loadGalaxyById(result.rows[0].id);
        }
      } catch {
        router.push("/login");
      }
    };
    void bootstrap();
  }, [isAuthenticated, loadGalaxies, loadGalaxyById, loadMe, router]);

  const galaxyCountLabel = useMemo(() => `${galaxies.length} galaxies`, [galaxies.length]);

  const onCreateGalaxy = async (payload: {
    name: string;
    shape: Parameters<typeof createGalaxy>[0]["shape"];
    systemCount: number;
  }) => {
    try {
      const created = await createGalaxy(payload);
      await loadGalaxyById(created.id);
    } catch {}
  };

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  return (
    <>
      <section className={styles.dashboardGrid}>
        <GalaxyListPanel
          galaxies={galaxies}
          selectedGalaxyId={selectedGalaxy?.id ?? null}
          onSelectGalaxy={(galaxyId) => {
            void loadGalaxyById(galaxyId);
          }}
          onCreateClick={() => setShowCreateModal(true)}
          error={error}
        />

        <MockCanvasPanel
          user={user}
          selectedGalaxy={selectedGalaxy}
          isLoading={isLoading}
          onLogout={() => {
            void onLogout();
          }}
        />
      </section>

      <CreateGalaxyModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={onCreateGalaxy}
      />
    </>
  );
}
