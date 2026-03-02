import { EventBridge } from "../../3d/core/EventBridge";
import { useRenderStore } from "../../state/render.store";
import { useUiStore } from "../../state/ui.store";

export const bind3dEvents = (eventBridge: EventBridge): (() => void) => {
  const unsubscribers: Array<() => void> = [];

  unsubscribers.push(
    eventBridge.on("systemClicked", ({ systemId }) => {
      useUiStore.getState().openSystemPopup(systemId);
    }),
  );

  unsubscribers.push(
    eventBridge.on("starClicked", ({ systemId }) => {
      useUiStore.getState().openSystemPopup(systemId);
    }),
  );

  unsubscribers.push(
    eventBridge.on("systemHovered", ({ systemId }) => {
      useUiStore.getState().openSystemPopup(systemId);
    }),
  );

  unsubscribers.push(
    eventBridge.on("starHovered", ({ systemId, starId }) => {
      useUiStore.getState().openStarPopup({ systemId, starId });
    }),
  );

  unsubscribers.push(
    eventBridge.on("planetHovered", ({ planetId }) => {
      useUiStore.getState().openPlanetPopup(planetId);
    }),
  );

  unsubscribers.push(
    eventBridge.on("moonHovered", ({ moonId }) => {
      useUiStore.getState().openMoonPopup(moonId);
    }),
  );

  unsubscribers.push(
    eventBridge.on("asteroidHovered", ({ asteroidId }) => {
      useUiStore.getState().openAsteroidPopup(asteroidId);
    }),
  );

  unsubscribers.push(
    eventBridge.on("hoverCleared", () => {
      useUiStore.getState().clearPopupRequest();
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
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
};
