import type { Relative } from '@/types/relative';
import { RELATIVE_PROFILE_COPY } from '@/constants/relative-profile-content';
import { formatRelativeBirthday } from '@/utils/birthday-parts';
import { calculateAge } from '@/utils/dates';

import {
  resolveFamilyRing,
  type FamilyRing,
} from '@/services/family-graph.service';

export type ProfileFamilyRing = FamilyRing;

/** @deprecated Use resolveFamilyRing from family-graph.service */
export const resolveProfileFamilyRing = resolveFamilyRing;

export function formatProfileBirthday(relative: Relative): string | null {
  const formatted = formatRelativeBirthday(relative);
  if (!formatted || formatted === '—') {
    return null;
  }

  return formatted.replace(' · Жыл белгісіз', '').trim();
}

export function formatProfileAgeLine(relative: Relative): string | null {
  const age = calculateAge(relative);
  if (age === null) {
    return null;
  }

  return `${age} ${RELATIVE_PROFILE_COPY.ageSuffix}`;
}

export function getShortFamilyInfo(relative: Relative): string | null {
  const parts = [
    relative.zhuz?.trim(),
    relative.ru?.trim(),
    relative.tribeBranch?.trim(),
  ].filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  return parts.join(' · ');
}

export function getShezhireHeaderLine(relative: Relative): string | null {
  return getShortFamilyInfo(relative);
}

export function getGenderLabel(gender?: Relative['gender']): string {
  if (gender === 'male') {
    return 'Ер';
  }

  if (gender === 'female') {
    return 'Әйел';
  }

  return '—';
}
