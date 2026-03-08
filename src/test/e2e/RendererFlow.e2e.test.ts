import { EventBridge } from "../../3d/core/EventBridge";
import { bind3dEvents } from "../../application/services/bind3dEvents";
import { useRenderStore } from "../../state/render.store";
import { useUiStore } from "../../state/ui.store";

describe("renderer event flow (e2e)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useRenderStore.getState().resetRender();
    useUiStore.getState().closeAllPanels();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("opens popup request after hover delay", () => {
    const bridge = new EventBridge();
    const cleanup = bind3dEvents(bridge);

    bridge.emit("systemHovered", {
      systemId: "sys-1",
      anchor: { x: 120, y: 90 },
    });

    expect(useUiStore.getState().popupLoading).toBe(true);
    expect(useUiStore.getState().popupRequest).toBeNull();

    jest.advanceTimersByTime(140);

    expect(useUiStore.getState().popupLoading).toBe(false);
    expect(useUiStore.getState().popupRequest).toEqual({ kind: "system", systemId: "sys-1" });
    expect(useUiStore.getState().popupAnchor).toEqual({ x: 120, y: 90 });

    cleanup();
  });

  it("keeps pinned popup on hoverCleared in galaxy/system views", () => {
    useRenderStore.setState({ viewMode: "galaxy" });
    const bridge = new EventBridge();
    const cleanup = bind3dEvents(bridge);

    bridge.emit("systemClicked", {
      systemId: "sys-2",
      focusPoint: { x: 1, y: 2, z: 3 },
      anchor: { x: 200, y: 150 },
    });

    expect(useUiStore.getState().popupPinned).toBe(true);
    expect(useUiStore.getState().popupAnchor).toEqual({ x: 200, y: 150 });

    bridge.emit("hoverCleared", undefined);

    expect(useUiStore.getState().popupPinned).toBe(true);
    expect(useUiStore.getState().popupAnchor).toEqual({ x: 200, y: 150 });

    cleanup();
  });

  it("clears hover popup when not pinned", () => {
    const bridge = new EventBridge();
    const cleanup = bind3dEvents(bridge);

    useUiStore.setState({
      popupPinned: false,
      popupLoading: true,
      popupAnchor: { x: 80, y: 70 },
      popup: {
        kind: "system",
        data: {
          system: {
            id: "sys-4",
            galaxyId: "gal-1",
            name: "Sys 4",
            position: { x: 0, y: 0, z: 0 },
          },
          stars: [],
          planets: [],
          asteroids: [],
        },
      },
    });

    bridge.emit("hoverCleared", undefined);

    expect(useUiStore.getState().popupLoading).toBe(false);
    expect(useUiStore.getState().popupAnchor).toBeNull();
    expect(useUiStore.getState().popup).toBeNull();
    expect(useUiStore.getState().popupPinned).toBe(false);

    cleanup();
  });

  it("always clears popup state on background click", () => {
    const bridge = new EventBridge();
    const cleanup = bind3dEvents(bridge);

    useUiStore.setState({
      popupPinned: true,
      popupLoading: true,
      popupAnchor: { x: 50, y: 40 },
      popup: {
        kind: "asteroid",
        data: {
          id: "ast-1",
          systemId: "sys-1",
          name: "Ast 1",
          type: "single",
          size: "small",
          orbital: 1,
        },
      },
    });

    bridge.emit("backgroundClicked", undefined);

    expect(useUiStore.getState().popup).toBeNull();
    expect(useUiStore.getState().popupAnchor).toBeNull();
    expect(useUiStore.getState().popupPinned).toBe(false);
    expect(useUiStore.getState().popupLoading).toBe(false);

    cleanup();
  });

  it("requests galaxy transition from system_ready on bridge event", () => {
    useRenderStore.setState({
      machineState: "system_ready",
      viewMode: "system",
      activeSystemId: "sys-3",
    });

    const bridge = new EventBridge();
    const cleanup = bind3dEvents(bridge);

    bridge.emit("requestGalaxyView", { reason: "zoom_threshold" });

    const state = useRenderStore.getState();
    expect(state.machineState).toBe("galaxy_loading");
    expect(state.transitionReason).toBe("zoom_threshold");
    expect(state.lastSystemId).toBe("sys-3");

    cleanup();
  });

  it("ignores requestSystemView if machine is already system_ready", () => {
    useRenderStore.setState({
      machineState: "system_ready",
      viewMode: "system",
      activeSystemId: "sys-current",
      transitionReason: null,
    });

    const bridge = new EventBridge();
    const cleanup = bind3dEvents(bridge);

    bridge.emit("requestSystemView", { systemId: "sys-next" });

    const state = useRenderStore.getState();
    expect(state.machineState).toBe("system_ready");
    expect(state.activeSystemId).toBe("sys-current");
    expect(state.transitionReason).toBeNull();

    cleanup();
  });
});
