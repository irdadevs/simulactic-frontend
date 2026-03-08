import { SystemRenderDetail, useRenderStore } from "../../state/render.store";

const galaxyNodes = [
  {
    system: {
      id: "sys-1",
      galaxyId: "gal-1",
      name: "System 1",
      position: { x: 1, y: 2, z: 3 },
    },
    mainStar: null,
    stars: [],
  },
];

const systemDetail = {
  system: {
    id: "sys-1",
    galaxyId: "gal-1",
    name: "System 1",
    position: { x: 1, y: 2, z: 3 },
  },
  stars: [],
  planets: [],
  asteroids: [],
} as SystemRenderDetail;

describe("render store", () => {
  beforeEach(() => {
    useRenderStore.getState().resetRender();
  });

  it("rejects system transition when machine is not galaxy_ready", () => {
    const accepted = useRenderStore.getState().requestSystemTransition({
      systemId: "sys-1",
    });

    expect(accepted).toBe(false);
    expect(useRenderStore.getState().machineState).toBe("idle");
  });

  it("starts system transition, increments token and commits only matching system detail", () => {
    useRenderStore.getState().initializeGalaxy({ galaxyId: "gal-1", nodes: galaxyNodes });
    const before = useRenderStore.getState().transitionToken;

    const accepted = useRenderStore.getState().requestSystemTransition({
      systemId: "sys-1",
      reason: "zoom_threshold",
    });

    expect(accepted).toBe(true);
    expect(useRenderStore.getState().machineState).toBe("system_loading");
    expect(useRenderStore.getState().transitionToken).toBe(before + 1);
    expect(useRenderStore.getState().transitionReason).toBe("zoom_threshold");

    const wrongSystemCommit = useRenderStore.getState().commitSystemTransition({
      ...systemDetail,
      system: { ...systemDetail.system, id: "sys-2" },
    });

    expect(wrongSystemCommit).toBe(false);
    expect(useRenderStore.getState().machineState).toBe("system_loading");

    const committed = useRenderStore.getState().commitSystemTransition(systemDetail);
    expect(committed).toBe(true);
    expect(useRenderStore.getState().machineState).toBe("system_ready");
    expect(useRenderStore.getState().viewMode).toBe("system");
  });

  it("supports galaxy transition roundtrip and failTransition recovery", () => {
    useRenderStore.getState().initializeGalaxy({ galaxyId: "gal-1", nodes: galaxyNodes });
    useRenderStore.getState().requestSystemTransition({ systemId: "sys-1" });
    useRenderStore.getState().commitSystemTransition(systemDetail);

    const requested = useRenderStore.getState().requestGalaxyTransition();
    expect(requested).toBe(true);
    expect(useRenderStore.getState().machineState).toBe("galaxy_loading");

    useRenderStore.getState().failTransition();
    expect(useRenderStore.getState().machineState).toBe("system_ready");

    useRenderStore.getState().requestGalaxyTransition("zoom_threshold");
    const committed = useRenderStore
      .getState()
      .commitGalaxyTransition({ nodes: [...galaxyNodes, galaxyNodes[0]] });

    expect(committed).toBe(true);
    expect(useRenderStore.getState().machineState).toBe("galaxy_ready");
    expect(useRenderStore.getState().viewMode).toBe("galaxy");
    expect(useRenderStore.getState().activeSystemId).toBeNull();
    expect(useRenderStore.getState().galaxyNodes.length).toBe(2);
  });
});
