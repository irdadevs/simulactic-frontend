"use client";

import clsx from "clsx";
import { useRenderStore } from "../../state/render.store";
import { useUiStore } from "../../state/ui.store";
import styles from "../../styles/popup.module.css";

export function SystemTimeControlsPanel() {
  const viewMode = useRenderStore((state) => state.viewMode);
  const { isPlaying, speed } = useUiStore((state) => state.systemTimeConfig);
  const setSystemTimePlaying = useUiStore((state) => state.setSystemTimePlaying);
  const setSystemTimeSpeed = useUiStore((state) => state.setSystemTimeSpeed);

  if (viewMode !== "system") return null;

  return (
    <aside className={styles.systemTimePanel}>
      <button
        type="button"
        className={clsx(styles.timeChip, !isPlaying && styles.timeChipActive)}
        onClick={() => setSystemTimePlaying(false)}
      >
        Stop
      </button>
      <button
        type="button"
        className={clsx(styles.timeChip, isPlaying && styles.timeChipActive)}
        onClick={() => setSystemTimePlaying(true)}
      >
        Play
      </button>
      <button
        type="button"
        className={clsx(styles.timeChip, speed === 0.5 && styles.timeChipActive)}
        onClick={() => setSystemTimeSpeed(0.5)}
      >
        x0.5
      </button>
      <button
        type="button"
        className={clsx(styles.timeChip, speed === 1 && styles.timeChipActive)}
        onClick={() => setSystemTimeSpeed(1)}
      >
        x1
      </button>
      <button
        type="button"
        className={clsx(styles.timeChip, speed === 2 && styles.timeChipActive)}
        onClick={() => setSystemTimeSpeed(2)}
      >
        x2
      </button>
    </aside>
  );
}
