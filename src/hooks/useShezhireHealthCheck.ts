import { useCallback, useMemo, useState } from 'react';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { useRelativesContext } from '@/providers/RelativesProvider';
import {
  collectRepairPatches,
  runShezhireHealthCheck,
  type ShezhireHealthCheckReport,
  type ShezhireRepairKind,
} from '@/services/graph-integrity.service';
import { relativesService } from '@/services/relatives.service';

export function useShezhireHealthCheck() {
  const { familyId } = useFamilyContext();
  const { relatives, invalidateRelatives } = useRelativesContext();
  const [repairing, setRepairing] = useState(false);

  const report = useMemo(
    (): ShezhireHealthCheckReport => runShezhireHealthCheck(relatives),
    [relatives],
  );

  const applyRepairs = useCallback(
    async (kinds: ShezhireRepairKind[]) => {
      if (!familyId || repairing) {
        return 0;
      }

      setRepairing(true);

      try {
        const applied = await relativesService.applyShezhireRepairs(familyId, kinds);
        await invalidateRelatives({ silent: true });
        return applied;
      } finally {
        setRepairing(false);
      }
    },
    [familyId, invalidateRelatives, repairing],
  );

  const applyAllSafeRepairs = useCallback(async () => {
    const kinds: ShezhireRepairKind[] = [];

    if (report.repairPlan.clearBrokenParents.length > 0) {
      kinds.push('clear_broken_parents');
    }

    if (report.repairPlan.syncSpouses.length > 0) {
      kinds.push('sync_spouses');
    }

    if (report.repairPlan.clearOrphanReferences.length > 0) {
      kinds.push('clear_orphan_references');
    }

    const uniqueKinds = [...new Set(kinds)];
    return applyRepairs(uniqueKinds);
  }, [applyRepairs, report.repairPlan]);

  const repairCounts = useMemo(
    () => ({
      clearBrokenParents: report.repairPlan.clearBrokenParents.length,
      syncSpouses: report.repairPlan.syncSpouses.length,
      clearOrphanReferences: report.repairPlan.clearOrphanReferences.length,
      total: collectRepairPatches(report.repairPlan, [
        'clear_broken_parents',
        'sync_spouses',
        'clear_orphan_references',
      ]).length,
    }),
    [report.repairPlan],
  );

  return {
    report,
    repairing,
    repairCounts,
    applyRepairs,
    applyAllSafeRepairs,
  };
}
