"use client";

import { useEffect } from "react";

type LandingSnapControllerProps = {
  containerId: string;
  sectionSelector: string;
};

const ANIMATION_LOCK_MS = 700;
const RESET_ACCUM_MS = 220;

const readCssOffsetPx = (name: string): number => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw.replace("px", ""));
  return Number.isFinite(value) ? value : 0;
};

const nearestSectionIndex = (sections: HTMLElement[]): number => {
  const viewportCenter = window.scrollY + window.innerHeight / 2;
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section, index) => {
    const sectionCenter = section.offsetTop + section.offsetHeight / 2;
    const distance = Math.abs(sectionCenter - viewportCenter);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
};

export function LandingSnapController({ containerId, sectionSelector }: LandingSnapControllerProps) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sections = Array.from(container.querySelectorAll<HTMLElement>(sectionSelector));
    if (sections.length < 2) return;

    let accumulatedDelta = 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    let isAnimating = false;

    const onWheel = (event: WheelEvent) => {
      if (!event.cancelable) return;
      event.preventDefault();

      if (isAnimating) return;

      accumulatedDelta += event.deltaY;
      const threshold = Math.max(80, window.innerHeight * 0.5);

      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        accumulatedDelta = 0;
      }, RESET_ACCUM_MS);

      if (Math.abs(accumulatedDelta) < threshold) return;

      const direction = accumulatedDelta > 0 ? 1 : -1;
      const current = nearestSectionIndex(sections);
      const target = Math.max(0, Math.min(sections.length - 1, current + direction));
      accumulatedDelta = 0;

      if (target === current) return;

      isAnimating = true;
      const topbarOffset = readCssOffsetPx("--app-topbar-offset");
      const targetTop = Math.max(0, sections[target].offsetTop - topbarOffset);
      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
      setTimeout(() => {
        isAnimating = false;
      }, ANIMATION_LOCK_MS);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [containerId, sectionSelector]);

  return null;
}
