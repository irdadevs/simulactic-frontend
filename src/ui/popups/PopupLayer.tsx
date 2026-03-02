"use client";

import { usePopupController } from "../../application/hooks/usePopupController";
import { useUiStore } from "../../state/ui.store";
import styles from "../../styles/skeleton.module.css";
import { MoonPopup } from "./MoonPopup";
import { PlanetPopup } from "./PlanetPopup";
import { SystemPopup } from "./SystemPopup";

export function PopupLayer() {
  const { popup } = usePopupController();

  const openSystemPopup = useUiStore((state) => state.openSystemPopup);
  const openStarPopup = useUiStore((state) => state.openStarPopup);
  const openPlanetPopup = useUiStore((state) => state.openPlanetPopup);
  const openMoonPopup = useUiStore((state) => state.openMoonPopup);
  const setPopup = useUiStore((state) => state.setPopup);

  if (!popup) return null;

  return (
    <div className={styles.popupLayer}>
      {popup.kind === "system" && (
        <SystemPopup
          system={popup.data.system}
          stars={popup.data.stars}
          planets={popup.data.planets.map((entry) => entry.planet)}
          onOpenStar={(starId) => openStarPopup({ systemId: popup.data.system.id, starId })}
          onOpenPlanet={(planetId) => openPlanetPopup(planetId)}
          onClose={() => setPopup(null)}
        />
      )}

      {popup.kind === "planet" && (
        <PlanetPopup
          planet={popup.data.planet}
          moons={popup.data.moons}
          onOpenMoon={(moonId) => openMoonPopup(moonId)}
          onBack={() => openSystemPopup(popup.data.planet.systemId)}
          onClose={() => setPopup(null)}
        />
      )}

      {popup.kind === "moon" && (
        <MoonPopup
          moon={popup.data}
          onBack={() => openPlanetPopup(popup.data.planetId)}
          onClose={() => setPopup(null)}
        />
      )}

      {popup.kind === "star" && (
        <section className={styles.popupCard}>
          <h3 className={styles.panelTitle}>{popup.data.name}</h3>
          <p className={styles.meta}>Star</p>
        </section>
      )}

      {popup.kind === "asteroid" && (
        <section className={styles.popupCard}>
          <h3 className={styles.panelTitle}>{popup.data.name}</h3>
          <p className={styles.meta}>Asteroid</p>
        </section>
      )}
    </div>
  );
}
