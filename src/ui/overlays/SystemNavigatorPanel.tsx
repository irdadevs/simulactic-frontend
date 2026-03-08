"use client";

import { useMemo, useState } from "react";
import {
  asteroidDetailItems,
  moonDetailItems,
  planetDetailItems,
  starDetailItems,
} from "../../lib/format/celestialDetails";
import { useRenderStore } from "../../state/render.store";
import { useUiStore } from "../../state/ui.store";
import commonStyles from "../../styles/skeleton.module.css";
import { ActionButton } from "../components/buttons/ActionButton";
import styles from "../../styles/popup.module.css";

type NavigatorRow = {
  key: string;
  name: string;
  type: "Star" | "Planet" | "Moon" | "Asteroid";
  target: { kind: "star" | "planet" | "moon" | "asteroid"; id: string };
  details: Array<{ label: string; value: string }>;
};

export function SystemNavigatorPanel() {
  const viewMode = useRenderStore((state) => state.viewMode);
  const systemDetail = useRenderStore((state) => state.systemDetail);
  const requestGalaxyTransition = useRenderStore((state) => state.requestGalaxyTransition);
  const navigateToSystemTarget = useUiStore((state) => state.navigateToSystemTarget);
  const [selectedInfo, setSelectedInfo] = useState<NavigatorRow | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const rows: NavigatorRow[] = useMemo(() => {
    if (!systemDetail) return [];
    return [
      ...systemDetail.stars.map((star) => ({
        key: `star:${star.id}`,
        name: star.name,
        type: "Star" as const,
        target: { kind: "star" as const, id: star.id },
        details: starDetailItems(star),
      })),
      ...systemDetail.planets.map((entry) => ({
        key: `planet:${entry.planet.id}`,
        name: entry.planet.name,
        type: "Planet" as const,
        target: { kind: "planet" as const, id: entry.planet.id },
        details: planetDetailItems(entry.planet, entry.moons.length),
      })),
      ...systemDetail.planets.flatMap((entry) =>
        entry.moons.map((moon) => ({
          key: `moon:${moon.id}`,
          name: moon.name,
          type: "Moon" as const,
          target: { kind: "moon" as const, id: moon.id },
          details: moonDetailItems(moon),
        })),
      ),
      ...systemDetail.asteroids.map((asteroid) => ({
        key: `asteroid:${asteroid.id}`,
        name: asteroid.name,
        type: "Asteroid" as const,
        target: { kind: "asteroid" as const, id: asteroid.id },
        details: asteroidDetailItems(asteroid),
      })),
    ];
  }, [systemDetail]);

  if (viewMode !== "system" || !systemDetail) {
    return null;
  }

  return (
    <>
      <aside className={styles.systemNavigator}>
        <header className={styles.popupHeader}>
          <div>
            <p className={styles.popupEyebrow}>Navigator</p>
            <h3 className={styles.popupTitle}>{systemDetail.system.name} Elements</h3>
          </div>
          <div className={styles.systemNavigatorHeaderActions}>
            <ActionButton
              variant="secondary"
              onClick={() => {
                setSelectedInfo(null);
                requestGalaxyTransition("user_back_to_galaxy");
              }}
            >
              Go back
            </ActionButton>
            <ActionButton
              variant="secondary"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {isExpanded ? "Close details" : "View more"}
            </ActionButton>
          </div>
        </header>
        {isExpanded && (
          <div className={styles.systemNavigatorList}>
            {rows.map((row) => (
              <div key={row.key} className={styles.popupRow}>
                <div>
                  <p className={styles.popupItemTitle}>{row.name}</p>
                  <p className={commonStyles.meta}>{row.type}</p>
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
        )}
      </aside>

      {isExpanded && selectedInfo && (
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
            {selectedInfo.details.map((item) => (
              <p key={item.label} className={commonStyles.meta}>
                {item.label}: <strong>{item.value}</strong>
              </p>
            ))}
          </div>
        </aside>
      )}
    </>
  );
}
