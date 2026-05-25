import type { Relative } from '@/types/relative';
import {
  getKinshipCardLine as getKinshipCardLineFromService,
  getKinshipExplanation,
  getKinshipExplanationBetween,
  getKinshipLabel as getKinshipLabelFromService,
} from '@/services/kinship.service';
import { formatKinshipBadge, formatKinshipCardLine } from '@/utils/kinship/labels.kz';
import { formatKinshipDetailSummary } from '@/utils/kinship/kinship-display';
import type { KinshipResult } from '@/utils/kinship/types';

/** @see kinshipService.getKinshipLabel */
export function getKinshipLabel(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipResult {
  return getKinshipLabelFromService(rootPerson, targetPerson, allRelatives);
}

/** @see kinshipService.getKinshipCardLine */
export function getKinshipCardLine(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): string {
  return getKinshipCardLineFromService(rootPerson, targetPerson, allRelatives);
}

export function getKinshipShortExplanation(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): string {
  return formatKinshipDetailSummary(
    getKinshipExplanationBetween(rootPerson, targetPerson, allRelatives),
  );
}

export function getKinshipDetailExplanation(
  anchorPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): string {
  return formatKinshipDetailSummary(
    getKinshipExplanation(anchorPerson, targetPerson, allRelatives),
  );
}

export function getKinshipBadge(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): string {
  return formatKinshipBadge(getKinshipLabel(rootPerson, targetPerson, allRelatives));
}

export { formatKinshipCardLine, formatKinshipBadge };
