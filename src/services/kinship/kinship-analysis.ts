import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';

import {
  buildKinshipIntelligenceMeta,
  scoreKinshipConfidence,
} from '@/services/kinship/kinship-confidence';
import {
  formatDisplayLabel,
  resolveKinshipResult,
  ROOT_PERSON_LABEL,
} from '@/services/kinship/kinship-labels';
import {
  getThreeJurtGroup,
} from '@/services/kinship/kinship-groups';
import { getKinshipPath } from '@/services/kinship/kinship-path';
import type { KinshipRelationshipSnapshot } from '@/services/kinship/kinship-cache.types';

/** Pure kinship compute — no cache. Used internally by the cache layer. */
export function computeKinshipRelationshipSnapshot(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipRelationshipSnapshot {
  if (relativeLinkIdsMatch(rootPerson.id, targetPerson.id)) {
    const label = resolveKinshipResult(rootPerson, targetPerson, allRelatives);

    return {
      label,
      cardLine: ROOT_PERSON_LABEL,
      confidence: 'high',
      jurtGroup: 'direct_family',
      path: [],
      meta: buildKinshipIntelligenceMeta(rootPerson, targetPerson, allRelatives, 0),
      structuralPathLength: 0,
    };
  }

  const label = resolveKinshipResult(rootPerson, targetPerson, allRelatives);
  const path = getKinshipPath(rootPerson, targetPerson, allRelatives);
  const structuralPathLength = path.length;
  const confidence = scoreKinshipConfidence(label, structuralPathLength);
  const jurtGroup = getThreeJurtGroup(rootPerson, targetPerson, allRelatives);

  return {
    label,
    cardLine: formatDisplayLabel(label, structuralPathLength),
    confidence,
    jurtGroup,
    path,
    meta: buildKinshipIntelligenceMeta(
      rootPerson,
      targetPerson,
      allRelatives,
      structuralPathLength,
    ),
    structuralPathLength,
  };
}
