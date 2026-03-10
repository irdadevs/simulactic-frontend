"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../../../styles/landing-scene-demo.module.css";

const LOOP_MS = 2400;

const phaseText = [
  "Galaxy view: scanning systems",
  "Zooming into one system",
  "Inspecting objects with popup details",
  "Panning and moving through nearby objects",
];

export function LandingSceneDemoCard() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhase((prev) => (prev + 1) % 4);
    }, LOOP_MS);
    return () => window.clearInterval(timer);
  }, []);

  const phaseLabel = useMemo(() => phaseText[phase], [phase]);

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Auto Loop Preview</p>
          <h3 className={styles.title}>Sample 3D Galaxy/System Scenes</h3>
        </div>
        <span className={styles.livePill}>Live demo</span>
      </header>

      <div className={styles.viewport} data-phase={phase}>
        <div className={styles.nebulaBackdrop} />
        <div className={styles.starLayerFar} />
        <div className={styles.starLayerNear} />
        <div className={styles.gridGlow} />

        <div className={`${styles.camera} ${styles[`phase${phase}`]}`}>
          <div className={`${styles.systemNode} ${styles.systemA}`}>
            <span className={styles.systemHalo} />
            <span className={styles.systemDot} />
          </div>
          <div className={`${styles.systemNode} ${styles.systemB}`}>
            <span className={styles.systemHalo} />
            <span className={styles.systemDot} />
          </div>
          <div className={`${styles.systemNode} ${styles.systemC}`}>
            <span className={styles.systemHalo} />
            <span className={styles.systemDot} />
          </div>
          <div className={`${styles.systemNode} ${styles.systemD}`}>
            <span className={styles.systemHalo} />
            <span className={styles.systemDot} />
          </div>
          <div className={`${styles.systemLabel} ${styles.labelA}`}>Helios-7</div>
          <div className={`${styles.systemLabel} ${styles.labelB}`}>Ione Drift</div>
          <div className={`${styles.systemLabel} ${styles.labelC}`}>Nox Array</div>
          <div className={`${styles.systemLabel} ${styles.labelD}`}>Tauri Fold</div>

          <div className={styles.systemCore}>
            <div className={styles.focusStarAura} />
            <div className={styles.focusStarCorona} />
            <div className={styles.focusStar} />
            <div className={`${styles.orbitRing} ${styles.orbitPlanet}`} />
            <div className={`${styles.orbitRing} ${styles.orbitPlanetOuter}`} />
            <div className={`${styles.orbitRing} ${styles.orbitAsteroid}`} />
            <div className={`${styles.orbitRing} ${styles.orbitMoon}`} />

            <div className={`${styles.orbiter} ${styles.planetOrbit}`}>
              <span className={`${styles.planet} ${styles.planetOceanic}`} />
            </div>
            <div className={`${styles.orbiter} ${styles.outerPlanetOrbit}`}>
              <span className={`${styles.planet} ${styles.planetVolcanic}`} />
            </div>
            <div className={`${styles.orbiter} ${styles.moonCarrierOrbit}`}>
              <span className={styles.moonAnchor}>
                <span className={`${styles.orbitRing} ${styles.localMoonOrbit}`} />
                <span className={`${styles.orbiter} ${styles.moonOrbit}`}>
                  <span className={styles.moon} />
                </span>
              </span>
            </div>
            <div className={`${styles.orbiter} ${styles.asteroidOrbit}`}>
              <span className={styles.asteroidCluster}>
                <span className={`${styles.asteroid} ${styles.asteroidA}`} />
                <span className={`${styles.asteroid} ${styles.asteroidB}`} />
                <span className={`${styles.asteroid} ${styles.asteroidC}`} />
              </span>
            </div>
          </div>
        </div>

        <aside className={styles.popup} aria-live="polite">
          {phase === 0 && (
            <section className={styles.popupCard}>
              <p className={styles.popupLabel}>System</p>
              <h4 className={styles.popupTitle}>Helios-7</h4>
              <p>Main star: Yellow dwarf</p>
              <p>Planets: 4</p>
              <p>Moons: 6</p>
              <p>Asteroids: 1 belt</p>
            </section>
          )}
          {phase === 1 && (
            <section className={styles.popupCard}>
              <p className={styles.popupLabel}>Transition</p>
              <h4 className={styles.popupTitle}>Entering system detail</h4>
              <p>Galaxy scene unmounting</p>
              <p>System scene mounting</p>
              <p>Navigation target locked</p>
            </section>
          )}
          {phase === 2 && (
            <section className={styles.popupCard}>
              <p className={styles.popupLabel}>Planet</p>
              <h4 className={styles.popupTitle}>Nereid Prime</h4>
              <p>Biome: Archipelago</p>
              <p>Radius: 1.08 Earth</p>
              <p>Mass: 1.14 Earth</p>
              <p>Moons: 3</p>
              <p>Temp: 289 K</p>
            </section>
          )}
          {phase === 3 && (
            <section className={styles.popupCard}>
              <p className={styles.popupLabel}>Moon</p>
              <h4 className={styles.popupTitle}>Cinder Veil</h4>
              <p>Size: Medium</p>
              <p>Radius: 0.42 Moon</p>
              <p>Gravity: 0.88 m/s²</p>
              <p>Temp: 211 K</p>
            </section>
          )}
        </aside>

        <div className={styles.statusRail}>
          <span className={styles.statusLine}>Mode: {phase === 0 ? "Galaxy" : "System detail"}</span>
          <span className={styles.statusLine}>Target: Helios-7</span>
          <span className={styles.statusLine}>Objects: 1 star, 2 planets, 1 moon, 1 belt</span>
        </div>

        <div className={styles.hud}>
          <span className={phase === 0 ? styles.hudChipActive : styles.hudChip}>Galaxy</span>
          <span className={phase > 0 ? styles.hudChipActive : styles.hudChip}>System</span>
          <span className={phase >= 2 ? styles.hudChipActive : styles.hudChip}>Popups</span>
          <span className={phase === 3 ? styles.hudChipActive : styles.hudChip}>Movement</span>
        </div>
      </div>

      <p className={styles.caption}>{phaseLabel}</p>
    </article>
  );
}
