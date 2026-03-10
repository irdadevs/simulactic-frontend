import styles from "../../../../styles/admin.module.css";

type BarChartPoint = {
  label: string;
  value: number;
};

type BarChartProps = {
  points: BarChartPoint[];
};

export function BarChart({ points }: BarChartProps) {
  const max = Math.max(1, ...points.map((point) => point.value));

  return (
    <div className={styles.chartBars}>
      {points.map((point) => (
        <div key={point.label} className={styles.chartBarItem}>
          <div className={styles.chartBarTrack} title={`${point.label}: ${point.value.toFixed(2)}`}>
            <div className={styles.chartBarFill} style={{ height: `${(point.value / max) * 100}%` }} />
          </div>
          <span className={styles.chartLabel}>{point.label}</span>
        </div>
      ))}
    </div>
  );
}
