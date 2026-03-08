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
          <h3 className={styles.title}>Sample 3D Galaxy/System Scene</h3>
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

          <div className={styles.orbitRing} />
          <div className={styles.planet} />
          <div className={styles.moon} />
          <div className={styles.asteroid} />
        </div>

        <aside className={styles.popup} aria-live="polite">
          {phase === 0 && <p>System: Helios-7</p>}
          {phase === 1 && <p>Entering system detail...</p>}
          {phase === 2 && <p>Planet: Nereid Prime · 3 moons</p>}
          {phase === 3 && <p>Asteroid cluster detected nearby</p>}
        </aside>

        <div className={styles.hud}>
          <span className={phase === 0 ? styles.hudChipActive : styles.hudChip}>Galaxy</span>
          <span className={phase > 0 ? styles.hudChipActive : styles.hudChip}>System</span>
          <span className={styles.hudChip}>Popups</span>
          <span className={styles.hudChip}>Movement</span>
        </div>
      </div>

      <p className={styles.caption}>{phaseLabel}</p>
    </article>
  );
}
