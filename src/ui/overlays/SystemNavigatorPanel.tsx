"use client";

import { useRenderStore } from "../../state/render.store";
import { useUiStore } from "../../state/ui.store";
import { ActionButton } from "../components/buttons/ActionButton";
import styles from "../../styles/skeleton.module.css";

type NavigatorRow = {
  key: string;
  name: string;
  type: "Star" | "Planet" | "Moon" | "Asteroid";
  target: { kind: "star" | "planet" | "moon" | "asteroid"; id: string };
};

export function SystemNavigatorPanel() {
  const viewMode = useRenderStore((state) => state.viewMode);
  const systemDetail = useRenderStore((state) => state.systemDetail);
  const navigateToSystemTarget = useUiStore((state) => state.navigateToSystemTarget);

  if (viewMode !== "system" || !systemDetail) {
    return null;
  }

  const rows: NavigatorRow[] = [
    ...systemDetail.stars.map((star) => ({
      key: `star:${star.id}`,
      name: star.name,
      type: "Star" as const,
      target: { kind: "star" as const, id: star.id },
    })),
    ...systemDetail.planets.map((entry) => ({
      key: `planet:${entry.planet.id}`,
      name: entry.planet.name,
      type: "Planet" as const,
      target: { kind: "planet" as const, id: entry.planet.id },
    })),
    ...systemDetail.planets.flatMap((entry) =>
      entry.moons.map((moon) => ({
        key: `moon:${moon.id}`,
        name: moon.name,
        type: "Moon" as const,
        target: { kind: "moon" as const, id: moon.id },
      })),
    ),
    ...systemDetail.asteroids.map((asteroid) => ({
      key: `asteroid:${asteroid.id}`,
      name: asteroid.name,
      type: "Asteroid" as const,
      target: { kind: "asteroid" as const, id: asteroid.id },
    })),
  ];

  return (
    <aside className={styles.systemNavigator}>
      <p className={styles.popupEyebrow}>Navigator</p>
      <h3 className={styles.popupTitle}>System Elements</h3>
      <div className={styles.systemNavigatorList}>
        {rows.map((row) => (
          <div key={row.key} className={styles.popupRow}>
            <div>
              <p className={styles.popupItemTitle}>{row.name}</p>
              <p className={styles.meta}>{row.type}</p>
            </div>
            <ActionButton
              variant="secondary"
              onClick={() => navigateToSystemTarget?.(row.target)}
            >
              Go to
            </ActionButton>
          </div>
        ))}
      </div>
    </aside>
  );
}
