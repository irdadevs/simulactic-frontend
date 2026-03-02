import { useCallback, useState } from "react";
import { mapStarApiToDomain, mapStarDomainToView } from "../../domain/star/mappers";
import { mapSystemApiToDomain, mapSystemDomainToView } from "../../domain/system/mappers";
import { starApi } from "../../infra/api/star.api";
import { systemApi } from "../../infra/api/system.api";
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
      const systemsResult = await systemApi.listByGalaxy(galaxyId);
      const mappedSystems = systemsResult.rows.map((item) =>
        mapSystemDomainToView(mapSystemApiToDomain(item)),
      );

      const starLists = await Promise.all(
        mappedSystems.map((system) => starApi.listBySystem(system.id)),
      );

      const nodes = mappedSystems.map((system, index) => {
        const stars = starLists[index].rows.map((item) =>
          mapStarDomainToView(mapStarApiToDomain(item)),
        );
        const mainStar = stars.find((star) => star.isMain) ?? stars[0] ?? null;
        return { system, mainStar, stars };
      });

      setSystems(nodes);
      return nodes;
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
