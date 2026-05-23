import { Relative, RelativeGender } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';

export type FamilyLinkType = 'father' | 'mother' | 'spouse';

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

export function findRelativeById(relatives: Relative[], id?: string | null): Relative | null {
  if (!id) {
    return null;
  }

  return relatives.find((relative) => relative.id === id) ?? null;
}

export function getFamilyLinkModalTitle(linkType: FamilyLinkType): string {
  if (linkType === 'father') {
    return 'Әke таңдау · Выбрать отца';
  }

  if (linkType === 'mother') {
    return 'Аna таңдау · Выбрать мать';
  }

  return 'Жұбай таңдау · Выбрать супруга(у)';
}
