import commonStyles from "../../../styles/skeleton.module.css";
import styles from "../../../styles/me.module.css";
import { GalaxyProps } from "../../../types/galaxy.types";
import { GalaxyStats } from "../../../application/hooks/useMePageData";

type CreationsSectionProps = {
  creationOrder: "created" | "name" | "systems" | "stars";
  onCreationOrderChange: (value: "created" | "name" | "systems" | "stars") => void;
  galaxies: GalaxyProps[];
  totalStats: GalaxyStats;
  sortedGalaxies: GalaxyProps[];
  galaxyStats: Record<string, GalaxyStats>;
  toDate: (value: Date) => string;
};

export function CreationsSection(props: CreationsSectionProps) {
  return (
    <div className={styles.sectionGrid}>
      <section className={styles.card}>
        <div className={styles.rowBetween}>
          <h2 className={commonStyles.panelTitle}>My galaxy stats</h2>
          <div className={styles.inlineField}>
            <label htmlFor="creation-order">Order by</label>
            <select
              id="creation-order"
              value={props.creationOrder}
              onChange={(event) =>
                props.onCreationOrderChange(event.target.value as "created" | "name" | "systems" | "stars")
              }
            >
              <option value="created">Latest</option>
              <option value="name">Name</option>
              <option value="systems">Systems</option>
              <option value="stars">Stars</option>
            </select>
          </div>
        </div>

        <div className={styles.summaryGrid}>
          <article className={styles.summaryCard}><span>Galaxies</span><strong>{props.galaxies.length}</strong></article>
          <article className={styles.summaryCard}><span>Systems</span><strong>{props.totalStats.systems}</strong></article>
          <article className={styles.summaryCard}><span>Stars</span><strong>{props.totalStats.stars}</strong></article>
          <article className={styles.summaryCard}><span>Planets</span><strong>{props.totalStats.planets}</strong></article>
          <article className={styles.summaryCard}><span>Moons</span><strong>{props.totalStats.moons}</strong></article>
          <article className={styles.summaryCard}><span>Asteroids</span><strong>{props.totalStats.asteroids}</strong></article>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={commonStyles.panelTitle}>Galaxy list</h2>
        <div className={styles.listGrid}>
          {props.sortedGalaxies.map((galaxy) => {
            const stats = props.galaxyStats[galaxy.id];
            return (
              <article key={galaxy.id} className={styles.listCard}>
                <div className={styles.rowBetween}>
                  <h3 className={styles.cardTitle}>{galaxy.name}</h3>
                  <span className={styles.badge}>{galaxy.shape}</span>
                </div>
                <p className={styles.metaText}>Created {props.toDate(galaxy.createdAt)}</p>
                <div className={styles.detailGrid}>
                  <p>Systems: {stats?.systems ?? galaxy.systemCount}</p>
                  <p>Stars: {stats?.stars ?? "..."}</p>
                  <p>Planets: {stats?.planets ?? "..."}</p>
                  <p>Moons: {stats?.moons ?? "..."}</p>
                  <p>Asteroids: {stats?.asteroids ?? "..."}</p>
                </div>
              </article>
            );
          })}
          {props.sortedGalaxies.length === 0 ? <p className={styles.empty}>No galaxies yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
