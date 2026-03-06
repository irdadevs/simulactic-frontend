"use client";

import { usePopupController } from "../../application/hooks/usePopupController";
import {
  asteroidDetailItems,
  starDetailItems,
} from "../../lib/format/celestialDetails";
import { useRenderStore } from "../../state/render.store";
import { useUiStore } from "../../state/ui.store";
import styles from "../../styles/skeleton.module.css";
import { MoonPopup } from "./MoonPopup";
import { PlanetPopup } from "./PlanetPopup";
import { SystemPopup } from "./SystemPopup";

export function PopupLayer() {
  const { popup } = usePopupController();
  const requestSystemTransition = useRenderStore((state) => state.requestSystemTransition);
  const popupLoading = useUiStore((state) => state.popupLoading);
  const popupAnchor = useUiStore((state) => state.popupAnchor);
  const setPopup = useUiStore((state) => state.setPopup);

  if (!popup && !popupLoading) return null;

  const popupStyle = popupAnchor
    ? {
        left: popupAnchor.x,
        top: popupAnchor.y,
      }
    : undefined;

  return (
    <div className={styles.popupLayer}>
      {popupLoading && (
        <div className={styles.popupLoader} style={popupStyle} aria-label="Preparing popup">
          <span className={styles.popupLoaderSpinner} />
        </div>
      )}

      {popup?.kind === "system" && (
        <div className={styles.popupPositioned} style={popupStyle}>
          <SystemPopup
            system={popup.data.system}
            stars={popup.data.stars}
            planets={popup.data.planets.map((entry) => entry.planet)}
            onGoToSystem={() => {
              requestSystemTransition({
                systemId: popup.data.system.id,
                reason: "user_select_system",
              });
              setPopup(null);
            }}
            onClose={() => setPopup(null)}
          />
        </div>
      )}

      {popup?.kind === "planet" && (
        <div className={styles.popupPositioned} style={popupStyle}>
          <PlanetPopup
            planet={popup.data.planet}
            moons={popup.data.moons}
            onClose={() => setPopup(null)}
          />
        </div>
      )}

      {popup?.kind === "moon" && (
        <div className={styles.popupPositioned} style={popupStyle}>
          <MoonPopup moon={popup.data} onClose={() => setPopup(null)} />
        </div>
      )}

      {popup?.kind === "star" && (
        <div className={styles.popupPositioned} style={popupStyle}>
          <section className={`${styles.popupCard} ${styles.popupCardRich}`}>
            <header className={styles.popupHeader}>
              <div>
                <p className={styles.popupEyebrow}>Star</p>
                <h3 className={styles.popupTitle}>{popup.data.name}</h3>
              </div>
            </header>
            <div className={styles.popupBody}>
              {starDetailItems(popup.data).map((item) => (
                <p key={item.label} className={styles.meta}>
                  {item.label}: <strong>{item.value}</strong>
                </p>
              ))}
            </div>
          </section>
        </div>
      )}

      {popup?.kind === "asteroid" && (
        <div className={styles.popupPositioned} style={popupStyle}>
          <section className={`${styles.popupCard} ${styles.popupCardRich}`}>
            <header className={styles.popupHeader}>
              <div>
                <p className={styles.popupEyebrow}>Asteroid</p>
                <h3 className={styles.popupTitle}>{popup.data.name}</h3>
              </div>
            </header>
            <div className={styles.popupBody}>
              {asteroidDetailItems(popup.data).map((item) => (
                <p key={item.label} className={styles.meta}>
                  {item.label}: <strong>{item.value}</strong>
                </p>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
