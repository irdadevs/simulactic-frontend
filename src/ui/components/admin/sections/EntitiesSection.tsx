import commonStyles from "../../../../styles/skeleton.module.css";
import styles from "../../../../styles/admin.module.css";
import { GalaxyShapeValue } from "../../../../types/galaxy.types";
import { AdminPagination } from "../AdminPagination";
import { AdminSectionStateNotice } from "../AdminSectionStateNotice";

type GalaxyRow = {
  id: string;
  name: string;
  shape: GalaxyShapeValue;
  systemCount: number;
};

type GalaxyCounts = {
  systems: number;
  stars: number;
  planets: number;
  moons: number;
  asteroids: number;
};

type EntitiesSectionProps = {
  galaxiesFilteredCount: number;
  totalGalaxies: number;
  entitySearch: string;
  shape: "all" | GalaxyShapeValue;
  onEntitySearchChange: (value: string) => void;
  onShapeChange: (value: "all" | GalaxyShapeValue) => void;
  onRefreshCounts: () => void;
  entityGlobalCards: {
    galaxies: number;
    systems: number;
    stars: number;
    planets: number;
    moons: number;
    asteroids: number;
  };
  loading: boolean;
  error: string | null;
  entitiesVisible: GalaxyRow[];
  galaxyCounts: Record<string, GalaxyCounts>;
  entitiesPageSafe: number;
  entitiesTotalPages: number;
  summary: string;
  onPrevPage: () => void;
  onNextPage: () => void;
  onFocusGalaxy: (galaxyId: string) => void;
};

export function EntitiesSection(props: EntitiesSectionProps) {
  return (
    <section className={styles.sectionGrid}>
      <article className={styles.card}>
        <div className={styles.rowBetween}>
          <h2 className={commonStyles.panelTitle}>Galaxies ({props.galaxiesFilteredCount} / {props.totalGalaxies})</h2>
          <button className={styles.exportButton} onClick={props.onRefreshCounts}>Refresh counts</button>
        </div>
        <div className={styles.filtersGrid}>
          <div className={styles.filterField}>
            <label>Search</label>
            <input value={props.entitySearch} onChange={(event) => props.onEntitySearchChange(event.target.value)} />
          </div>
          <div className={styles.filterField}>
            <label>Shape</label>
            <select
              value={props.shape}
              onChange={(event) => props.onShapeChange(event.target.value as "all" | GalaxyShapeValue)}
            >
              <option value="all">All</option>
              <option value="spherical">Spherical</option>
              <option value="3-arm spiral">3-arm spiral</option>
              <option value="5-arm spiral">5-arm spiral</option>
              <option value="irregular">Irregular</option>
            </select>
          </div>
        </div>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}><span>Total galaxies</span><strong>{props.entityGlobalCards.galaxies}</strong></div>
          <div className={styles.summaryCard}><span>Total systems</span><strong>{props.entityGlobalCards.systems}</strong></div>
          <div className={styles.summaryCard}><span>Total stars</span><strong>{props.entityGlobalCards.stars}</strong></div>
          <div className={styles.summaryCard}><span>Total planets</span><strong>{props.entityGlobalCards.planets}</strong></div>
          <div className={styles.summaryCard}><span>Total moons</span><strong>{props.entityGlobalCards.moons}</strong></div>
          <div className={styles.summaryCard}><span>Total asteroids</span><strong>{props.entityGlobalCards.asteroids}</strong></div>
        </div>
        <AdminSectionStateNotice
          loading={props.loading}
          error={props.error}
          empty={props.galaxiesFilteredCount === 0}
          emptyMessage="No galaxies match the current filters."
        />
        <AdminPagination
          currentPage={props.entitiesPageSafe}
          totalPages={props.entitiesTotalPages}
          onPrev={props.onPrevPage}
          onNext={props.onNextPage}
          summary={props.summary}
        />
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Shape</th>
                <th>Systems</th>
                <th>Stars</th>
                <th>Planets</th>
                <th>Moons</th>
                <th>Asteroids</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {props.entitiesVisible.map((galaxy) => (
                <tr key={galaxy.id}>
                  <td>{galaxy.name}</td>
                  <td>{galaxy.shape}</td>
                  <td>{props.galaxyCounts[galaxy.id]?.systems ?? galaxy.systemCount}</td>
                  <td>{props.galaxyCounts[galaxy.id]?.stars ?? "-"}</td>
                  <td>{props.galaxyCounts[galaxy.id]?.planets ?? "-"}</td>
                  <td>{props.galaxyCounts[galaxy.id]?.moons ?? "-"}</td>
                  <td>{props.galaxyCounts[galaxy.id]?.asteroids ?? "-"}</td>
                  <td>
                    <button className={styles.exportButton} onClick={() => props.onFocusGalaxy(galaxy.id)}>
                      Go to
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminPagination
          currentPage={props.entitiesPageSafe}
          totalPages={props.entitiesTotalPages}
          onPrev={props.onPrevPage}
          onNext={props.onNextPage}
          centered
        />
      </article>
    </section>
  );
}
