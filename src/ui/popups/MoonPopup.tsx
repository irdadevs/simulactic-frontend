import { MoonProps } from "../../types/moon.types";
import styles from "../../styles/skeleton.module.css";
import { ActionButton } from "../components/buttons/ActionButton";

type MoonPopupProps = {
  moon: MoonProps;
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

export function MoonPopup({ moon, onClose }: MoonPopupProps) {
  return (
    <section className={`${styles.popupCard} ${styles.popupCardRich}`}>
      <header className={styles.popupHeader}>
        <div>
          <p className={styles.popupEyebrow}>Moon</p>
          <h3 className={styles.popupTitle}>{moon.name}</h3>
          <p className={styles.meta}>Moon</p>
        </div>
        <ActionButton variant="secondary" onClick={onClose}>
          Close
        </ActionButton>
      </header>

      <div className={styles.popupBody}>
        {Object.entries(moon)
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
