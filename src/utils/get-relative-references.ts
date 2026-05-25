import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import type { GraphRepairPatch } from '@/utils/family-graph';
import { getRelativeDisplayName } from '@/utils/relative-names';

export type RelativeReferenceKind = 'father' | 'mother' | 'spouse';

export type RelativeReferenceLink = {
  relative: Relative;
  kind: RelativeReferenceKind;
  /** Calm Kazakh label for the structural link type. */
  label: string;
};

export type RelativeReferencesResult = {
  relativeId: string;
  links: RelativeReferenceLink[];
  hasReferences: boolean;
  referencingRelatives: Relative[];
  clearReferencePatches: GraphRepairPatch[];
};

const REFERENCE_LABELS: Record<RelativeReferenceKind, string> = {
  father: 'Әкesi',
  mother: 'Анасы',
  spouse: 'Жұбайы',
};

function dedupeRelatives(relatives: Relative[]): Relative[] {
  const seen = new Set<string>();

  return relatives.filter((relative) => {
    if (seen.has(relative.id)) {
      return false;
    }

    seen.add(relative.id);
    return true;
  });
}

export function buildClearReferencePatches(
  relativeId: string,
  referencers: Relative[],
): GraphRepairPatch[] {
  const patches: GraphRepairPatch[] = [];

  for (const referencer of referencers) {
    const patch: GraphRepairPatch['patch'] = {};

    if (relativeLinkIdsMatch(referencer.fatherId, relativeId)) {
      patch.fatherId = null;
    }

    if (relativeLinkIdsMatch(referencer.motherId, relativeId)) {
      patch.motherId = null;
    }

    if (relativeLinkIdsMatch(referencer.spouseId, relativeId)) {
      patch.spouseId = null;
    }

    if (Object.keys(patch).length > 0) {
      patches.push({
        personId: referencer.id,
        patch,
        reason: 'Байланыстарды тазарту',
      });
    }
  }

  return patches;
}

/**
 * Find all structural graph links pointing at `relativeId`
 * via father_id, mother_id, or spouse_id only.
 */
export function getRelativeReferences(
  relativeId: string,
  allRelatives: Relative[],
): RelativeReferencesResult {
  const links: RelativeReferenceLink[] = [];

  for (const candidate of allRelatives) {
    if (relativeLinkIdsMatch(candidate.id, relativeId)) {
      continue;
    }

    if (relativeLinkIdsMatch(candidate.fatherId, relativeId)) {
      links.push({
        relative: candidate,
        kind: 'father',
        label: REFERENCE_LABELS.father,
      });
    }

    if (relativeLinkIdsMatch(candidate.motherId, relativeId)) {
      links.push({
        relative: candidate,
        kind: 'mother',
        label: REFERENCE_LABELS.mother,
      });
    }

    if (relativeLinkIdsMatch(candidate.spouseId, relativeId)) {
      links.push({
        relative: candidate,
        kind: 'spouse',
        label: REFERENCE_LABELS.spouse,
      });
    }
  }

  const referencingRelatives = dedupeRelatives(links.map((link) => link.relative));

  return {
    relativeId,
    links,
    hasReferences: links.length > 0,
    referencingRelatives,
    clearReferencePatches: buildClearReferencePatches(relativeId, referencingRelatives),
  };
}

export function formatRelativeReferencesMessage(links: RelativeReferenceLink[]): string {
  if (links.length === 0) {
    return '';
  }

  return links
    .map((link) => `${getRelativeDisplayName(link.relative)} · ${link.label}`)
    .join('\n');
}

export function getChildrenReferencingParent(
  relativeId: string,
  allRelatives: Relative[],
): Relative[] {
  return allRelatives.filter(
    (candidate) =>
      !relativeLinkIdsMatch(candidate.id, relativeId) &&
      (relativeLinkIdsMatch(candidate.fatherId, relativeId) ||
        relativeLinkIdsMatch(candidate.motherId, relativeId)),
  );
}

export function getSpouseReferencingPerson(
  relativeId: string,
  allRelatives: Relative[],
): Relative | null {
  return (
    allRelatives.find(
      (candidate) =>
        !relativeLinkIdsMatch(candidate.id, relativeId) &&
        relativeLinkIdsMatch(candidate.spouseId, relativeId),
    ) ?? null
  );
}
