import { useCallback, useEffect, useMemo, useState } from 'react';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { useRelatives } from '@/hooks/useRelatives';
import { recentPeopleService } from '@/services/recent-people.service';
import type { Relative } from '@/types/relative';

export function useRecentPeople() {
  const { familyId } = useFamilyContext();
  const { relatives } = useRelatives();
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const refreshRecent = useCallback(async () => {
    if (!familyId) {
      setRecentIds([]);
      return;
    }

    const ids = await recentPeopleService.getRecentIds(familyId);
    setRecentIds(ids);
  }, [familyId]);

  useEffect(() => {
    void refreshRecent();
  }, [refreshRecent, relatives.length]);

  const recordView = useCallback(
    async (relativeId: string) => {
      if (!familyId || !relativeId) {
        return;
      }

      const ids = await recentPeopleService.recordView(familyId, relativeId);
      setRecentIds(ids);
    },
    [familyId],
  );

  const recentPeople = useMemo(() => {
    const byId = new Map(relatives.map((relative) => [relative.id, relative]));

    return recentIds
      .map((id) => byId.get(id))
      .filter((relative): relative is Relative => Boolean(relative));
  }, [recentIds, relatives]);

  return {
    recentPeople,
    recordView,
    refreshRecent,
  };
}
