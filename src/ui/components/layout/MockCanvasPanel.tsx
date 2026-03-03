import dynamic from "next/dynamic";
import { useMemo } from "react";
import { SerializedGalaxyViewData, SerializedSystemViewData } from "../../../3d/core/serialized.types";
import { GalaxyProps } from "../../../types/galaxy.types";
import styles from "../../../styles/skeleton.module.css";

const LazyThreeViewport = dynamic(
  () => import("../../overlays/ThreeViewport").then((mod) => mod.ThreeViewport),
  { ssr: false },
);

const LazyPopupLayer = dynamic(
  () => import("../../popups/PopupLayer").then((mod) => mod.PopupLayer),
  { ssr: false },
);

type MockCanvasPanelProps = {
  selectedGalaxy: GalaxyProps | null;
  isLoading: boolean;
  isRenderReady: boolean;
  machineState: "idle" | "galaxy_ready" | "system_loading" | "system_ready" | "galaxy_loading";
  galaxyData: SerializedGalaxyViewData;
  systemData: SerializedSystemViewData | null;
  onWheelZoom: (deltaY: number) => void;
};

export function MockCanvasPanel({
  selectedGalaxy,
  isLoading,
  isRenderReady,
  machineState,
  galaxyData,
  systemData,
  onWheelZoom,
}: MockCanvasPanelProps) {
  const showCanvas = useMemo(
    () => isRenderReady && machineState !== "idle",
    [isRenderReady, machineState],
  );

  return (
    <section className={styles.panel}>
      <header className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Galaxy Viewport</h2>
      </header>

      {showCanvas ? (
        <div className={styles.renderStage}>
          <LazyThreeViewport
            machineState={machineState}
            galaxyData={galaxyData}
            systemData={systemData}
            onWheelZoom={onWheelZoom}
          />
          <LazyPopupLayer />
        </div>
      ) : (
        <div className={styles.placeholder}>
          <div>
            <h3 style={{ color: "var(--main-ivory)", marginBottom: 8 }}>Mock Canvas Placeholder</h3>
            <p>
              {selectedGalaxy
                ? `Selected galaxy: ${selectedGalaxy.name} (${selectedGalaxy.shape})`
                : "Select a galaxy from the list."}
            </p>
            <p className={styles.meta} style={{ marginTop: 8 }}>
              Scene starts after backend data sync.
            </p>
            {isLoading && (
              <p className={styles.meta} style={{ marginTop: 8 }}>
                Syncing data...
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
