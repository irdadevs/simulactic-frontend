import { EventBridge } from "../../3d/core/EventBridge";
import { useRenderStore } from "../../state/render.store";
import { useUiStore } from "../../state/ui.store";

const POPUP_HOVER_DELAY_MS = 140;

export const bind3dEvents = (eventBridge: EventBridge): (() => void) => {
  const unsubscribers: Array<() => void> = [];
  let hoverTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingHoverKey: string | null = null;
  let activeHoverKey: string | null = null;

  const clearHoverTimer = () => {
    if (!hoverTimer) return;
    clearTimeout(hoverTimer);
    hoverTimer = null;
  };

  const scheduleHoverPopup = (
    hoverKey: string,
    anchor: { x: number; y: number },
    open: (uiStore: ReturnType<typeof useUiStore.getState>) => void,
  ) => {
    if (useUiStore.getState().popupPinned) return;
    if (!hoverTimer && activeHoverKey === hoverKey) return;
    if (pendingHoverKey === hoverKey && hoverTimer) return;

    clearHoverTimer();
    pendingHoverKey = hoverKey;
    const uiStore = useUiStore.getState();
    uiStore.setPopupAnchor(anchor);
    uiStore.setPopupPinned(false);
    uiStore.setPopupLoading(true);

    hoverTimer = setTimeout(() => {
      hoverTimer = null;
      pendingHoverKey = null;
      activeHoverKey = hoverKey;
      const nextUiStore = useUiStore.getState();
      nextUiStore.setPopupLoading(false);
      open(nextUiStore);
    }, POPUP_HOVER_DELAY_MS);
  };

  unsubscribers.push(
    eventBridge.on("systemClicked", ({ systemId, anchor }) => {
      clearHoverTimer();
      pendingHoverKey = null;
      activeHoverKey = null;
      const uiStore = useUiStore.getState();
      uiStore.setPopupLoading(false);
      uiStore.setPopupAnchor(anchor);
      uiStore.setPopupPinned(useRenderStore.getState().viewMode === "galaxy");
      uiStore.openSystemPopup(systemId);
    }),
  );

  unsubscribers.push(
    eventBridge.on("starClicked", ({ systemId, starId, anchor }) => {
      clearHoverTimer();
      pendingHoverKey = null;
      activeHoverKey = null;
      const uiStore = useUiStore.getState();
      uiStore.setPopupLoading(false);
      uiStore.setPopupAnchor(anchor);
      uiStore.setPopupPinned(useRenderStore.getState().viewMode === "system");
      uiStore.openStarPopup({ systemId, starId });
    }),
  );

  unsubscribers.push(
    eventBridge.on("planetClicked", ({ planetId, anchor }) => {
      clearHoverTimer();
      pendingHoverKey = null;
      activeHoverKey = null;
      const uiStore = useUiStore.getState();
      uiStore.setPopupLoading(false);
      uiStore.setPopupAnchor(anchor);
      uiStore.setPopupPinned(useRenderStore.getState().viewMode === "system");
      uiStore.openPlanetPopup(planetId);
    }),
  );

  unsubscribers.push(
    eventBridge.on("moonClicked", ({ moonId, anchor }) => {
      clearHoverTimer();
      pendingHoverKey = null;
      activeHoverKey = null;
      const uiStore = useUiStore.getState();
      uiStore.setPopupLoading(false);
      uiStore.setPopupAnchor(anchor);
      uiStore.setPopupPinned(useRenderStore.getState().viewMode === "system");
      uiStore.openMoonPopup(moonId);
    }),
  );

  unsubscribers.push(
    eventBridge.on("asteroidClicked", ({ asteroidId, anchor }) => {
      clearHoverTimer();
      pendingHoverKey = null;
      activeHoverKey = null;
      const uiStore = useUiStore.getState();
      uiStore.setPopupLoading(false);
      uiStore.setPopupAnchor(anchor);
      uiStore.setPopupPinned(useRenderStore.getState().viewMode === "system");
      uiStore.openAsteroidPopup(asteroidId);
    }),
  );

  unsubscribers.push(
    eventBridge.on("systemHovered", ({ systemId, anchor }) => {
      scheduleHoverPopup(`system:${systemId}`, anchor, (uiStore) => uiStore.openSystemPopup(systemId));
    }),
  );

  unsubscribers.push(
    eventBridge.on("starHovered", ({ systemId, starId, anchor }) => {
      scheduleHoverPopup(`star:${systemId}:${starId}`, anchor, (uiStore) =>
        uiStore.openStarPopup({ systemId, starId }),
      );
    }),
  );

  unsubscribers.push(
    eventBridge.on("planetHovered", ({ planetId, systemId, anchor }) => {
      scheduleHoverPopup(`planet:${systemId}:${planetId}`, anchor, (uiStore) =>
        uiStore.openPlanetPopup(planetId),
      );
    }),
  );

  unsubscribers.push(
    eventBridge.on("moonHovered", ({ moonId, systemId, anchor }) => {
      scheduleHoverPopup(`moon:${systemId}:${moonId}`, anchor, (uiStore) =>
        uiStore.openMoonPopup(moonId),
      );
    }),
  );

  unsubscribers.push(
    eventBridge.on("asteroidHovered", ({ asteroidId, systemId, anchor }) => {
      scheduleHoverPopup(`asteroid:${systemId}:${asteroidId}`, anchor, (uiStore) =>
        uiStore.openAsteroidPopup(asteroidId),
      );
    }),
  );

  unsubscribers.push(
    eventBridge.on("hoverCleared", () => {
      clearHoverTimer();
      pendingHoverKey = null;
      activeHoverKey = null;
      const uiStore = useUiStore.getState();
      const { viewMode } = useRenderStore.getState();
      if ((viewMode === "galaxy" || viewMode === "system") && uiStore.popupPinned) {
        uiStore.setPopupLoading(false);
        return;
      }
      uiStore.setPopupLoading(false);
      uiStore.setPopupAnchor(null);
      uiStore.setPopup(null);
      uiStore.setPopupPinned(false);
    }),
  );

  unsubscribers.push(
    eventBridge.on("backgroundClicked", () => {
      const uiStore = useUiStore.getState();
      uiStore.setPopup(null);
      uiStore.setPopupAnchor(null);
      uiStore.setPopupPinned(false);
      uiStore.setPopupLoading(false);
      activeHoverKey = null;
      pendingHoverKey = null;
      clearHoverTimer();
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
    activeHoverKey = null;
    useUiStore.getState().setPopupLoading(false);
    useUiStore.getState().setPopupAnchor(null);
    useUiStore.getState().setPopupPinned(false);
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
};
