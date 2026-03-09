import { MoonProps } from "../../types/moon.types";
import { moonDetailItems } from "../../lib/format/celestialDetails";
import popupStyles from "../../styles/popup.module.css";
import commonStyles from "../../styles/skeleton.module.css";
import { ActionButton } from "../components/buttons/ActionButton";

type MoonPopupProps = {
  moon: MoonProps;
  onGoToMoon: () => void;
  onClose: () => void;
};

export function MoonPopup({ moon, onGoToMoon, onClose }: MoonPopupProps) {
  const detail = moonDetailItems(moon);

  return (
    <section className={`${popupStyles.popupCard} ${popupStyles.popupCardRich}`}>
      <header className={popupStyles.popupHeader}>
        <div>
          <p className={popupStyles.popupEyebrow}>Moon</p>
          <h3 className={popupStyles.popupTitle}>{moon.name}</h3>
          <p className={commonStyles.meta}>Moon</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <ActionButton variant="secondary" onClick={onGoToMoon}>
            Go to
          </ActionButton>
          <ActionButton variant="secondary" onClick={onClose}>
            Close
          </ActionButton>
        </div>
      </header>

      <div className={popupStyles.popupBody}>
        {detail.map((item) => (
          <p key={item.label} className={commonStyles.meta}>
            {item.label}: <strong>{item.value}</strong>
          </p>
        ))}
      </div>
    </section>
  );
}
