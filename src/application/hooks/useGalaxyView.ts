import { useCallback, useState } from "react";
import { mapStarApiToDomain, mapStarDomainToView } from "../../domain/star/mappers";
import { mapSystemApiToDomain, mapSystemDomainToView } from "../../domain/system/mappers";
import { galaxyApi } from "../../infra/api/galaxy.api";
import { StarProps } from "../../types/star.types";
import { SystemProps } from "../../types/system.types";

export type GalaxyViewNode = {
  system: SystemProps;
  mainStar: StarProps | null;
  stars: StarProps[];
};

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export const useGalaxyView = () => {
  const [systems, setSystems] = useState<GalaxyViewNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGalaxyView = useCallback(async (galaxyId: string): Promise<GalaxyViewNode[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const pageSize = 40;
      const loaded: GalaxyViewNode[] = [];
      const seen = new Set<string>();
      let offset = 0;
      let total = Number.POSITIVE_INFINITY;
      let lastLoadedCount = -1;

      while (loaded.length < total && loaded.length !== lastLoadedCount) {
        const page = await galaxyApi.populate(galaxyId, { limit: pageSize, offset });
        total = typeof page.total === "number" ? page.total : total;
        lastLoadedCount = loaded.length;

        for (const systemNode of page.systems) {
          if (seen.has(systemNode.system.id)) continue;
          seen.add(systemNode.system.id);

          const system = mapSystemDomainToView(mapSystemApiToDomain(systemNode.system));
          const stars = systemNode.stars.map((item) => mapStarDomainToView(mapStarApiToDomain(item)));
          const mainStar = stars.find((star) => star.isMain) ?? stars[0] ?? null;
          loaded.push({ system, stars, mainStar });
        }

        if (page.systems.length < pageSize) break;
        offset += pageSize;
      }

      setSystems(loaded);
      return loaded;
    } catch (err: unknown) {
      setError(toErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearGalaxyView = useCallback(() => {
    setSystems([]);
    setError(null);
  }, []);

  return {
    systems,
    isLoading,
    error,
    loadGalaxyView,
    clearGalaxyView,
  };
};
