import { MoonProps } from "../../types/moon.types";
import { PlanetProps } from "../../types/planet.types";
import { planetDetailItems } from "../../lib/format/celestialDetails";
import popupStyles from "../../styles/popup.module.css";
import commonStyles from "../../styles/skeleton.module.css";
import { ActionButton } from "../components/buttons/ActionButton";

type PlanetPopupProps = {
  planet: PlanetProps;
  moons: MoonProps[];
  onClose: () => void;
};

export function PlanetPopup({ planet, moons, onClose }: PlanetPopupProps) {
  const detail = planetDetailItems(planet, moons.length);

  return (
    <section className={`${popupStyles.popupCard} ${popupStyles.popupCardRich}`}>
      <header className={popupStyles.popupHeader}>
        <div>
          <p className={popupStyles.popupEyebrow}>Planet</p>
          <h3 className={popupStyles.popupTitle}>{planet.name}</h3>
          <p className={commonStyles.meta}>Planet</p>
        </div>
        <ActionButton variant="secondary" onClick={onClose}>
          Close
        </ActionButton>
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
