import { useUiStore } from "../../state/ui.store";

describe("ui store", () => {
  beforeEach(() => {
    useUiStore.getState().closeAllPanels();
    useUiStore.setState({
      isSidebarOpen: true,
      isInspectorOpen: false,
      popup: null,
      popupRequest: null,
      popupAnchor: null,
      popupPinned: false,
      popupLoading: false,
      loadingMessage: null,
      navigateToSystemTarget: null,
      applySystemTimeConfig: null,
      systemTimeConfig: {
        isPlaying: true,
        speed: 1,
      },
    });
  });

  it("deduplicates popup requests for identical pending payload", () => {
    useUiStore.getState().openSystemPopup("sys-1");
    const firstRef = useUiStore.getState().popupRequest;

    useUiStore.getState().openSystemPopup("sys-1");
    const secondRef = useUiStore.getState().popupRequest;

    expect(firstRef).toEqual({ kind: "system", systemId: "sys-1" });
    expect(secondRef).toBe(firstRef);
  });

  it("skips popup request when the target popup is already open", () => {
    useUiStore.setState({
      popup: {
        kind: "moon",
        data: {
          id: "moon-1",
          planetId: "planet-1",
          name: "Moon 1",
          size: "medium",
          orbital: 1,
          relativeMass: 1,
          relativeRadius: 1,
          temperature: 250,
        },
      },
      popupRequest: null,
    });

    useUiStore.getState().openMoonPopup("moon-1");
    expect(useUiStore.getState().popupRequest).toBeNull();
  });

  it("closeAllPanels resets popup and time fields to safe defaults", () => {
    useUiStore.setState({
      isSidebarOpen: true,
      isInspectorOpen: true,
      popupAnchor: { x: 10, y: 20 },
      popupPinned: true,
      popupLoading: true,
      loadingMessage: "loading",
      systemTimeConfig: {
        isPlaying: false,
        speed: 2,
      },
      popupRequest: { kind: "asteroid", asteroidId: "ast-1" },
    });

    useUiStore.getState().closeAllPanels();
    const state = useUiStore.getState();

    expect(state.isSidebarOpen).toBe(false);
    expect(state.isInspectorOpen).toBe(false);
    expect(state.popup).toBeNull();
    expect(state.popupRequest).toBeNull();
    expect(state.popupAnchor).toBeNull();
    expect(state.popupPinned).toBe(false);
    expect(state.popupLoading).toBe(false);
    expect(state.systemTimeConfig).toEqual({ isPlaying: true, speed: 1 });
  });
});
