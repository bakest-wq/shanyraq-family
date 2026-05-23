import { Relative, RelativeGender } from '@/types/relative';
import { getAncestorIds } from '@/utils/family-link-validation';
import { findRelativeById } from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { isParentRelationship } from '@/utils/relationship-presets';

export type ParentLinkRole = 'father' | 'mother';

export function resolveParentLinkRole(
  gender?: RelativeGender,
  relationship?: string,
): ParentLinkRole | null {
  if (relationship === 'Әке') {
    return 'father';
  }

  if (relationship === 'Ана') {
    return 'mother';
  }

  if (gender === 'male') {
    return 'father';
  }

  if (gender === 'female') {
    return 'mother';
  }

  return null;
}

export function shouldShowChildrenLinkSection(relationship: string): boolean {
  return isParentRelationship(relationship);
}

export function getChildrenLinkedToParent(
  parentId: string,
  relatives: Relative[],
  role: ParentLinkRole,
): Relative[] {
  return relatives
    .filter((relative) =>
      role === 'father' ? relative.fatherId === parentId : relative.motherId === parentId,
    )
    .sort((a, b) => getRelativeDisplayName(a).localeCompare(getRelativeDisplayName(b), 'ru'));
}

export function getLinkedChildIdsForParent(
  parentId: string,
  relatives: Relative[],
  role: ParentLinkRole,
): string[] {
  return getChildrenLinkedToParent(parentId, relatives, role).map((child) => child.id);
}

export function buildChildLinkCandidates(
  relatives: Relative[],
  parentId?: string,
): Relative[] {
  const blockedIds = new Set<string>();

  if (parentId) {
    blockedIds.add(parentId);
    getAncestorIds(parentId, relatives).forEach((id) => blockedIds.add(id));
  }

  return relatives
    .filter((relative) => !relative.isDeceased)
    .filter((relative) => !blockedIds.has(relative.id))
    .sort((a, b) => getRelativeDisplayName(a).localeCompare(getRelativeDisplayName(b), 'ru'));
}

export function filterChildLinkCandidates(
  candidates: Relative[],
  searchQuery = '',
): Relative[] {
  const query = searchQuery.trim().toLowerCase();

  if (!query) {
    return candidates;
  }

  return candidates.filter((candidate) => {
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

export function validateChildLinkSelection(
  childId: string,
  parentId: string | undefined,
  relatives: Relative[],
): string | null {
  if (parentId && childId === parentId) {
    return 'Адам өзін бала ретінде таңдай алмайды · Cannot select self as child';
  }

  if (parentId && getAncestorIds(parentId, relatives).has(childId)) {
    return 'Ата-ананы бала ретінде таңдауға болмайды · Ancestor cannot be a child';
  }

  if (!findRelativeById(relatives, childId)) {
    return 'Туыс табылмады · Relative not found';
  }

  return null;
}

export function hasChildLinkChanges(
  selectedChildIds: string[],
  parentId: string,
  relatives: Relative[],
  role: ParentLinkRole,
): boolean {
  const currentIds = getLinkedChildIdsForParent(parentId, relatives, role).sort();
  const nextIds = [...selectedChildIds].sort();

  if (currentIds.length !== nextIds.length) {
    return true;
  }

  return currentIds.some((id, index) => id !== nextIds[index]);
}
