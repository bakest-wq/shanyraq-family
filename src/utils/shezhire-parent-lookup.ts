import { Relative } from '@/types/relative';
import {
  findRelativeByLinkId,
  normalizeRelativeLinkId,
  relativeLinkIdsMatch,
} from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';

export type ShezhireParentRole = 'father' | 'mother';

export type ShezhireParentSlot = {
  linkId: string | null;
  parent: Relative | null;
};

type ShezhireTreeParentsContext = {
  father?: Relative | null;
  mother?: Relative | null;
  fatherId?: string | null;
  motherId?: string | null;
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

function resolveParentLinkId(
  rootPerson: Relative,
  role: ShezhireParentRole,
  treeParentLinkId?: string | null,
): string | null {
  const fromRoot =
    role === 'father'
      ? normalizeRelativeLinkId(rootPerson.fatherId)
      : normalizeRelativeLinkId(rootPerson.motherId);

  if (fromRoot) {
    return fromRoot;
  }

  return normalizeRelativeLinkId(treeParentLinkId);
}

/**
 * Temporary debug helper for father lookup mismatches.
 * Logs every relative id alongside the root's father_id.
 */
export function debugShezhireFatherLookup(
  rootPerson: Relative,
  relatives: Relative[],
): Relative | null {
  const rootName = rootPerson.fullName?.trim() || getRelativeDisplayName(rootPerson);

  console.log('ROOT PERSON', rootName);
  console.log('ROOT father_id', rootPerson.fatherId);

  relatives.forEach((relative) => {
    const name = relative.fullName?.trim() || getRelativeDisplayName(relative);
    console.log('RELATIVE ID', relative.id, name);
  });

  const foundFather =
    rootPerson.fatherId == null
      ? null
      : relatives.find((relative) =>
          relativeLinkIdsMatch(relative.id, rootPerson.fatherId),
        ) ?? null;

  console.log('FOUND FATHER', foundFather);

  return foundFather;
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
 * Parent lookup for Shezhire — uses rootPerson.fatherId / motherId against the
 * same relatives array as Relatives list and profile details.
 */
export function resolveShezhireParentSlot(
  rootPerson: Relative,
  relatives: Relative[],
  role: ShezhireParentRole,
  options?: {
    treeParent?: Relative | null;
    treeParentLinkId?: string | null;
    lookupById?: (relativeId: string) => Relative | null;
    debug?: boolean;
  },
): ShezhireParentSlot {
  const linkId = resolveParentLinkId(rootPerson, role, options?.treeParentLinkId);

  if (options?.debug && role === 'father') {
    debugShezhireFatherLookup(rootPerson, relatives);
  }

  if (!linkId) {
    return { linkId: null, parent: null };
  }

  let parent = findRelativeByLinkId(relatives, linkId);

  if (!parent && options?.lookupById) {
    parent = options.lookupById(linkId);
  }

  if (!parent && options?.treeParent) {
    if (relativeLinkIdsMatch(options.treeParent.id, linkId)) {
      parent = options.treeParent;
    }
  }

  if (role === 'father' && linkId && !parent) {
    console.warn('[Shezhire] father_id exists but no matching relative in cache:', linkId);
  }

  return { linkId, parent };
}

export function resolveShezhireParentSlots(
  rootPerson: Relative,
  relatives: Relative[],
  options?: {
    treeParents?: ShezhireTreeParentsContext;
    lookupById?: (relativeId: string) => Relative | null;
    debug?: boolean;
  },
): { father: ShezhireParentSlot; mother: ShezhireParentSlot } {
  return {
    father: resolveShezhireParentSlot(rootPerson, relatives, 'father', {
      treeParent: options?.treeParents?.father,
      treeParentLinkId: options?.treeParents?.fatherId,
      lookupById: options?.lookupById,
      debug: options?.debug,
    }),
    mother: resolveShezhireParentSlot(rootPerson, relatives, 'mother', {
      treeParent: options?.treeParents?.mother,
      treeParentLinkId: options?.treeParents?.motherId,
      lookupById: options?.lookupById,
    }),
  };
}
