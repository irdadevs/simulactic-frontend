import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { SerializedGalaxyViewData, SerializedSystemViewData } from "../../../3d/core/serialized.types";
import { GalaxyProps } from "../../../types/galaxy.types";
import { ActionButton } from "../buttons/ActionButton";
import styles from "../../../styles/skeleton.module.css";

const LazyThreeViewport = dynamic(
  () => import("../../overlays/ThreeViewport").then((mod) => mod.ThreeViewport),
  { ssr: false },
);

const LazyPopupLayer = dynamic(
  () => import("../../popups/PopupLayer").then((mod) => mod.PopupLayer),
  { ssr: false },
);

const LazySystemNavigatorPanel = dynamic(
  () => import("../../overlays/SystemNavigatorPanel").then((mod) => mod.SystemNavigatorPanel),
  { ssr: false },
);

const LazySystemTimeControlsPanel = dynamic(
  () => import("../../overlays/SystemTimeControlsPanel").then((mod) => mod.SystemTimeControlsPanel),
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
  const renderStageRef = useRef<HTMLDivElement | null>(null);
  const showCanvas = useMemo(
    () => isRenderReady && machineState !== "idle",
    [isRenderReady, machineState],
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  const onToggleFullscreen = async () => {
    if (!document.fullscreenElement && renderStageRef.current) {
      await renderStageRef.current.requestFullscreen();
      return;
    }
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  return (
    <section className={styles.panel}>
      <header className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Galaxy Viewport</h2>
      </header>

      {showCanvas ? (
        <div ref={renderStageRef} className={styles.renderStage}>
          <LazyThreeViewport
            machineState={machineState}
            galaxyData={galaxyData}
            systemData={systemData}
            onWheelZoom={onWheelZoom}
          />
          <LazySystemTimeControlsPanel />
          <LazySystemNavigatorPanel />
          <LazyPopupLayer />
          <div className={styles.fullViewButtonWrap}>
            <ActionButton variant="secondary" onClick={() => void onToggleFullscreen()}>
              {isFullscreen ? "Exit full mode" : "Full mode view"}
            </ActionButton>
          </div>
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
