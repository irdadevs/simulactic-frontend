"use client";

import { useState } from "react";
import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/me.module.css";
import { getAnalyticsOptOut, setAnalyticsOptOut } from "../../../lib/telemetry/preferences";

export function AnalyticsPreferenceCard() {
  const [optedOut, setOptedOut] = useState(() => getAnalyticsOptOut());

  return (
    <section className={styles.card}>
      <h2 className={commonStyles.panelTitle}>Privacy preferences</h2>
      <p className={styles.metaText}>
        Anonymous traffic analytics help measure route usage and performance. Browser Do Not Track is respected automatically.
      </p>
      <div className={styles.preferenceRow}>
        <div>
          <p className={styles.kvLabel}>Anonymous traffic analytics</p>
          <strong>{optedOut ? "Disabled" : "Enabled"}</strong>
        </div>
        <button
          type="button"
          className={optedOut ? styles.sidebarButton : styles.sidebarButtonActive}
          onClick={() => {
            const next = !optedOut;
            setOptedOut(next);
            setAnalyticsOptOut(next);
          }}
        >
          {optedOut ? "Enable tracking" : "Disable tracking"}
        </button>
      </div>
    </section>
  );
}
