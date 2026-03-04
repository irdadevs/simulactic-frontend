import { MoonProps } from "../../types/moon.types";
import { PlanetProps } from "../../types/planet.types";
import styles from "../../styles/skeleton.module.css";
import { ActionButton } from "../components/buttons/ActionButton";

type PlanetPopupProps = {
  planet: PlanetProps;
  moons: MoonProps[];
  onClose: () => void;
};

const formatKey = (key: string): string =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());

const formatValue = (value: unknown): string => {
  if (value == null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const hiddenInfoKeys = new Set(["id", "systemId", "planetId", "galaxyId", "orbitalStarter"]);

export function PlanetPopup({ planet, moons, onClose }: PlanetPopupProps) {
  const detail = {
    ...planet,
    moonCount: moons.length,
  };

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
        {Object.entries(detail)
          .filter(([key]) => !hiddenInfoKeys.has(key))
          .map(([key, value]) => (
          <p key={key} className={styles.meta}>
            {formatKey(key)}: <strong>{formatValue(value)}</strong>
          </p>
        ))}
      </div>
    </section>
  );
}
