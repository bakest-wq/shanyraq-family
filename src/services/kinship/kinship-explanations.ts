import type { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { classifyKinship } from '@/utils/kinship/classify';
import { GENDER_HINT_KZ } from '@/utils/kinship/labels.kz';
import type { KinshipExplanation } from '@/services/kinship/types';
import {
  resolveConfidenceSafeExplanation,
  resolveConfidenceSafeLabel,
  scoreKinshipConfidence,
} from '@/services/kinship/kinship-confidence';
import { buildHumanKinshipExplanation } from '@/services/kinship/kinship-human-explanation';
import { getRelationshipPathHopCount } from '@/services/kinship/relationship-path.engine';

function buildExplanation(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
  toMe: boolean,
): KinshipExplanation {
  const result = classifyKinship(rootPerson, targetPerson, allRelatives);
  const rootName = getRelativeDisplayName(rootPerson);
  const structuralPathLength = getRelationshipPathHopCount(rootPerson, targetPerson, allRelatives);
  const confidence = scoreKinshipConfidence(result, structuralPathLength);
  const summary = buildHumanKinshipExplanation(result, toMe, rootName);

  return {
    title: resolveConfidenceSafeLabel(result, confidence),
    summary: resolveConfidenceSafeExplanation(summary, result, confidence),
    pathText: '',
    hint: result.missingGenderHint ? GENDER_HINT_KZ : undefined,
    result,
  };
}

/** Warm Kazakh explanation — WHY this relationship exists from root's view. */
export function getKinshipExplanation(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipExplanation {
  return buildExplanation(rootPerson, targetPerson, allRelatives, true);
}

/** Third-person explanation for relationship explorer. */
export function getKinshipExplanationBetween(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipExplanation {
  return buildExplanation(rootPerson, targetPerson, allRelatives, false);
}

/** @deprecated Use getKinshipExplanation */
export const explainKinshipToMe = getKinshipExplanation;

/** @deprecated Use getKinshipExplanationBetween */
export const explainKinship = getKinshipExplanationBetween;
