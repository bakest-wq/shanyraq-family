import type { Relative } from '@/types/relative';
import { classifyKinship } from '@/utils/kinship/classify';
import { formatKinshipBadge, formatKinshipCardLine } from '@/utils/kinship/labels.kz';
import type { KinshipResult } from '@/utils/kinship/types';

export function getKinshipLabel(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipResult {
  return classifyKinship(rootPerson, targetPerson, allRelatives);
}

export function getKinshipCardLine(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): string {
  return formatKinshipCardLine(getKinshipLabel(rootPerson, targetPerson, allRelatives));
}

export function getKinshipBadge(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): string {
  return formatKinshipBadge(getKinshipLabel(rootPerson, targetPerson, allRelatives));
}

export { formatKinshipCardLine, formatKinshipBadge };
