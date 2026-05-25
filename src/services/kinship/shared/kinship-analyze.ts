import type { Relative } from '@/types/relative';

import { kinshipCacheService } from '@/services/kinship/kinship-cache.service';
import type { AnalyzeKinshipResult } from '@/services/kinship/shared/kinship-types';

/** Pure analyze entry — no memory layer, safe for kinship-memory to import. */
export function analyzeKinship(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): AnalyzeKinshipResult {
  const snapshot = kinshipCacheService.getRelationshipSnapshot(
    rootPerson,
    targetPerson,
    allRelatives,
  );

  return {
    label: snapshot.label,
    cardLine: snapshot.cardLine,
    explanation: kinshipCacheService.getExplanation(
      rootPerson,
      targetPerson,
      allRelatives,
      true,
    ),
    confidence: snapshot.confidence,
    jurtGroup: snapshot.jurtGroup,
    path: snapshot.path,
    meta: snapshot.meta,
  };
}
