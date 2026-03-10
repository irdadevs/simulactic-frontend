const ANALYTICS_OPT_OUT_KEY = "simulactic:analytics:opt-out";

const isBrowser = () => typeof window !== "undefined";

export const getAnalyticsOptOut = (): boolean => {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === "true";
};

export const setAnalyticsOptOut = (value: boolean): void => {
  if (!isBrowser()) return;
  window.localStorage.setItem(ANALYTICS_OPT_OUT_KEY, value ? "true" : "false");
};

export const isDoNotTrackEnabled = (): boolean => {
  if (!isBrowser()) return false;
  const doNotTrack =
    window.navigator.doNotTrack ??
    (window as Window & { doNotTrack?: string }).doNotTrack;
  return doNotTrack === "1" || doNotTrack === "yes";
};

export const shouldTrackTraffic = (trackingEnabled: boolean): boolean =>
  trackingEnabled && !getAnalyticsOptOut() && !isDoNotTrackEnabled();
