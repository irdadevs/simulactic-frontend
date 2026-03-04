"use client";

import { useMemo, useState } from "react";
import { useRenderStore } from "../../state/render.store";
import { useUiStore } from "../../state/ui.store";
import { ActionButton } from "../components/buttons/ActionButton";
import styles from "../../styles/skeleton.module.css";

type NavigatorRow = {
  key: string;
  name: string;
  type: "Star" | "Planet" | "Moon" | "Asteroid";
  target: { kind: "star" | "planet" | "moon" | "asteroid"; id: string };
  details: Record<string, unknown>;
};

const hiddenInfoKeys = new Set([
  "id",
  "systemId",
  "planetId",
  "galaxyId",
  "orbitalStarter",
]);

const formatKey = (key: string): string =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());

const formatValue = (value: unknown): string => {
  if (value == null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export function SystemNavigatorPanel() {
  const viewMode = useRenderStore((state) => state.viewMode);
  const systemDetail = useRenderStore((state) => state.systemDetail);
  const requestGalaxyTransition = useRenderStore((state) => state.requestGalaxyTransition);
  const navigateToSystemTarget = useUiStore((state) => state.navigateToSystemTarget);
  const [selectedInfo, setSelectedInfo] = useState<NavigatorRow | null>(null);

  if (viewMode !== "system" || !systemDetail) {
    return null;
  }

  const rows: NavigatorRow[] = useMemo(() => [
    ...systemDetail.stars.map((star) => ({
      key: `star:${star.id}`,
      name: star.name,
      type: "Star" as const,
      target: { kind: "star" as const, id: star.id },
      details: star as Record<string, unknown>,
    })),
    ...systemDetail.planets.map((entry) => ({
      key: `planet:${entry.planet.id}`,
      name: entry.planet.name,
      type: "Planet" as const,
      target: { kind: "planet" as const, id: entry.planet.id },
      details: {
        ...entry.planet,
        moonCount: entry.moons.length,
      } as Record<string, unknown>,
    })),
    ...systemDetail.planets.flatMap((entry) =>
      entry.moons.map((moon) => ({
        key: `moon:${moon.id}`,
        name: moon.name,
        type: "Moon" as const,
        target: { kind: "moon" as const, id: moon.id },
        details: moon as Record<string, unknown>,
      })),
    ),
    ...systemDetail.asteroids.map((asteroid) => ({
      key: `asteroid:${asteroid.id}`,
      name: asteroid.name,
      type: "Asteroid" as const,
      target: { kind: "asteroid" as const, id: asteroid.id },
      details: asteroid as Record<string, unknown>,
    })),
  ], [systemDetail]);

  return (
    <>
      <aside className={styles.systemNavigator}>
        <header className={styles.popupHeader}>
          <div>
            <p className={styles.popupEyebrow}>Navigator</p>
            <h3 className={styles.popupTitle}>{systemDetail.system.name} Elements</h3>
          </div>
          <ActionButton
            variant="secondary"
            onClick={() => {
              setSelectedInfo(null);
              requestGalaxyTransition("user_back_to_galaxy");
            }}
          >
            Go back
          </ActionButton>
        </header>
        <div className={styles.systemNavigatorList}>
          {rows.map((row) => (
            <div key={row.key} className={styles.popupRow}>
              <div>
                <p className={styles.popupItemTitle}>{row.name}</p>
                <p className={styles.meta}>{row.type}</p>
              </div>
              <div className={styles.systemNavigatorActions}>
                <ActionButton
                  variant="secondary"
                  onClick={() => setSelectedInfo(row)}
                >
                  +info
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  onClick={() => navigateToSystemTarget?.(row.target)}
                >
                  Go to
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {selectedInfo && (
        <aside className={styles.systemInfoPanel}>
          <header className={styles.popupHeader}>
            <div>
              <p className={styles.popupEyebrow}>{selectedInfo.type}</p>
              <h3 className={styles.popupTitle}>{selectedInfo.name}</h3>
            </div>
            <ActionButton variant="secondary" onClick={() => setSelectedInfo(null)}>
              Close
            </ActionButton>
          </header>
          <div className={styles.popupBody}>
            {Object.entries(selectedInfo.details)
              .filter(([key]) => !hiddenInfoKeys.has(key))
              .map(([key, value]) => (
                <p key={key} className={styles.meta}>
                  {formatKey(key)}: <strong>{formatValue(value)}</strong>
                </p>
              ))}
          </div>
        </aside>
      )}
    </>
  );
}
