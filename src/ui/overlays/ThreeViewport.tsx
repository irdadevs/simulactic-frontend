"use client";

import { memo, useEffect, useRef, useState } from "react";
import { bind3dEvents } from "../../application/services/bind3dEvents";
import type { SceneManager } from "../../3d/core/SceneManager";
import { SerializedGalaxyViewData, SerializedSystemViewData } from "../../3d/core/serialized.types";
import { useRenderStore } from "../../state/render.store";
import { useUiStore } from "../../state/ui.store";
import styles from "../../styles/skeleton.module.css";

type ThreeViewportProps = {
  machineState: "idle" | "galaxy_ready" | "system_loading" | "system_ready" | "galaxy_loading";
  galaxyData: SerializedGalaxyViewData;
  systemData: SerializedSystemViewData | null;
  onWheelZoom: (deltaY: number) => void;
};

function ThreeViewportComponent({
  machineState,
  galaxyData,
  systemData,
  onWheelZoom,
}: ThreeViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const managerRef = useRef<SceneManager | null>(null);
  const cleanupEventsRef = useRef<(() => void) | null>(null);
  const onWheelZoomRef = useRef(onWheelZoom);
  const setNavigateToSystemTarget = useUiStore((state) => state.setNavigateToSystemTarget);
  const setApplySystemTimeConfig = useUiStore((state) => state.setApplySystemTimeConfig);
  const systemTimeConfig = useUiStore((state) => state.systemTimeConfig);
  const clearLastSystemId = useRenderStore((state) => state.clearLastSystemId);
  const [managerReadyToken, setManagerReadyToken] = useState(0);

  useEffect(() => {
    onWheelZoomRef.current = onWheelZoom;
  }, [onWheelZoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isUnmounted = false;
    let observer: ResizeObserver | null = null;
    let handleWheel: ((event: WheelEvent) => void) | null = null;

    const initialize = async () => {
      const [{ EventBridge }, { SceneManager }] = await Promise.all([
        import("../../3d/core/EventBridge"),
        import("../../3d/core/SceneManager"),
      ]);

      if (isUnmounted) return;

      const eventBridge = new EventBridge();
      const manager = new SceneManager({ canvas, eventBridge });
      managerRef.current = manager;
      setNavigateToSystemTarget((target) => {
        manager.navigateToSystemTarget(target);
      });
      setApplySystemTimeConfig((config) => {
        manager.setSystemTimeConfig(config);
      });
      manager.setSystemTimeConfig(systemTimeConfig);
      cleanupEventsRef.current = bind3dEvents(eventBridge);
      setManagerReadyToken((prev) => prev + 1);

      observer = new ResizeObserver(() => {
        manager.resize(canvas.clientWidth, canvas.clientHeight);
      });
      observer.observe(canvas);

      handleWheel = (event: WheelEvent) => {
        onWheelZoomRef.current(event.deltaY);
      };
      canvas.addEventListener("wheel", handleWheel, { passive: true });
    };

    void initialize();

    return () => {
      isUnmounted = true;
      if (handleWheel) {
        canvas.removeEventListener("wheel", handleWheel);
      }
      observer?.disconnect();
      cleanupEventsRef.current?.();
      cleanupEventsRef.current = null;
      setNavigateToSystemTarget(null);
      setApplySystemTimeConfig(null);
      managerRef.current?.dispose();
      managerRef.current = null;
    };
  }, [setApplySystemTimeConfig, setNavigateToSystemTarget]);

  useEffect(() => {
    managerRef.current?.setSystemTimeConfig(systemTimeConfig);
  }, [systemTimeConfig]);

  useEffect(() => {
    if (machineState === "system_loading" || machineState === "galaxy_loading") {
      managerRef.current?.unmountScene();
      return;
    }

    let isCancelled = false;

    const mountScene = async () => {
      const manager = managerRef.current;
      if (!manager) return;

      if (machineState === "galaxy_ready") {
        const { GalaxyScene } = await import("../../3d/galaxy/GalaxyScene");
        if (isCancelled || !managerRef.current) return;

        const scene = new GalaxyScene(managerRef.current.eventBridge);
        scene.mount({
          systems: galaxyData.systems.map((system) => ({
            id: system.systemId,
            x: system.position.x,
            y: system.position.y,
            z: system.position.z,
            color: system.color,
            size: system.size,
          })),
        });
        managerRef.current.showGalaxyScene(scene);
        if (galaxyData.focusSystemId) {
          const focusPoint = scene.getSystemPoint(galaxyData.focusSystemId);
          if (focusPoint) {
            managerRef.current.animateGalaxyReturnFocus(focusPoint);
          }
          clearLastSystemId();
        }
        return;
      }

      if (machineState === "system_ready" && systemData) {
        const { SystemScene } = await import("../../3d/system/SystemScene");
        if (isCancelled || !managerRef.current) return;

        const scene = new SystemScene(managerRef.current.eventBridge);
        scene.mount(systemData);
        managerRef.current.showSystemScene(scene);
      }
    };

    void mountScene();

    return () => {
      isCancelled = true;
    };
  }, [clearLastSystemId, galaxyData, machineState, systemData, managerReadyToken]);

  return (
    <div className={styles.canvasWrap}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}

export const ThreeViewport = memo(ThreeViewportComponent);
