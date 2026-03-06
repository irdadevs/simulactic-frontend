import { GalaxyProps } from "../../../../types/galaxy.types";
import layoutStyles from "../../../../styles/layout.module.css";
import commonStyles from "../../../../styles/skeleton.module.css";
import { ActionButton } from "../../buttons/ActionButton";

type GalaxyListPanelProps = {
  currentUsername?: string | null;
  galaxies: GalaxyProps[];
  selectedGalaxyId: string | null;
  onSelectGalaxy: (galaxyId: string) => void;
  onCreateClick: () => void;
  canCreateGalaxy: boolean;
  isSupporter: boolean;
  error?: string | null;
};

export function GalaxyListPanel({
  currentUsername,
  galaxies,
  selectedGalaxyId,
  onSelectGalaxy,
  onCreateClick,
  canCreateGalaxy,
  isSupporter,
  error,
}: GalaxyListPanelProps) {
  return (
    <aside className={layoutStyles.panel}>
      <header className={layoutStyles.panelHeader}>
        <div>
          <p className={commonStyles.meta} style={{ marginBottom: 6 }}>
            {currentUsername ? `Logged as ${currentUsername}` : "Logged user"}
          </p>
          <h2 className={commonStyles.panelTitle}>Your Galaxies</h2>
          <p className={commonStyles.meta}>{`${galaxies.length} galaxies`}</p>
        </div>
        <ActionButton variant="secondary" onClick={onCreateClick} disabled={!canCreateGalaxy}>
          Create
        </ActionButton>
      </header>

      {!canCreateGalaxy && !isSupporter && (
        <p className={commonStyles.error} style={{ margin: 14 }}>
          Non-supporters can create up to 3 galaxies.
        </p>
      )}
      {error && (
        <p className={commonStyles.error} style={{ margin: 14 }}>
          {error}
        </p>
      )}

      <div className={layoutStyles.list}>
        {galaxies.map((galaxy) => (
          <button
            key={galaxy.id}
            className={`${layoutStyles.listItem} ${
              selectedGalaxyId === galaxy.id ? layoutStyles.listItemActive : ""
            }`}
            onClick={() => onSelectGalaxy(galaxy.id)}
          >
            <strong>{galaxy.name}</strong>
            <p className={commonStyles.meta}>
              {galaxy.shape} | {galaxy.systemCount} systems
            </p>
          </button>
        ))}
        {galaxies.length === 0 && (
          <p className={commonStyles.meta} style={{ padding: 14 }}>
            No galaxies yet. Create your first one.
          </p>
        )}
      </div>
    </aside>
  );
}
