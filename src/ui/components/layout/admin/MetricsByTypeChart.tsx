"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from "../../../../styles/skeleton.module.css";
import { MetricsDashboardResponse } from "../../../../infra/api/metric.api";

type MetricsByTypeChartProps = {
  byType: MetricsDashboardResponse["byType"];
};

export function MetricsByTypeChart({ byType }: MetricsByTypeChartProps) {
  return (
    <section className={styles.adminCard}>
      <h2 className={styles.panelTitle}>By Type</h2>
      <div className={styles.adminChart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byType}>
            <CartesianGrid strokeDasharray="4 4" stroke="#28302c" />
            <XAxis dataKey="metricType" stroke="#9ba8a0" />
            <YAxis stroke="#9ba8a0" />
            <Tooltip />
            <Bar dataKey="avgDurationMs" fill="#2dc7b9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
