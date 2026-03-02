import { MoonProps } from "../../types/moon.types";
import { PlanetProps } from "../../types/planet.types";
import styles from "../../styles/skeleton.module.css";
import { ActionButton } from "../components/buttons/ActionButton";

type PlanetPopupProps = {
  planet: PlanetProps;
  moons: MoonProps[];
  onOpenMoon: (moonId: string) => void;
  onBack: () => void;
  onClose: () => void;
};

export function PlanetPopup({ planet, moons, onOpenMoon, onBack, onClose }: PlanetPopupProps) {
  return (
    <section className={styles.popupCard}>
      <header className={styles.popupHeader}>
        <div>
          <h3 className={styles.panelTitle}>{planet.name}</h3>
          <p className={styles.meta}>Planet</p>
        </div>
        <div className={styles.modalActions}>
          <ActionButton variant="secondary" onClick={onBack}>
            Back
          </ActionButton>
          <ActionButton variant="secondary" onClick={onClose}>
            Close
          </ActionButton>
        </div>
      </header>

      <div className={styles.popupBody}>
        <p className={styles.meta}>Moons</p>
        <div className={styles.popupList}>
          {moons.map((moon) => (
            <button
              key={moon.id}
              className={styles.popupItem}
              onClick={() => onOpenMoon(moon.id)}
              type="button"
            >
              {moon.name}
            </button>
          ))}
          {moons.length === 0 && <p className={styles.meta}>No moons in this planet.</p>}
        </div>
      </div>
    </section>
  );
}
