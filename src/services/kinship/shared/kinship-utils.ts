import type { Relative } from '@/types/relative';
import type { KinshipType } from '@/utils/kinship/types';

import { KINSHIP_ROLE_PHRASES } from '@/services/kinship/shared/kinship-constants';

export function normalizeKinshipText(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function estimateRelativeAge(
  relative: Relative,
  referenceYear = new Date().getFullYear(),
): number | null {
  if (typeof relative.birthdayYear === 'number' && Number.isFinite(relative.birthdayYear)) {
    return referenceYear - relative.birthdayYear;
  }

  return null;
}

export function kinshipAgeGapYears(rootPerson: Relative, targetPerson: Relative): number | null {
  const rootAge = estimateRelativeAge(rootPerson);
  const targetAge = estimateRelativeAge(targetPerson);

  if (rootAge === null || targetAge === null) {
    return null;
  }

  return targetAge - rootAge;
}

export function kinshipRolePhrase(type: KinshipType, cardLine: string): string {
  return KINSHIP_ROLE_PHRASES[type] ?? cardLine.trim().toLowerCase();
}
