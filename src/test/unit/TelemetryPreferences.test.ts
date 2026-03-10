import {
  getAnalyticsOptOut,
  isDoNotTrackEnabled,
  setAnalyticsOptOut,
  shouldTrackTraffic,
} from "../../lib/telemetry/preferences";

type MockStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  clear: () => void;
};

const createStorage = (): MockStorage => {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    clear: () => {
      store.clear();
    },
  };
};

describe("telemetry preferences", () => {
  const previousWindow = globalThis.window;
  const storage = createStorage();

  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: storage,
        navigator: {
          doNotTrack: "0",
        },
      },
    });
    storage.clear();
  });

  afterAll(() => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: previousWindow,
    });
  });

  it("persists analytics opt-out", () => {
    expect(getAnalyticsOptOut()).toBe(false);

    setAnalyticsOptOut(true);
    expect(getAnalyticsOptOut()).toBe(true);
    expect(shouldTrackTraffic(true)).toBe(false);
  });

  it("respects browser do not track", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: storage,
        navigator: {
          doNotTrack: "1",
        },
      },
    });

    expect(isDoNotTrackEnabled()).toBe(true);
    expect(shouldTrackTraffic(true)).toBe(false);
  });
});
