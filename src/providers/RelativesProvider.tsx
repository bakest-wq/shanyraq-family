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
  refetch: (options?: RefetchOptions) => Promise<void>;
};

const RelativesContext = createContext<RelativesContextValue | null>(null);

export function RelativesProvider({ children }: { children: React.ReactNode }) {
  const { familyId, isReady: familyReady } = useFamilyContext();
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = isSupabaseReady();

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
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось загрузить родственников.';
        setError(message);
        setRelatives([]);
      } finally {
        setLoading(false);
      }
    },
    [familyId, familyReady, isConfigured],
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const value = useMemo<RelativesContextValue>(
    () => ({
      relatives,
      livingRelatives: filterLivingRelatives(relatives),
      deceasedRelatives: filterDeceasedRelatives(relatives),
      loading,
      error,
      isEmpty: !loading && !error && relatives.length === 0,
      isConfigured,
      refetch,
    }),
    [relatives, loading, error, isConfigured, refetch],
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
