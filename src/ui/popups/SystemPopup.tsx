import { PlanetProps } from "../../types/planet.types";
import { StarProps } from "../../types/star.types";
import { SystemProps } from "../../types/system.types";
import styles from "../../styles/skeleton.module.css";
import { ActionButton } from "../components/buttons/ActionButton";

type SystemPopupProps = {
  system: SystemProps;
  stars: StarProps[];
  planets: PlanetProps[];
  onOpenStar: (starId: string) => void;
  onOpenPlanet: (planetId: string) => void;
  onClose: () => void;
};

export function SystemPopup({
  system,
  stars,
  planets,
  onOpenStar,
  onOpenPlanet,
  onClose,
}: SystemPopupProps) {
  return (
    <section className={styles.popupCard}>
      <header className={styles.popupHeader}>
        <div>
          <h3 className={styles.panelTitle}>{system.name}</h3>
          <p className={styles.meta}>System</p>
        </div>
        <ActionButton variant="secondary" onClick={onClose}>
          Close
        </ActionButton>
      </header>

      <div className={styles.popupBody}>
        <p className={styles.meta}>Stars</p>
        <div className={styles.popupList}>
          {stars.map((star) => (
            <button
              key={star.id}
              className={styles.popupItem}
              onClick={() => onOpenStar(star.id)}
              type="button"
            >
              {star.name}
            </button>
          ))}
        </div>

        <p className={styles.meta}>Planets</p>
        <div className={styles.popupList}>
          {planets.map((planet) => (
            <button
              key={planet.id}
              className={styles.popupItem}
              onClick={() => onOpenPlanet(planet.id)}
              type="button"
            >
              {planet.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
