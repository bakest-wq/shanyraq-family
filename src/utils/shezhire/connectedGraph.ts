import type { Relative } from '@/types/relative';
import {
  findRelativeByLinkId,
  normalizeRelativeLinkId,
  relativeLinkIdsMatch,
} from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { getChildren, getSiblings } from '@/utils/shezhire-lineage';
import {
  isReferencedAsParent,
  resolveShezhireRootPerson,
} from '@/utils/shezhire-parent-lookup';

export type ConnectedGraphOptions = {
  log?: boolean;
};

function visitKey(relative: Relative | string): string {
  const id = typeof relative === 'string' ? relative : relative.id;
  return normalizeRelativeLinkId(id) ?? id;
}

function displayName(relative: Relative): string {
  return relative.fullName?.trim() || getRelativeDisplayName(relative);
}

/** Merge cached person with freshest structural links from the relatives list. */
function refreshPerson(person: Relative, allRelatives: Relative[]): Relative {
  const fresh = findRelativeByLinkId(allRelatives, person.id) ?? person;

  return {
    ...fresh,
    fatherId:
      normalizeRelativeLinkId(fresh.fatherId) ??
      normalizeRelativeLinkId(person.fatherId) ??
      undefined,
    motherId:
      normalizeRelativeLinkId(fresh.motherId) ??
      normalizeRelativeLinkId(person.motherId) ??
      undefined,
    spouseId:
      normalizeRelativeLinkId(fresh.spouseId) ??
      normalizeRelativeLinkId(person.spouseId) ??
      undefined,
  };
}

function getReverseSpouse(person: Relative, allRelatives: Relative[]): Relative | null {
  return (
    allRelatives.find((candidate) =>
      relativeLinkIdsMatch(candidate.spouseId, person.id),
    ) ?? null
  );
}

function getStructuralChildren(person: Relative, allRelatives: Relative[]): Relative[] {
  return allRelatives.filter(
    (candidate) =>
      relativeLinkIdsMatch(candidate.fatherId, person.id) ||
      relativeLinkIdsMatch(candidate.motherId, person.id),
  );
}

/**
 * Structural neighbors for BFS — father, mother, children, spouse, reverse spouse.
 * Uses only father_id, mother_id, spouse_id.
 */
export function getNeighbors(person: Relative, allRelatives: Relative[]): Relative[] {
  const current = refreshPerson(person, allRelatives);
  const neighbors: Relative[] = [];
  const seen = new Set<string>();

  const addNeighbor = (candidate: Relative | null | undefined) => {
    if (!candidate || relativeLinkIdsMatch(candidate.id, current.id)) {
      return;
    }

    const key = visitKey(candidate);

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    neighbors.push(candidate);
  };

  addNeighbor(findRelativeByLinkId(allRelatives, current.fatherId));
  addNeighbor(findRelativeByLinkId(allRelatives, current.motherId));
  addNeighbor(findRelativeByLinkId(allRelatives, current.spouseId));
  addNeighbor(getReverseSpouse(current, allRelatives));

  for (const child of getStructuralChildren(current, allRelatives)) {
    addNeighbor(child);
  }

  for (const sibling of getSiblings(current, allRelatives, { includeDeceased: true })) {
    addNeighbor(sibling);
  }

  return neighbors;
}

export function isPersonConnected(relative: Relative, connectedIds: Set<string>): boolean {
  for (const connectedId of connectedIds) {
    if (relativeLinkIdsMatch(relative.id, connectedId)) {
      return true;
    }
  }

  return false;
}

/**
 * Canonical BFS over the bidirectional structural graph from rootPerson.
 */
export function getConnectedRelativeIds(
  rootPerson: Relative,
  allRelatives: Relative[],
  options: ConnectedGraphOptions = {},
): Set<string> {
  const root = resolveShezhireRootPerson(rootPerson, allRelatives) ?? refreshPerson(rootPerson, allRelatives);
  const connectedIds = new Set<string>();
  const visited = new Set<string>();
  const queue: Relative[] = [root];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      continue;
    }

    const person = refreshPerson(current, allRelatives);
    const key = visitKey(person);

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);
    connectedIds.add(person.id);

    for (const neighbor of getNeighbors(person, allRelatives)) {
      const neighborKey = visitKey(neighbor);

      if (!visited.has(neighborKey)) {
        queue.push(neighbor);
      }
    }
  }

  for (const parentId of [root.fatherId, root.motherId]) {
    const parent = findRelativeByLinkId(allRelatives, parentId);
    if (parent) {
      connectedIds.add(parent.id);
    }
  }

  if (options.log) {
    const unplaced = getUnplacedRelatives(root, allRelatives, connectedIds);
    console.log('ROOT', displayName(root));
    console.log('CONNECTED', connectedIds.size, [...connectedIds]);
    console.log('UNPLACED', unplaced.map((relative) => displayName(relative)));
  }

  return connectedIds;
}

/** Living relatives with no structural path from root — excludes linked parents. */
export function getUnplacedRelatives(
  rootPerson: Relative,
  allRelatives: Relative[],
  connectedIds: Set<string> = getConnectedRelativeIds(rootPerson, allRelatives),
): Relative[] {
  return allRelatives
    .filter((relative) => !relative.isDeceased)
    .filter((relative) => !isPersonConnected(relative, connectedIds))
    .filter((relative) => !isReferencedAsParent(relative, allRelatives))
    .sort((left, right) =>
      getRelativeDisplayName(left).localeCompare(getRelativeDisplayName(right), 'ru'),
    );
}
