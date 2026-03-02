import { GalaxyProps } from "../../../types/galaxy.types";
import styles from "../../../styles/skeleton.module.css";
import { ActionButton } from "../buttons/ActionButton";

type GalaxyListPanelProps = {
  galaxies: GalaxyProps[];
  selectedGalaxyId: string | null;
  onSelectGalaxy: (galaxyId: string) => void;
  onCreateClick: () => void;
  error?: string | null;
};

export function GalaxyListPanel({
  galaxies,
  selectedGalaxyId,
  onSelectGalaxy,
  onCreateClick,
  error,
}: GalaxyListPanelProps) {
  return (
    <aside className={styles.panel}>
      <header className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Your Galaxies</h2>
          <p className={styles.meta}>{`${galaxies.length} galaxies`}</p>
        </div>
        <ActionButton variant="secondary" onClick={onCreateClick}>
          Create
        </ActionButton>
      </header>

      {error && <p className={styles.error} style={{ margin: 14 }}>{error}</p>}

      <div className={styles.list}>
        {galaxies.map((galaxy) => (
          <button
            key={galaxy.id}
            className={`${styles.listItem} ${
              selectedGalaxyId === galaxy.id ? styles.listItemActive : ""
            }`}
            onClick={() => onSelectGalaxy(galaxy.id)}
          >
            <strong>{galaxy.name}</strong>
            <p className={styles.meta}>
              {galaxy.shape} • {galaxy.systemCount} systems
            </p>
          </button>
        ))}
        {galaxies.length === 0 && (
          <p className={styles.meta} style={{ padding: 14 }}>
            No galaxies yet. Create your first one.
          </p>
        )}
      </div>
    </aside>
  );
}
