import { Relative } from '@/types/relative';
import { findRelativeByLinkId, normalizeRelativeLinkId, relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { findFamilyAnchor } from '@/utils/kinship-path';
import {
  getAncestorChain,
  getAncestors,
  getChildren,
  getDescendants,
  getExtendedDescendants,
  getLineageConnectedIds,
  getSiblings,
  getSpouse,
  type LineageEntry,
} from '@/utils/shezhire-lineage';
import { isFemale, isMale } from '@/utils/relationship-engine';

export type { LineageEntry } from '@/utils/shezhire-lineage';

export type FocusedTreeParents = {
  fatherId: string | null;
  motherId: string | null;
  father: Relative | null;
  mother: Relative | null;
};

export type FocusedFamilyTree = {
  root: Relative;
  parents: FocusedTreeParents;
  /** Grandparents and above — ordered oldest generation first. */
  ancestorChain: Relative[];
  ancestors: LineageEntry[];
  siblings: Relative[];
  spouse: Relative | null;
  children: Relative[];
  /** Grandchildren and below. */
  descendants: LineageEntry[];
};

function getById(relatives: Relative[], id: string): Relative | null {
  return findRelativeByLinkId(relatives, id);
}

function resolveParentSlots(root: Relative, relatives: Relative[]): FocusedTreeParents {
  const fatherId = normalizeRelativeLinkId(root.fatherId);
  const motherId = normalizeRelativeLinkId(root.motherId);

  return {
    fatherId,
    motherId,
    father: fatherId ? getById(relatives, fatherId) : null,
    mother: motherId ? getById(relatives, motherId) : null,
  };
}

export function hasFocusedParentLinks(parents: FocusedTreeParents): boolean {
  return Boolean(parents.fatherId || parents.motherId);
}

export function lookupFocusedTreeRelative(
  relativeId: string | null | undefined,
  lookupById: (id: string) => Relative | null,
): Relative | null {
  if (!relativeId) {
    return null;
  }

  return lookupById(relativeId);
}

/**
 * @deprecated Prefer getSiblings from shezhire-lineage.
 */
export function getShezhireSiblings(rootPerson: Relative, relatives: Relative[]): Relative[] {
  return getSiblings(rootPerson, relatives);
}

export function getShezhireSiblingIds(rootPerson: Relative, relatives: Relative[]): Set<string> {
  return new Set(getSiblings(rootPerson, relatives).map((sibling) => sibling.id));
}

/**
 * @deprecated Prefer getChildren from shezhire-lineage.
 */
export function getActualChildren(
  rootPerson: Relative,
  relatives: Relative[],
  siblingIds: Set<string> = getShezhireSiblingIds(rootPerson, relatives),
): Relative[] {
  return getChildren(rootPerson, relatives).filter((candidate) => !siblingIds.has(candidate.id));
}

/** @deprecated Use getChildren */
export function getFocusedDirectChildren(root: Relative, relatives: Relative[]): Relative[] {
  return getActualChildren(root, relatives);
}

/** @deprecated Use getSiblings */
export function getFocusedSiblings(root: Relative, relatives: Relative[]): Relative[] {
  return getSiblings(root, relatives);
}

export function pickDefaultRootId(
  relatives: Relative[],
  myRelativeId?: string | null,
): string | null {
  if (myRelativeId) {
    const linked = relatives.find(
      (relative) =>
        !relative.isDeceased &&
        (relative.id === myRelativeId ||
          String(relative.id).trim() === String(myRelativeId).trim()),
    );

    if (linked) {
      return linked.id;
    }
  }

  const anchor = findFamilyAnchor(relatives.filter((relative) => !relative.isDeceased));
  if (anchor) {
    return anchor.id;
  }

  const living = relatives.filter((relative) => !relative.isDeceased);
  if (living.length === 0) {
    return relatives[0]?.id ?? null;
  }

  let best = living[0];
  let bestScore = -1;

  for (const relative of living) {
    const childCount = living.filter(
      (candidate) =>
        relativeLinkIdsMatch(candidate.fatherId, relative.id) ||
        relativeLinkIdsMatch(candidate.motherId, relative.id),
    ).length;

    const score =
      childCount * 3 +
      (relative.fatherId ? 1 : 0) +
      (relative.motherId ? 1 : 0) +
      (relative.spouseId ? 1 : 0);

    if (score > bestScore) {
      bestScore = score;
      best = relative;
    }
  }

  return best.id;
}

export function buildFocusedFamilyTree(
  rootId: string,
  relatives: Relative[],
): FocusedFamilyTree | null {
  const root = getById(relatives, rootId);
  if (!root) {
    return null;
  }

  const ancestors = getAncestors(root, relatives);
  const ancestorChain = getAncestorChain(root, relatives);
  const parents = resolveParentSlots(root, relatives);
  const spouse = getSpouse(root, relatives);
  const siblings = getSiblings(root, relatives);
  const siblingIds = new Set(siblings.map((sibling) => sibling.id));
  const descendantEntries = getDescendants(root, relatives);
  const children = descendantEntries
    .filter((entry) => entry.depth === 1)
    .map((entry) => entry.person)
    .filter((candidate) => !siblingIds.has(candidate.id));
  const descendants = getExtendedDescendants(root, relatives);

  return {
    root,
    parents,
    ancestorChain,
    ancestors,
    siblings,
    spouse,
    children,
    descendants,
  };
}

export function getFocusedAddChildParams(
  root: Relative,
  spouse: Relative | null,
): { fatherId?: string; motherId?: string } {
  if (isMale(root)) {
    return {
      fatherId: root.id,
      ...(spouse ? { motherId: spouse.id } : {}),
    };
  }

  if (isFemale(root)) {
    return {
      motherId: root.id,
      ...(spouse ? { fatherId: spouse.id } : {}),
    };
  }

  if (spouse) {
    if (isMale(spouse)) {
      return { fatherId: spouse.id, motherId: root.id };
    }

    if (isFemale(spouse)) {
      return { fatherId: root.id, motherId: spouse.id };
    }
  }

  return { fatherId: root.id };
}

export function hasShezhireLinks(relatives: Relative[]): boolean {
  const living = relatives.filter((relative) => !relative.isDeceased);

  for (const relative of living) {
    if (relative.fatherId || relative.motherId || relative.spouseId) {
      return true;
    }
  }

  return living.some((relative) =>
    living.some(
      (child) =>
        !child.isDeceased &&
        (relativeLinkIdsMatch(child.fatherId, relative.id) ||
          relativeLinkIdsMatch(child.motherId, relative.id)),
    ),
  );
}

export function isFocusedTreeVisible(focused: FocusedFamilyTree): boolean {
  return Boolean(
    hasFocusedParentLinks(focused.parents) ||
      focused.ancestorChain.length > 0 ||
      focused.siblings.length > 0 ||
      focused.spouse ||
      focused.children.length > 0 ||
      focused.descendants.length > 0 ||
      focused.root.fatherId ||
      focused.root.motherId ||
      focused.root.spouseId,
  );
}

export function getFocusedTreeRelativeIds(
  focused: FocusedFamilyTree,
  relatives: Relative[],
): Set<string> {
  return getLineageConnectedIds(focused.root, relatives);
}

export { getAncestors, getDescendants, getSiblings, getSpouse, getLineageConnectedIds };
