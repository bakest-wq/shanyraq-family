import { useCallback, useEffect, useState } from 'react';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { useRelativesContext } from '@/providers/RelativesProvider';
import { testFamilySeedService } from '@/services/test-family-seed.service';

export function useTestFamilySeed() {
  const { familyId } = useFamilyContext();
  const { refetch } = useRelativesContext();
  const [hasSeed, setHasSeed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!familyId) {
      setHasSeed(false);
      return;
    }

    setHasSeed(await testFamilySeedService.hasSeed(familyId));
  }, [familyId]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const seedTestFamily = useCallback(async () => {
    if (!familyId || busy) {
      return null;
    }

    setBusy(true);
    setError(null);

    try {
      const result = await testFamilySeedService.seed(familyId);
      await refetch();
      await refreshStatus();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Тест отбасын құру сәтсіз аяқталды.';
      setError(message);
      throw new Error(message);
    } finally {
      setBusy(false);
    }
  }, [busy, familyId, refetch, refreshStatus]);

  const clearTestFamily = useCallback(async () => {
    if (!familyId || busy) {
      return null;
    }

    setBusy(true);
    setError(null);

    try {
      const result = await testFamilySeedService.clear(familyId);
      await refetch();
      await refreshStatus();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Тест деректерін тазарту сәтсіз аяқталды.';
      setError(message);
      throw new Error(message);
    } finally {
      setBusy(false);
    }
  }, [busy, familyId, refetch, refreshStatus]);

  return {
    hasSeed,
    busy,
    error,
    seedTestFamily,
    clearTestFamily,
    refreshStatus,
  };
}
