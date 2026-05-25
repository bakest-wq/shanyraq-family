import { useCallback, useMemo, useState } from 'react';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { useRelativesContext } from '@/providers/RelativesProvider';
import { useShezhireRootContext } from '@/providers/ShezhireRootProvider';
import { runFamilyIntelligenceHealthCheck } from '@/services/family-intelligence-health-check.service';
import { relativesService } from '@/services/relatives.service';
import type { HealthCheckIssueAction } from '@/utils/health-check-issues';
import { findRelativeByLinkId } from '@/utils/family-link-picker';
import { buildShezhireRootGraph } from '@/services/family-graph.service';

export function useShezhireHealthCheck() {
  const { familyId } = useFamilyContext();
  const { relatives, invalidateRelatives } = useRelativesContext();
  const { focusRootId, defaultRootId } = useShezhireRootContext();
  const [repairing, setRepairing] = useState(false);

  const report = useMemo(() => runFamilyIntelligenceHealthCheck(relatives), [relatives]);

  const unplacedRoot = useMemo(() => {
    const rootId = focusRootId ?? defaultRootId;
    if (!rootId) {
      return null;
    }

    return findRelativeByLinkId(relatives, rootId);
  }, [defaultRootId, focusRootId, relatives]);

  const unplacedRelatives = useMemo(() => {
    if (!unplacedRoot) {
      return [];
    }

    return buildShezhireRootGraph(unplacedRoot, relatives, { log: false }).unplacedCandidates;
  }, [relatives, unplacedRoot]);

  const applyIssueAction = useCallback(
    async (action: HealthCheckIssueAction): Promise<'navigate' | 'done'> => {
      if (!familyId || repairing) {
        return 'navigate';
      }

      if (
        action.type === 'connect_parents' ||
        action.type === 'edit_relative' ||
        action.type === 'review_duplicate'
      ) {
        return 'navigate';
      }

      setRepairing(true);

      try {
        if (action.type === 'clear_broken_parent') {
          await relativesService.patchRelativeLinks(
            action.relativeId,
            { [action.field]: null },
            familyId,
          );
        }

        if (action.type === 'sync_spouse') {
          const patch = report.repairPlan.syncSpouses.find(
            (entry) => entry.personId === action.relativeId,
          );

          if (patch) {
            await relativesService.patchRelativeLinks(
              action.relativeId,
              patch.patch,
              familyId,
            );
          }
        }

        await invalidateRelatives({ silent: true });
        return 'done';
      } finally {
        setRepairing(false);
      }
    },
    [familyId, invalidateRelatives, repairing, report.repairPlan.syncSpouses],
  );

  const applyAllSafeRepairs = useCallback(async (): Promise<number> => {
    if (!familyId || repairing) {
      return 0;
    }

    setRepairing(true);

    try {
      const applied = await relativesService.applyShezhireRepairs(familyId, [
        'clear_broken_parents',
        'sync_spouses',
        'clear_orphan_references',
      ]);

      await invalidateRelatives({ silent: true });
      return applied;
    } finally {
      setRepairing(false);
    }
  }, [familyId, invalidateRelatives, repairing]);

  return {
    report,
    repairing,
    unplacedRelatives,
    unplacedRoot,
    applyIssueAction,
    applyAllSafeRepairs,
  };
}
