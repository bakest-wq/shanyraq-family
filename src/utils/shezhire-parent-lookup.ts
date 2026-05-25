import { Relative } from '@/types/relative';
import {
  findRelativeByLinkId,
  normalizeRelativeLinkId,
  relativeLinkIdsMatch,
} from '@/utils/family-link-picker';

export type ShezhireParentRole = 'father' | 'mother';

export type ShezhireParentSlot = {
  linkId: string | null;
  parent: Relative | null;
};

/** Resolve the freshest root person from the shared relatives list. */
export function resolveShezhireRootPerson(
  rootPerson: Relative | null | undefined,
  relatives: Relative[],
): Relative | null {
  if (!rootPerson) {
    return null;
  }

  const fresh = findRelativeByLinkId(relatives, rootPerson.id) ?? rootPerson;

  return {
    ...fresh,
    fatherId:
      normalizeRelativeLinkId(fresh.fatherId) ??
      normalizeRelativeLinkId(rootPerson.fatherId) ??
      undefined,
    motherId:
      normalizeRelativeLinkId(fresh.motherId) ??
      normalizeRelativeLinkId(rootPerson.motherId) ??
      undefined,
    spouseId:
      normalizeRelativeLinkId(fresh.spouseId) ??
      normalizeRelativeLinkId(rootPerson.spouseId) ??
      undefined,
  };
}

function resolveParentLinkId(rootPerson: Relative, role: ShezhireParentRole): string | null {
  return role === 'father'
    ? normalizeRelativeLinkId(rootPerson.fatherId)
    : normalizeRelativeLinkId(rootPerson.motherId);
}

function findParentByLinkId(
  linkId: string | null,
  relatives: Relative[],
): Relative | null {
  if (!linkId) {
    return null;
  }

  return relatives.find((relative) => relativeLinkIdsMatch(relative.id, linkId)) ?? null;
}

/**
 * Bidirectional spouse lookup for Shezhire core section:
 * root.spouseId OR any relative with spouseId pointing to root.
 */
export function resolveShezhireSpouse(
  rootPerson: Relative,
  relatives: Relative[],
  options?: {
    treeSpouse?: Relative | null;
    lookupById?: (relativeId: string) => Relative | null;
  },
): Relative | null {
  let spouse: Relative | null = null;

  const forwardSpouseId = normalizeRelativeLinkId(rootPerson.spouseId);
  if (forwardSpouseId) {
    spouse = findRelativeByLinkId(relatives, forwardSpouseId);
    if (!spouse && options?.lookupById) {
      spouse = options.lookupById(forwardSpouseId);
    }
  }

  if (!spouse) {
    spouse =
      relatives.find((candidate) =>
        relativeLinkIdsMatch(candidate.spouseId, rootPerson.id),
      ) ?? null;
  }

  if (!spouse && options?.treeSpouse) {
    const treeSpouse = options.treeSpouse;
    if (
      relativeLinkIdsMatch(rootPerson.spouseId, treeSpouse.id) ||
      relativeLinkIdsMatch(treeSpouse.spouseId, rootPerson.id)
    ) {
      spouse = treeSpouse;
    }
  }

  return spouse;
}

/**
 * Parent lookup — ONLY rootPerson.fatherId / motherId against relatives[].
 * No surname, patronymic, or search inference.
 */
export function resolveShezhireParentSlot(
  rootPerson: Relative,
  relatives: Relative[],
  role: ShezhireParentRole,
): ShezhireParentSlot {
  const linkId = resolveParentLinkId(rootPerson, role);

  if (!linkId) {
    return { linkId: null, parent: null };
  }

  const parent = findParentByLinkId(linkId, relatives);

  return { linkId, parent };
}

export function resolveShezhireParentSlots(
  rootPerson: Relative,
  relatives: Relative[],
): { father: ShezhireParentSlot; mother: ShezhireParentSlot } {
  return {
    father: resolveShezhireParentSlot(rootPerson, relatives, 'father'),
    mother: resolveShezhireParentSlot(rootPerson, relatives, 'mother'),
  };
}

/** True when any relative links to this person as father or mother. */
export function isReferencedAsParent(relative: Relative, relatives: Relative[]): boolean {
  return relatives.some(
    (candidate) =>
      relativeLinkIdsMatch(candidate.fatherId, relative.id) ||
      relativeLinkIdsMatch(candidate.motherId, relative.id),
  );
}
