import { useMemo } from 'react';

import { useRootPersonIdentity } from '@/hooks/useRootPersonIdentity';
import { useRelatives } from '@/hooks/useRelatives';
import { buildFamilyStorySnapshot } from '@/services/family-story/family-story.service';
import type { FamilyStorySnapshot } from '@/services/family-story/family-story.types';
import type { Relative } from '@/types/relative';

/** Optional warm narrative for profile — hidden when graph link is uncertain. */
export function useFamilyStoryFromRoot(
  targetPerson: Relative | null | undefined,
): FamilyStorySnapshot | null {
  const { rootPerson, isReady } = useRootPersonIdentity();
  const { relatives } = useRelatives();

  return useMemo(() => {
    if (!isReady || !rootPerson || !targetPerson) {
      return null;
    }

    return buildFamilyStorySnapshot(rootPerson, targetPerson, relatives);
  }, [isReady, relatives, rootPerson, targetPerson]);
}
