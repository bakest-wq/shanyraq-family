import { Relative, RelativeGender } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';

export type FamilyLinkType = 'father' | 'mother' | 'spouse';

export type FamilyPickerKind = FamilyLinkType | 'child' | 'sibling';

export function matchesGenderForFamilyLink(
  candidate: Relative,
  linkType: FamilyLinkType,
  subjectGender?: RelativeGender,
): boolean {
  if (!candidate.gender) {
    return true;
  }

  if (linkType === 'father') {
    return candidate.gender === 'male';
  }

  if (linkType === 'mother') {
    return candidate.gender === 'female';
  }

  if (!subjectGender) {
    return true;
  }

  if (subjectGender === 'male') {
    return candidate.gender === 'female';
  }

  if (subjectGender === 'female') {
    return candidate.gender === 'male';
  }

  return true;
}

export function filterFamilyLinkCandidates(
  candidates: Relative[],
  linkType: FamilyLinkType,
  subjectGender?: RelativeGender,
  searchQuery = '',
): Relative[] {
  const query = searchQuery.trim().toLowerCase();

  return candidates
    .filter((candidate) => matchesGenderForFamilyLink(candidate, linkType, subjectGender))
    .filter((candidate) => {
      if (!query) {
        return true;
      }

      const haystack = [
        getRelativeDisplayName(candidate),
        candidate.fullName,
        candidate.firstName,
        candidate.middleName,
        candidate.currentSurname,
        candidate.relationship,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
}

export function normalizeRelativeLinkId(id: string | null | undefined): string | null {
  if (id == null) {
    return null;
  }

  const trimmed = String(id).trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Canonical UUID/link id comparison for relatives lookups. */
export function relativeLinkIdsMatch(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  if (left == null || right == null) {
    return false;
  }

  return String(left).trim() === String(right).trim();
}

export function findRelativeByLinkId(
  relatives: Relative[],
  id?: string | null,
): Relative | null {
  const normalizedId = normalizeRelativeLinkId(id);
  if (!normalizedId) {
    return null;
  }

  return (
    relatives.find((relative) =>
      relativeLinkIdsMatch(relative.id, normalizedId),
    ) ?? null
  );
}

export function findRelativeById(relatives: Relative[], id?: string | null): Relative | null {
  return findRelativeByLinkId(relatives, id);
}

export function getFamilyLinkModalTitle(kind: FamilyPickerKind): string {
  if (kind === 'father') {
    return 'Әke таңдау · Выбрать отца';
  }

  if (kind === 'mother') {
    return 'Ana таңдау · Выбрать мать';
  }

  if (kind === 'spouse') {
    return 'Жұбай таңдау · Выбрать супруга(у)';
  }

  if (kind === 'child') {
    return 'Баланы таңдау · Выбрать ребёнка';
  }

  return 'Бауыр таңдау · Выбрать брата/сестру';
}

export function getFamilyLinkFieldLabel(kind: FamilyLinkType): string {
  if (kind === 'father') {
    return 'Әke · Отец';
  }

  if (kind === 'mother') {
    return 'Ana · Мать';
  }

  return 'Жұбай · Супруг(а)';
}
