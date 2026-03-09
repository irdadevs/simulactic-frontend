import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { SerializedGalaxyViewData, SerializedSystemViewData } from "../../../3d/core/serialized.types";
import { GalaxyProps } from "../../../types/galaxy.types";
import { ActionButton } from "../buttons/ActionButton";
import layoutStyles from "../../../styles/layout.module.css";
import commonStyles from "../../../styles/skeleton.module.css";

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
  loadingSystemName?: string | null;
};

export function MockCanvasPanel({
  selectedGalaxy,
  isLoading,
  isRenderReady,
  machineState,
  galaxyData,
  systemData,
  onWheelZoom,
  loadingSystemName,
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
    <section className={layoutStyles.panel}>
      <header className={layoutStyles.panelHeader}>
        <h2 className={commonStyles.panelTitle}>Galaxy Viewport</h2>
      </header>

      {showCanvas ? (
        <div ref={renderStageRef} className={layoutStyles.renderStage}>
          <LazyThreeViewport
            machineState={machineState}
            galaxyData={galaxyData}
            systemData={systemData}
            onWheelZoom={onWheelZoom}
          />
          {(machineState === "system_loading" || machineState === "galaxy_loading") && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 6,
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(180deg, rgba(6,9,9,0.18) 0%, rgba(6,9,9,0.42) 100%)",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  minWidth: 280,
                  maxWidth: 420,
                  padding: "16px 18px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 14,
                  background: "rgba(9, 14, 14, 0.72)",
                  boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
                  backdropFilter: "blur(6px)",
                  textAlign: "center",
                }}
              >
                <strong style={{ color: "var(--main-ivory)" }}>
                  {machineState === "system_loading"
                    ? `Loading ${loadingSystemName ?? "system"} detailed view`
                    : "Loading galaxy view"}
                </strong>
                <p className={commonStyles.meta} style={{ marginTop: 8 }}>
                  {machineState === "system_loading"
                    ? "Preparing stars, planets, moons and asteroids."
                    : "Returning to the galaxy scene."}
                </p>
              </div>
            </div>
          )}
          <LazySystemTimeControlsPanel />
          <LazySystemNavigatorPanel />
          <LazyPopupLayer />
          <div className={layoutStyles.fullViewFloating}>
            <ActionButton variant="secondary" onClick={() => void onToggleFullscreen()}>
              {isFullscreen ? "Exit full screen mode" : "Full screen mode"}
            </ActionButton>
          </div>
        </div>
      ) : (
        <div className={layoutStyles.placeholder}>
          <div>
            <h3 style={{ color: "var(--main-ivory)", marginBottom: 8 }}>Mock Canvas Placeholder</h3>
            <p>
              {selectedGalaxy
                ? `Selected galaxy: ${selectedGalaxy.name} (${selectedGalaxy.shape})`
                : "Select a galaxy from the list."}
            </p>
            <p className={commonStyles.meta} style={{ marginTop: 8 }}>
              Scene starts after backend data sync.
            </p>
            {isLoading && (
              <p className={commonStyles.meta} style={{ marginTop: 8 }}>
                Syncing data...
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
