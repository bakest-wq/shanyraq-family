import { Relative } from '@/types/relative';
import { findRelativeByLinkId, normalizeRelativeLinkId, relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { findFamilyAnchor } from '@/utils/kinship-path';
import { sharesLinkedParentWithRoot } from '@/utils/family-sibling-links';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { getEffectiveSpouse, isFemale, isMale } from '@/utils/relationship-engine';

export type FocusedTreeParents = {
  fatherId: string | null;
  motherId: string | null;
  father: Relative | null;
  mother: Relative | null;
};

export type FocusedFamilyTree = {
  root: Relative;
  parents: FocusedTreeParents;
  siblings: Relative[];
  spouse: Relative | null;
  children: Relative[];
};

function compareNames(a: Relative, b: Relative): number {
  return getRelativeDisplayName(a).localeCompare(getRelativeDisplayName(b), 'ru');
}

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

function isDirectChildLink(rootPerson: Relative, candidate: Relative): boolean {
  return (
    relativeLinkIdsMatch(candidate.fatherId, rootPerson.id) ||
    relativeLinkIdsMatch(candidate.motherId, rootPerson.id)
  );
}

/**
 * Debug helper: getSiblings(rootPerson)
 * Same father_id or mother_id as root; never relationship labels or names.
 */
export function getShezhireSiblings(rootPerson: Relative, relatives: Relative[]): Relative[] {
  return relatives
    .filter((candidate) => !candidate.isDeceased)
    .filter((candidate) => !relativeLinkIdsMatch(candidate.id, rootPerson.id))
    .filter((candidate) => sharesLinkedParentWithRoot(rootPerson, candidate))
    .sort(compareNames);
}

export function getShezhireSiblingIds(rootPerson: Relative, relatives: Relative[]): Set<string> {
  return new Set(getShezhireSiblings(rootPerson, relatives).map((sibling) => sibling.id));
}

/**
 * Debug helper: getActualChildren(rootPerson)
 * Direct child links only, with siblings explicitly removed via siblingIds.
 */
export function getActualChildren(
  rootPerson: Relative,
  relatives: Relative[],
  siblingIds: Set<string> = getShezhireSiblingIds(rootPerson, relatives),
): Relative[] {
  const childrenCandidates = relatives
    .filter((candidate) => !candidate.isDeceased)
    .filter((candidate) => isDirectChildLink(rootPerson, candidate));

  return childrenCandidates
    .filter((candidate) => !siblingIds.has(candidate.id))
    .sort(compareNames);
}

/** @deprecated Use getActualChildren */
export function getFocusedDirectChildren(root: Relative, relatives: Relative[]): Relative[] {
  return getActualChildren(root, relatives);
}

/** @deprecated Use getShezhireSiblings */
export function getFocusedSiblings(root: Relative, relatives: Relative[]): Relative[] {
  return getShezhireSiblings(root, relatives);
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

  const parents = resolveParentSlots(root, relatives);
  const spouse = getEffectiveSpouse(root, relatives);

  // 1) Siblings first — shared father_id / mother_id with root (IDs only).
  const siblings = getShezhireSiblings(root, relatives);
  const siblingIds = new Set(siblings.map((sibling) => sibling.id));

  // 2) Children candidates — direct parent links only.
  const childrenCandidates = relatives.filter(
    (candidate) =>
      !candidate.isDeceased &&
      (relativeLinkIdsMatch(candidate.fatherId, root.id) ||
        relativeLinkIdsMatch(candidate.motherId, root.id)),
  );

  // 3) Siblings must NEVER appear in children.
  const children = childrenCandidates
    .filter((candidate) => !siblingIds.has(candidate.id))
    .sort(compareNames);

  return {
    root,
    parents,
    siblings,
    spouse,
    children,
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
      focused.siblings.length > 0 ||
      focused.spouse ||
      focused.children.length > 0 ||
      focused.root.fatherId ||
      focused.root.motherId ||
      focused.root.spouseId,
  );
}

export function getFocusedTreeRelativeIds(focused: FocusedFamilyTree): Set<string> {
  const ids = new Set<string>([focused.root.id]);

  if (focused.parents.fatherId) {
    ids.add(focused.parents.fatherId);
  }

  if (focused.parents.motherId) {
    ids.add(focused.parents.motherId);
  }

  if (focused.spouse) {
    ids.add(focused.spouse.id);
  }

  for (const sibling of focused.siblings) {
    ids.add(sibling.id);
  }

  for (const child of focused.children) {
    ids.add(child.id);
  }

  return ids;
}
