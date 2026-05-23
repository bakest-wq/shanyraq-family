import { Relative } from '@/types/relative';
import { FamilyLinkValues } from '@/utils/family-link-validation';
import { findRelativeById, relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { isSiblingRelationship } from '@/utils/relationship-presets';
import { buildSiblingRelationshipSync } from '@/utils/sibling-relationship-sync';

export type SiblingCandidate = Relative & {
  hasSharedParents: boolean;
};

export type SiblingParentCopyOffer = {
  title: string;
  message: string;
  subjectPatch: Partial<FamilyLinkValues>;
  siblingPatch: Partial<FamilyLinkValues>;
  copyToSubject: boolean;
  copyToSibling: boolean;
};

export function areSharedParentSiblings(left: Relative, right: Relative): boolean {
  return sharesLinkedParentWithRoot(left, right);
}

export function sharesLinkedParentWithRoot(rootPerson: Relative, candidate: Relative): boolean {
  if (relativeLinkIdsMatch(candidate.id, rootPerson.id)) {
    return false;
  }

  const sharedFather = relativeLinkIdsMatch(rootPerson.fatherId, candidate.fatherId);
  const sharedMother = relativeLinkIdsMatch(rootPerson.motherId, candidate.motherId);

  return sharedFather || sharedMother;
}

export function getSharedParentSiblingIds(relative: Relative, relatives: Relative[]): Set<string> {
  return new Set(
    relatives
      .filter((candidate) => sharesLinkedParentWithRoot(relative, candidate))
      .map((candidate) => candidate.id),
  );
}

export function hasSharedParentWith(
  subjectLinks: FamilyLinkValues,
  candidate: Relative,
): boolean {
  const sharedFather = relativeLinkIdsMatch(subjectLinks.fatherId, candidate.fatherId);
  const sharedMother = relativeLinkIdsMatch(subjectLinks.motherId, candidate.motherId);

  return sharedFather || sharedMother;
}

export function buildSiblingLinkCandidates(
  relatives: Relative[],
  subjectId?: string,
  subjectLinks: FamilyLinkValues = {},
): SiblingCandidate[] {
  const blockedIds = new Set<string>();

  if (subjectId) {
    blockedIds.add(subjectId);
  }

  return relatives
    .filter((relative) => !relative.isDeceased)
    .filter((relative) => !blockedIds.has(relative.id))
    .filter((relative) => relative.id !== subjectId)
    .map((relative) => ({
      ...relative,
      hasSharedParents: hasSharedParentWith(subjectLinks, relative),
    }))
    .sort((a, b) => {
      if (a.hasSharedParents !== b.hasSharedParents) {
        return a.hasSharedParents ? -1 : 1;
      }

      return getRelativeDisplayName(a).localeCompare(getRelativeDisplayName(b), 'ru');
    });
}

export function filterSiblingLinkCandidates(
  candidates: SiblingCandidate[],
  searchQuery = '',
): SiblingCandidate[] {
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

export function buildSiblingParentCopyOffer(
  subjectLinks: FamilyLinkValues,
  sibling: Relative,
  subjectId?: string,
): SiblingParentCopyOffer | null {
  const plan = buildSiblingRelationshipSync(subjectId, subjectLinks, sibling);

  if (!plan.copyToSubject && !plan.copyToSibling && !plan.removesInvalidChildLink) {
    return null;
  }

  return {
    title: plan.confirmationTitle,
    message: plan.confirmationMessage,
    subjectPatch: plan.subjectPatch,
    siblingPatch: plan.siblingPatch,
    copyToSubject: plan.copyToSubject,
    copyToSibling: plan.copyToSibling,
  };
}

export function findMatchingSiblingId(
  relatives: Relative[],
  subjectId: string | undefined,
  subjectLinks: FamilyLinkValues,
): string | null {
  if (!subjectLinks.fatherId && !subjectLinks.motherId) {
    return null;
  }

  const match = buildSiblingLinkCandidates(relatives, subjectId, subjectLinks).find(
    (candidate) =>
      candidate.hasSharedParents &&
      candidate.fatherId === (subjectLinks.fatherId ?? undefined) &&
      candidate.motherId === (subjectLinks.motherId ?? undefined),
  );

  return match?.id ?? null;
}

export function isSiblingCandidate(relative: Relative): boolean {
  return isSiblingRelationship(relative.relationship);
}
