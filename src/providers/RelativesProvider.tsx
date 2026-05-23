import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { isSupabaseReady } from '@/lib/supabase';
import { useFamilyContext } from '@/providers/FamilyProvider';
import { relativesService } from '@/services/relatives.service';
import { Relative } from '@/types/relative';
import { filterDeceasedRelatives, filterLivingRelatives } from '@/utils/relative.mapper';

type RefetchOptions = {
  silent?: boolean;
};

type RelativesContextValue = {
  relatives: Relative[];
  livingRelatives: Relative[];
  deceasedRelatives: Relative[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  isConfigured: boolean;
  /** Increments whenever relatives are upserted or refetched. */
  relativesRevision: number;
  refetch: (options?: RefetchOptions) => Promise<void>;
  /** Alias for refetch — reload relatives from Supabase. */
  invalidateRelatives: (options?: RefetchOptions) => Promise<void>;
  upsertRelative: (relative: Relative) => void;
  upsertRelatives: (nextRelatives: Relative[]) => void;
};

const RelativesContext = createContext<RelativesContextValue | null>(null);

export function RelativesProvider({ children }: { children: React.ReactNode }) {
  const { familyId, isReady: familyReady } = useFamilyContext();
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relativesRevision, setRelativesRevision] = useState(0);
  const isConfigured = isSupabaseReady();

  const bumpRevision = useCallback(() => {
    setRelativesRevision((current) => current + 1);
  }, []);

  const refetch = useCallback(
    async (options?: RefetchOptions) => {
      if (!familyReady) {
        return;
      }

      if (!familyId) {
        setRelatives([]);
        setError(null);
        setLoading(false);
        return;
      }

      if (!isConfigured) {
        setRelatives([]);
        setError('Добавьте ключи Supabase в файл .env и перезапустите приложение.');
        setLoading(false);
        return;
      }

      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await relativesService.getAll(familyId);
        setRelatives(data);
        bumpRevision();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось загрузить родственников.';
        setError(message);
        setRelatives([]);
      } finally {
        setLoading(false);
      }
    },
    [bumpRevision, familyId, familyReady, isConfigured],
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const upsertRelative = useCallback((relative: Relative) => {
    setRelatives((current) => {
      const index = current.findIndex((item) => item.id === relative.id);
      if (index === -1) {
        return [...current, relative];
      }

      const next = [...current];
      next[index] = relative;
      return next;
    });
    bumpRevision();
  }, [bumpRevision]);

  const upsertRelatives = useCallback((nextRelatives: Relative[]) => {
    setRelatives((current) => {
      const byId = new Map(current.map((relative) => [relative.id, relative]));

      for (const relative of nextRelatives) {
        byId.set(relative.id, relative);
      }

      return Array.from(byId.values());
    });
    bumpRevision();
  }, [bumpRevision]);

  const value = useMemo<RelativesContextValue>(
    () => ({
      relatives,
      livingRelatives: filterLivingRelatives(relatives),
      deceasedRelatives: filterDeceasedRelatives(relatives),
      loading,
      error,
      isEmpty: !loading && !error && relatives.length === 0,
      isConfigured,
      relativesRevision,
      refetch,
      invalidateRelatives: refetch,
      upsertRelative,
      upsertRelatives,
    }),
    [
      relatives,
      loading,
      error,
      isConfigured,
      relativesRevision,
      refetch,
      upsertRelative,
      upsertRelatives,
    ],
  );

  return <RelativesContext.Provider value={value}>{children}</RelativesContext.Provider>;
}

export function useRelativesContext(): RelativesContextValue {
  const context = useContext(RelativesContext);
  if (!context) {
    throw new Error('useRelativesContext must be used within RelativesProvider.');
  }
  return context;
}
