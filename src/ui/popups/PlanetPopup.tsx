import { MoonProps } from "../../types/moon.types";
import { PlanetProps } from "../../types/planet.types";
import { planetDetailItems } from "../../lib/format/celestialDetails";
import styles from "../../styles/skeleton.module.css";
import { ActionButton } from "../components/buttons/ActionButton";

type PlanetPopupProps = {
  planet: PlanetProps;
  moons: MoonProps[];
  onClose: () => void;
};

export function PlanetPopup({ planet, moons, onClose }: PlanetPopupProps) {
  const detail = planetDetailItems(planet, moons.length);

  return (
    <section className={`${styles.popupCard} ${styles.popupCardRich}`}>
      <header className={styles.popupHeader}>
        <div>
          <p className={styles.popupEyebrow}>Planet</p>
          <h3 className={styles.popupTitle}>{planet.name}</h3>
          <p className={styles.meta}>Planet</p>
        </div>
        <ActionButton variant="secondary" onClick={onClose}>
          Close
        </ActionButton>
      </header>

      <div className={styles.popupBody}>
        {detail.map((item) => (
          <p key={item.label} className={styles.meta}>
            {item.label}: <strong>{item.value}</strong>
          </p>
        ))}
      </div>
    </section>
  );
}
