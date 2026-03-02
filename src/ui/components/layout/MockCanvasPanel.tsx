import { UserProps } from "../../../types/user.types";
import { GalaxyProps } from "../../../types/galaxy.types";
import styles from "../../../styles/skeleton.module.css";
import { ActionButton } from "../buttons/ActionButton";

type MockCanvasPanelProps = {
  user: UserProps | null;
  selectedGalaxy: GalaxyProps | null;
  isLoading: boolean;
  onLogout: () => void;
};

export function MockCanvasPanel({
  user,
  selectedGalaxy,
  isLoading,
  onLogout,
}: MockCanvasPanelProps) {
  return (
    <section className={styles.panel}>
      <header className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Dashboard</h2>
          <p className={styles.meta}>
            {user ? `Logged as ${user.username}` : "Loading user..."}
          </p>
        </div>
        <ActionButton variant="secondary" onClick={onLogout}>
          Logout
        </ActionButton>
      </header>

      <div className={styles.placeholder}>
        <div>
          <h3 style={{ color: "var(--main-ivory)", marginBottom: 8 }}>Mock Canvas Placeholder</h3>
          <p>
            {selectedGalaxy
              ? `Selected galaxy: ${selectedGalaxy.name} (${selectedGalaxy.shape})`
              : "Select a galaxy from the list."}
          </p>
          <p className={styles.meta} style={{ marginTop: 8 }}>
            3D scene intentionally disabled in this phase.
          </p>
          {isLoading && <p className={styles.meta} style={{ marginTop: 8 }}>Syncing data...</p>}
        </div>
      </div>
    </section>
  );
}
