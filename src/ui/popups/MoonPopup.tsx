import { MoonProps } from "../../types/moon.types";
import { moonDetailItems } from "../../lib/format/celestialDetails";
import styles from "../../styles/skeleton.module.css";
import { ActionButton } from "../components/buttons/ActionButton";

type MoonPopupProps = {
  moon: MoonProps;
  onClose: () => void;
};

export function MoonPopup({ moon, onClose }: MoonPopupProps) {
  const detail = moonDetailItems(moon);

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
        {detail.map((item) => (
          <p key={item.label} className={styles.meta}>
            {item.label}: <strong>{item.value}</strong>
          </p>
        ))}
      </div>
    </section>
  );
}
