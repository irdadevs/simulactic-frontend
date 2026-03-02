import { useCallback, useState } from "react";
import { mapStarApiToDomain, mapStarDomainToView } from "../../domain/star/mappers";
import {
  ChangeStarMainRequest,
  ChangeStarNameRequest,
  ChangeStarOrbitalRequest,
  ChangeStarStarterOrbitalRequest,
  starApi,
} from "../../infra/api/star.api";
import { StarProps } from "../../types/star.types";

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
};

export const useStars = () => {
  const [stars, setStars] = useState<StarProps[]>([]);
  const [selectedStar, setSelectedStar] = useState<StarProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withLoading = useCallback(async <T,>(work: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      return await work();
    } catch (err: unknown) {
      setError(toErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listBySystem = useCallback(
    (systemId: string) =>
      withLoading(async () => {
        const result = await starApi.listBySystem(systemId);
        const rows = result.rows.map((row) => mapStarDomainToView(mapStarApiToDomain(row)));
        setStars(rows);
        return { rows, total: result.total };
      }),
    [withLoading],
  );

  const findById = useCallback(
    (id: string) =>
      withLoading(async () => {
        const result = await starApi.findById(id);
        if (!result) {
          setSelectedStar(null);
          return null;
        }
        const mapped = mapStarDomainToView(mapStarApiToDomain(result));
        setSelectedStar(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const findByName = useCallback(
    (name: string) =>
      withLoading(async () => {
        const result = await starApi.findByName(name);
        if (!result) {
          setSelectedStar(null);
          return null;
        }
        const mapped = mapStarDomainToView(mapStarApiToDomain(result));
        setSelectedStar(mapped);
        return mapped;
      }),
    [withLoading],
  );

  const changeName = useCallback(
    (id: string, body: ChangeStarNameRequest) =>
      withLoading(async () => {
        await starApi.changeName(id, body);
        setStars((prev) => prev.map((item) => (item.id === id ? { ...item, name: body.name } : item)));
        setSelectedStar((prev) => (prev && prev.id === id ? { ...prev, name: body.name } : prev));
      }),
    [withLoading],
  );

  const changeMain = useCallback(
    (id: string, body: ChangeStarMainRequest) =>
      withLoading(async () => {
        await starApi.changeMain(id, body);
        setStars((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isMain: body.isMain } : item)),
        );
        setSelectedStar((prev) =>
          prev && prev.id === id ? { ...prev, isMain: body.isMain } : prev,
        );
      }),
    [withLoading],
  );

  const changeOrbital = useCallback(
    (id: string, body: ChangeStarOrbitalRequest) =>
      withLoading(async () => {
        await starApi.changeOrbital(id, body);
        setStars((prev) =>
          prev.map((item) => (item.id === id ? { ...item, orbital: body.orbital } : item)),
        );
        setSelectedStar((prev) =>
          prev && prev.id === id ? { ...prev, orbital: body.orbital } : prev,
        );
      }),
    [withLoading],
  );

  const changeStarterOrbital = useCallback(
    (id: string, body: ChangeStarStarterOrbitalRequest) =>
      withLoading(async () => {
        await starApi.changeStarterOrbital(id, body);
        setStars((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, orbitalStarter: body.orbitalStarter } : item,
          ),
        );
        setSelectedStar((prev) =>
          prev && prev.id === id ? { ...prev, orbitalStarter: body.orbitalStarter } : prev,
        );
      }),
    [withLoading],
  );

  return {
    stars,
    selectedStar,
    isLoading,
    error,
    listBySystem,
    findById,
    findByName,
    changeName,
    changeMain,
    changeOrbital,
    changeStarterOrbital,
  };
};
