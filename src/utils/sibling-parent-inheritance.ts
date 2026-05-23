import type { Relative } from '@/types/relative';
import { findRelativeByLinkId, relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { findFamilyAnchor } from '@/utils/kinship-path';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { isSiblingRelationship } from '@/utils/relationship-presets';

export type SiblingParentLinks = {
  fatherId?: string | null;
  motherId?: string | null;
};

export type SiblingParentInheritanceOffer = {
  referencePerson: Relative;
  fatherId: string | null;
  motherId: string | null;
  fatherName: string | null;
  motherName: string | null;
};

export type SiblingParentInheritanceContext = {
  relatives: Relative[];
  editingRelativeId?: string;
  focusedRootId?: string | null;
};

function isValidInheritedParentId(
  parentId: string | null | undefined,
  targetRelativeId?: string,
): parentId is string {
  if (!parentId) {
    return false;
  }

  if (targetRelativeId && relativeLinkIdsMatch(parentId, targetRelativeId)) {
    return false;
  }

  return true;
}

export function resolveSiblingInheritanceReference(
  context: SiblingParentInheritanceContext,
): Relative | null {
  const { relatives, editingRelativeId, focusedRootId } = context;
  const orderedCandidates: Relative[] = [];

  if (focusedRootId) {
    const focusedRoot = findRelativeByLinkId(relatives, focusedRootId);
    if (focusedRoot) {
      orderedCandidates.push(focusedRoot);
    }
  }

  const anchor = findFamilyAnchor(relatives);
  if (anchor && !orderedCandidates.some((person) => relativeLinkIdsMatch(person.id, anchor.id))) {
    orderedCandidates.push(anchor);
  }

  for (const candidate of orderedCandidates) {
    if (editingRelativeId && relativeLinkIdsMatch(candidate.id, editingRelativeId)) {
      continue;
    }

    return candidate;
  }

  return null;
}

export function referencePersonHasParents(referencePerson: Relative | null): boolean {
  return Boolean(referencePerson?.fatherId || referencePerson?.motherId);
}

export function buildSiblingParentInheritanceOffer(
  referencePerson: Relative,
  relatives: Relative[],
  targetLinks: SiblingParentLinks,
  targetRelativeId?: string,
): SiblingParentInheritanceOffer | null {
  const fatherId = isValidInheritedParentId(referencePerson.fatherId, targetRelativeId)
    ? referencePerson.fatherId ?? null
    : null;
  const motherId = isValidInheritedParentId(referencePerson.motherId, targetRelativeId)
    ? referencePerson.motherId ?? null
    : null;

  if (!fatherId && !motherId) {
    return null;
  }

  const fatherMatches = fatherId
    ? relativeLinkIdsMatch(targetLinks.fatherId, fatherId)
    : !targetLinks.fatherId;
  const motherMatches = motherId
    ? relativeLinkIdsMatch(targetLinks.motherId, motherId)
    : !targetLinks.motherId;

  if (fatherMatches && motherMatches) {
    return null;
  }

  const father = fatherId ? findRelativeByLinkId(relatives, fatherId) : null;
  const mother = motherId ? findRelativeByLinkId(relatives, motherId) : null;

  return {
    referencePerson,
    fatherId,
    motherId,
    fatherName: father ? getRelativeDisplayName(father) : null,
    motherName: mother ? getRelativeDisplayName(mother) : null,
  };
}

export function shouldSuggestSiblingParentInheritance(
  relationship: string,
  context: SiblingParentInheritanceContext,
  targetLinks: SiblingParentLinks,
): {
  referencePerson: Relative | null;
  offer: SiblingParentInheritanceOffer | null;
  missingReferenceParents: boolean;
} {
  if (!isSiblingRelationship(relationship)) {
    return {
      referencePerson: null,
      offer: null,
      missingReferenceParents: false,
    };
  }

  const referencePerson = resolveSiblingInheritanceReference(context);

  if (!referencePerson) {
    return {
      referencePerson: null,
      offer: null,
      missingReferenceParents: false,
    };
  }

  if (!referencePersonHasParents(referencePerson)) {
    return {
      referencePerson,
      offer: null,
      missingReferenceParents: true,
    };
  }

  return {
    referencePerson,
    offer: buildSiblingParentInheritanceOffer(
      referencePerson,
      context.relatives,
      targetLinks,
      context.editingRelativeId,
    ),
    missingReferenceParents: false,
  };
}

export function formatInheritedParentsSummary(offer: SiblingParentInheritanceOffer): string {
  const parts = [offer.fatherName, offer.motherName].filter(Boolean);

  if (parts.length === 0) {
    return '—';
  }

  return parts.join(' · ');
}
