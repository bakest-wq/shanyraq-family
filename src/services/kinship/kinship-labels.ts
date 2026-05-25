import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getPrimaryKinshipResult } from '@/utils/kinship/classify';
import type { KinshipResult } from '@/services/kinship/types';
import {
  resolveConfidenceSafeLabel,
  scoreKinshipConfidence,
} from '@/services/kinship/kinship-confidence';
import { getRelationshipPathHopCount } from '@/services/kinship/relationship-path.engine';

export const ROOT_PERSON_LABEL = 'Орталық тұлға';

/** Core classification — labels are always computed, never stored. */
export function resolveKinshipResult(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipResult {
  return getPrimaryKinshipResult(rootPerson, targetPerson, allRelatives);
}

/** Precise internal label — prefer resolveConfidenceSafeLabel for UI. */
export function formatPreciseLabel(result: KinshipResult): string {
  if (result.type === 'unknown' || result.resolved === false) {
    return result.confidenceHint ?? result.label.kazakh;
  }

  return result.label.kazakh;
}

/** Confidence-aware label for cards, search, and lists. */
export function formatDisplayLabel(
  result: KinshipResult,
  structuralPathLength?: number,
): string {
  return resolveConfidenceSafeLabel(
    result,
    scoreKinshipConfidence(result, structuralPathLength),
  );
}

export function getKinshipCardLabel(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): string {
  if (relativeLinkIdsMatch(rootPerson.id, targetPerson.id)) {
    return ROOT_PERSON_LABEL;
  }

  const result = resolveKinshipResult(rootPerson, targetPerson, allRelatives);
  const structuralPathLength = getRelationshipPathHopCount(
    rootPerson,
    targetPerson,
    allRelatives,
  );

  return formatDisplayLabel(result, structuralPathLength);
}

export function getKinshipCardLine(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): string {
  return getKinshipCardLabel(rootPerson, targetPerson, allRelatives);
}
