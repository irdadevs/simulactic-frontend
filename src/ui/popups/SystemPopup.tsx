"use client";

import { ActionButton } from "../components/buttons/ActionButton";
import { PlanetProps } from "../../types/planet.types";
import { StarProps } from "../../types/star.types";
import { SystemProps } from "../../types/system.types";
import styles from "../../styles/skeleton.module.css";

type SystemPopupProps = {
  system: SystemProps;
  stars: StarProps[];
  planets: PlanetProps[];
  onGoToSystem: () => void;
  onClose: () => void;
};

export function SystemPopup(props: SystemPopupProps) {
  const starClasses = Array.from(new Set(props.stars.map((star) => star.starClass))).join(", ");
  const starTypes = Array.from(new Set(props.stars.map((star) => star.starType))).join(", ");

  return (
    <section className={`${styles.popupCard} ${styles.popupCardRich}`}>
      <header className={styles.popupHeader}>
        <div>
          <p className={styles.popupEyebrow}>System</p>
          <h3 className={styles.popupTitle}>{props.system.name}</h3>
        </div>
        <ActionButton variant="secondary" onClick={props.onClose}>
          Close
        </ActionButton>
      </header>

      <div className={styles.popupBody}>
        <p className={styles.meta}>
          Stars: <strong>{props.stars.length}</strong>
        </p>
        <p className={styles.meta}>
          Classes: <strong>{starClasses || "Unknown"}</strong>
        </p>
        <p className={styles.meta}>
          Types: <strong>{starTypes || "Unknown"}</strong>
        </p>
        <p className={styles.meta}>
          Planets: <strong>{props.planets.length}</strong>
        </p>
        <ActionButton onClick={props.onGoToSystem}>Go to</ActionButton>
      </div>
    </section>
  );
}
