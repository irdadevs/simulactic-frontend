import { MoonProps } from "../../types/moon.types";
import styles from "../../styles/skeleton.module.css";
import { ActionButton } from "../components/buttons/ActionButton";

type MoonPopupProps = {
  moon: MoonProps;
  onBack: () => void;
  onClose: () => void;
};

export function MoonPopup({ moon, onBack, onClose }: MoonPopupProps) {
  return (
    <section className={styles.popupCard}>
      <header className={styles.popupHeader}>
        <div>
          <h3 className={styles.panelTitle}>{moon.name}</h3>
          <p className={styles.meta}>Moon</p>
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
        <p className={styles.meta}>Size: {moon.size}</p>
        <p className={styles.meta}>Orbital: {moon.orbital}</p>
        <p className={styles.meta}>Temperature: {moon.temperature}</p>
      </div>
    </section>
  );
}
