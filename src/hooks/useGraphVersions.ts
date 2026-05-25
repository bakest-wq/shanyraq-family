import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { useFamilyPermissions } from '@/hooks/useFamilyPermissions';
import {
  canRestoreGraphVersion,
  graphVersionService,
} from '@/services/graph-version.service';
import { relativesService } from '@/services/relatives.service';
import type { GraphVersionEntry } from '@/types/graph-version';
import { resolveEditActor } from '@/utils/edit-actor';

type UseGraphVersionsOptions = {
  limit?: number;
  includeSafety?: boolean;
};

export function useGraphVersions(options: UseGraphVersionsOptions = {}) {
  const { familyId, session } = useFamilyContext();
  const { canEdit } = useFamilyPermissions();
  const [versions, setVersions] = useState<GraphVersionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!familyId) {
      setVersions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const list = await graphVersionService.list(familyId, {
        limit: options.limit,
        includeSafety: options.includeSafety,
      });
      setVersions(list);
    } finally {
      setLoading(false);
    }
  }, [familyId, options.includeSafety, options.limit]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const restoreVersion = useCallback(
    async (versionId: string) => {
      if (!familyId || !canEdit) {
        return null;
      }

      const actor = resolveEditActor(session);
      return graphVersionService.restoreVersion(familyId, versionId, actor);
    },
    [canEdit, familyId, session],
  );

  return {
    versions,
    loading,
    refresh,
    restoreVersion,
    canRestore: canEdit,
    canRestoreVersion: (entry: GraphVersionEntry) => canRestoreGraphVersion(entry.kind),
  };
}

/** Record graph version after a mutation — fetches fresh relatives for comparison. */
export async function recordGraphVersionAfterMutation(input: {
  familyId: string;
  actor: ReturnType<typeof resolveEditActor>;
  beforeRelatives: Awaited<ReturnType<typeof relativesService.getAll>>;
  summary?: string;
  editEventId?: string;
}): Promise<void> {
  const afterRelatives = await relativesService.getAll(input.familyId);
  await graphVersionService.recordIfStructuralChange({
    familyId: input.familyId,
    actor: input.actor,
    beforeRelatives: input.beforeRelatives,
    afterRelatives,
    summary: input.summary,
    editEventId: input.editEventId,
  });
}
