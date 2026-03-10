"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { publicEnv } from "../../../config/env";
import { logger } from "../../../lib/logger";
import { shouldTrackTraffic } from "../../../lib/telemetry/preferences";

const SESSION_KEY = "simulactic:traffic:session-id";
const API_PREFIX = "/api/v1";

const createSessionId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getSessionId = (): string => {
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = createSessionId();
  window.sessionStorage.setItem(SESSION_KEY, next);
  return next;
};

const getReferrerHost = (referrer: string): string | null => {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname;
  } catch {
    return null;
  }
};

export function TrafficTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullPath = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!pathname) return;
    if (!shouldTrackTraffic(publicEnv.trafficTrackingEnabled)) return;

    const sessionId = getSessionId();
    const referrer = document.referrer || "";
    const referrerHost = getReferrerHost(referrer);
    const isExternalReferrer =
      Boolean(referrerHost) && referrerHost !== window.location.hostname;
    const startedAt = performance.now();
    let sent = false;

    const sendTrafficMetric = (reason: "route_change" | "page_hide") => {
      if (sent) return;
      sent = true;

      const durationMs = Math.max(1, Math.round(performance.now() - startedAt));
      const payload = {
        metricName: "traffic.page_view",
        metricType: "http" as const,
        source: "frontend.web",
        durationMs,
        success: true,
        tags: {
          pathname,
          referrerHost: referrerHost ?? "direct",
          externalReferrer: isExternalReferrer,
          reason,
        },
        context: {
          pathname,
          fullPath,
          search: searchParams.toString(),
          title: document.title,
          referrer,
          referrerHost,
          sessionId,
          language: navigator.language,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        },
      };

      const body = JSON.stringify(payload);

      if (reason === "page_hide" && navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(`${API_PREFIX}/metrics/performance`, blob);
        return;
      }

      void fetch(`${API_PREFIX}/metrics/performance`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body,
        keepalive: reason === "page_hide",
      }).catch(() => {
        // Traffic metrics must never affect navigation.
        logger.warn("Traffic metric send failed", { pathname, fullPath });
      });
    };

    const onPageHide = () => {
      sendTrafficMetric("page_hide");
    };
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      sendTrafficMetric("route_change");
    };
  }, [fullPath, pathname, searchParams]);

  return null;
}
