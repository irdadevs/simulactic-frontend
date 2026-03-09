import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SerializedGalaxyViewData,
  SerializedSystemViewData,
} from "../../../3d/core/serialized.types";
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
  hasGalaxies: boolean;
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
  hasGalaxies,
  isLoading,
  isRenderReady,
  machineState,
  galaxyData,
  systemData,
  onWheelZoom,
  loadingSystemName,
}: MockCanvasPanelProps) {
  const renderStageRef = useRef<HTMLDivElement | null>(null);
  const overlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showCanvas = useMemo(
    () => isRenderReady && machineState !== "idle",
    [isRenderReady, machineState],
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingOverlay, setLoadingOverlay] = useState<{
    kind: "system_loading" | "galaxy_loading";
    systemName?: string | null;
  } | null>(null);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const clearOverlayTimer = () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
        overlayTimeoutRef.current = null;
      }
    };
    let showOverlayTimer: ReturnType<typeof setTimeout> | null = null;

    if (machineState === "system_loading") {
      clearOverlayTimer();
      showOverlayTimer = setTimeout(() => {
        setLoadingOverlay({ kind: "system_loading", systemName: loadingSystemName });
      }, 0);
      return () => {
        if (showOverlayTimer) {
          clearTimeout(showOverlayTimer);
        }
      };
    }

    if (machineState === "galaxy_loading") {
      clearOverlayTimer();
      showOverlayTimer = setTimeout(() => {
        setLoadingOverlay({ kind: "galaxy_loading" });
      }, 0);
      return () => {
        if (showOverlayTimer) {
          clearTimeout(showOverlayTimer);
        }
      };
    }

    if (loadingOverlay) {
      clearOverlayTimer();
      overlayTimeoutRef.current = setTimeout(() => {
        setLoadingOverlay(null);
        overlayTimeoutRef.current = null;
      }, 450);
    }

    return () => {
      if (showOverlayTimer) {
        clearTimeout(showOverlayTimer);
      }
      clearOverlayTimer();
    };
  }, [loadingOverlay, loadingSystemName, machineState]);

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
          {loadingOverlay && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 6,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(180deg, rgba(6,9,9,0.18) 0%, rgba(6,9,9,0.42) 100%)",
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
                  {loadingOverlay.kind === "system_loading"
                    ? `Loading ${loadingOverlay.systemName ?? "system"} detailed view`
                    : "Loading galaxy view"}
                </strong>
                <p className={commonStyles.meta} style={{ marginTop: 8 }}>
                  {loadingOverlay.kind === "system_loading"
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
            <h3 style={{ color: "var(--main-turquoise-surf)", marginBottom: 8 }}>
              {hasGalaxies ? "Loading data" : "No galaxies yet"}
            </h3>
            <p>
              {hasGalaxies
                ? selectedGalaxy
                  ? `Selected galaxy: ${selectedGalaxy.name} (${selectedGalaxy.shape})`
                  : "Select a galaxy from the list."
                : "Create a galaxy to begin your first viewport."}
            </p>
            <p className={commonStyles.meta} style={{ marginTop: 8 }}>
              {hasGalaxies
                ? "Scene starts after data sync."
                : "This space will show a 3D scene once a galaxy exists."}
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
