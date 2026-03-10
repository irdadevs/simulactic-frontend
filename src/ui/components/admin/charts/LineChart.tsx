import styles from "../../../../styles/admin.module.css";

export type LineChartPoint = {
  label: string;
  value: number;
};

type LineChartProps = {
  points: LineChartPoint[];
  maxTicks: number;
};

export function LineChart({ points, maxTicks }: LineChartProps) {
  const max = Math.max(1, ...points.map((point) => point.value));
  const width = 560;
  const height = 210;
  const pad = 20;
  const labelY = height - 8;
  const stepX = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
  const tickIndexes =
    points.length <= maxTicks
      ? points.map((_, index) => index)
      : Array.from(
          new Set(
            Array.from({ length: maxTicks }, (_, index) =>
              Math.round((index * (points.length - 1)) / (maxTicks - 1)),
            ),
          ),
        );
  const toY = (value: number) => height - pad - ((value / max) * (height - pad * 2));
  const polyline = points.map((point, index) => `${pad + index * stepX},${toY(point.value)}`).join(" ");

  return (
    <div className={styles.lineChartWrap}>
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.lineChartSvg} aria-hidden="true">
        <polyline points={polyline} className={styles.lineChartPath} />
        {points.map((point, index) => {
          const cx = pad + index * stepX;
          const cy = toY(point.value);
          return (
            <circle key={`${point.label}-${index}`} cx={cx} cy={cy} r={3} className={styles.lineChartPoint}>
              <title>{`${point.label}: ${point.value.toFixed(2)}`}</title>
            </circle>
          );
        })}
        {tickIndexes.map((pointIndex, tickIndex) => {
          const point = points[pointIndex];
          const x = pad + pointIndex * stepX;
          const textAnchor =
            tickIndex === 0 ? "start" : tickIndex === tickIndexes.length - 1 ? "end" : "middle";

          return (
            <text
              key={`${point.label}-${pointIndex}`}
              x={x}
              y={labelY}
              textAnchor={textAnchor}
              className={styles.lineChartAxisLabel}
            >
              {point.label}
            </text>
          );
        })}
      </svg>
      <div className={styles.lineChartCurrent}>
        Current: {points.length ? points[points.length - 1].value.toFixed(0) : "0"}
      </div>
    </div>
  );
}
