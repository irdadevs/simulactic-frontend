import { EventBridge } from "../../3d/core/EventBridge";
import { useRenderStore } from "../../state/render.store";
import { useUiStore } from "../../state/ui.store";

const POPUP_HOVER_DELAY_MS = 2000;

export const bind3dEvents = (eventBridge: EventBridge): (() => void) => {
  const unsubscribers: Array<() => void> = [];
  let hoverTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingHoverKey: string | null = null;

  const clearHoverTimer = () => {
    if (!hoverTimer) return;
    clearTimeout(hoverTimer);
    hoverTimer = null;
  };

  const scheduleHoverPopup = (
    hoverKey: string,
    open: (uiStore: ReturnType<typeof useUiStore.getState>) => void,
  ) => {
    if (pendingHoverKey === hoverKey && hoverTimer) return;

    clearHoverTimer();
    pendingHoverKey = hoverKey;
    useUiStore.getState().setPopupLoading(true);

    hoverTimer = setTimeout(() => {
      hoverTimer = null;
      pendingHoverKey = null;
      const uiStore = useUiStore.getState();
      uiStore.setPopupLoading(false);
      open(uiStore);
    }, POPUP_HOVER_DELAY_MS);
  };

  unsubscribers.push(
    eventBridge.on("systemClicked", ({ systemId }) => {
      clearHoverTimer();
      pendingHoverKey = null;
      useUiStore.getState().setPopupLoading(false);
      useUiStore.getState().openSystemPopup(systemId);
    }),
  );

  unsubscribers.push(
    eventBridge.on("starClicked", ({ systemId, starId }) => {
      clearHoverTimer();
      pendingHoverKey = null;
      useUiStore.getState().setPopupLoading(false);
      useUiStore.getState().openStarPopup({ systemId, starId });
    }),
  );

  unsubscribers.push(
    eventBridge.on("systemHovered", ({ systemId }) => {
      scheduleHoverPopup(`system:${systemId}`, (uiStore) => uiStore.openSystemPopup(systemId));
    }),
  );

  unsubscribers.push(
    eventBridge.on("starHovered", ({ systemId, starId }) => {
      scheduleHoverPopup(`star:${systemId}:${starId}`, (uiStore) =>
        uiStore.openStarPopup({ systemId, starId }),
      );
    }),
  );

  unsubscribers.push(
    eventBridge.on("planetHovered", ({ planetId }) => {
      scheduleHoverPopup(`planet:${planetId}`, (uiStore) => uiStore.openPlanetPopup(planetId));
    }),
  );

  unsubscribers.push(
    eventBridge.on("moonHovered", ({ moonId }) => {
      scheduleHoverPopup(`moon:${moonId}`, (uiStore) => uiStore.openMoonPopup(moonId));
    }),
  );

  unsubscribers.push(
    eventBridge.on("asteroidHovered", ({ asteroidId }) => {
      scheduleHoverPopup(`asteroid:${asteroidId}`, (uiStore) =>
        uiStore.openAsteroidPopup(asteroidId),
      );
    }),
  );

  unsubscribers.push(
    eventBridge.on("hoverCleared", () => {
      clearHoverTimer();
      pendingHoverKey = null;
      useUiStore.getState().setPopupLoading(false);
    }),
  );

  unsubscribers.push(
    eventBridge.on("requestSystemView", ({ systemId }) => {
      const renderStore = useRenderStore.getState();
      if (renderStore.machineState === "system_ready") {
        return;
      }

      renderStore.requestSystemTransition({
        systemId,
        reason: "user_select_system",
      });
    }),
  );

  unsubscribers.push(
    eventBridge.on("requestGalaxyView", ({ reason }) => {
      useRenderStore.getState().requestGalaxyTransition(reason);
    }),
  );

  return () => {
    clearHoverTimer();
    useUiStore.getState().setPopupLoading(false);
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
};
