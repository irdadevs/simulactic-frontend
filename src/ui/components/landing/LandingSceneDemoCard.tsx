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
        <div className={styles.starLayerFar} />
        <div className={styles.starLayerNear} />

        <div className={`${styles.camera} ${styles[`phase${phase}`]}`}>
          <div className={styles.systemA} />
          <div className={styles.systemB} />
          <div className={styles.systemC} />
          <div className={styles.systemD} />

          <div className={styles.systemCore}>
            <div className={styles.focusStar} />
            <div className={`${styles.orbitRing} ${styles.orbitPlanet}`} />
            <div className={`${styles.orbitRing} ${styles.orbitMoon}`} />
            <div className={`${styles.orbitRing} ${styles.orbitAsteroid}`} />

            <div className={`${styles.orbiter} ${styles.planetOrbit}`}>
              <span className={styles.planet} />
            </div>
            <div className={`${styles.orbiter} ${styles.moonOrbit}`}>
              <span className={styles.moon} />
            </div>
            <div className={`${styles.orbiter} ${styles.asteroidOrbit}`}>
              <span className={styles.asteroid} />
            </div>
          </div>
        </div>

        <aside className={styles.popup} aria-live="polite">
          {phase === 0 && <p>System: Helios-7</p>}
          {phase === 1 && <p>Entering system detail...</p>}
          {phase === 2 && (
            <section className={styles.popupCard}>
              <p className={styles.popupLabel}>Planet</p>
              <h4 className={styles.popupTitle}>Nereid Prime</h4>
              <p>Biome: Oceanic Temperate</p>
              <p>Radius: 1.08 Earth</p>
              <p>Mass: 1.14 Earth</p>
              <p>Moons: 3</p>
              <p>Orbital: 142.6 M km</p>
            </section>
          )}
          {phase === 3 && (
            <section className={styles.popupCard}>
              <p className={styles.popupLabel}>Asteroid Cluster</p>
              <h4 className={styles.popupTitle}>Rho Belt</h4>
              <p>Type: Cluster</p>
              <p>Orbital Radius: 188.2 M km</p>
              <p>Density: Medium</p>
            </section>
          )}
        </aside>

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
