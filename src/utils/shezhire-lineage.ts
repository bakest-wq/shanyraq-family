import type { Relative } from '@/types/relative';
import { findRelativeByLinkId, relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { sharesLinkedParentWithRoot } from '@/utils/family-sibling-links';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { getEffectiveSpouse } from '@/utils/relationship-engine';
import { getConnectedRelativeIds } from '@/utils/shezhire/connectedGraph';

/** Safeguard against pathological graphs. */
export const DEFAULT_MAX_LINEAGE_DEPTH = 12;

export type LineageTraversalOptions = {
  maxDepth?: number;
  includeDeceased?: boolean;
};

export type LineageEntry = {
  person: Relative;
  /** 1 = parents / direct children, 2 = grandparents / grandchildren, … */
  depth: number;
};

function compareNames(left: Relative, right: Relative): number {
  return getRelativeDisplayName(left).localeCompare(getRelativeDisplayName(right), 'ru');
}

function resolvePerson(relatives: Relative[], id?: string | null): Relative | null {
  if (!id) {
    return null;
  }

  return findRelativeByLinkId(relatives, id);
}

function isLiving(relative: Relative, includeDeceased: boolean): boolean {
  return includeDeceased || !relative.isDeceased;
}

function dedupeById(entries: LineageEntry[]): LineageEntry[] {
  const seen = new Set<string>();
  const result: LineageEntry[] = [];

  for (const entry of entries) {
    if (seen.has(entry.person.id)) {
      continue;
    }

    seen.add(entry.person.id);
    result.push(entry);
  }

  return result;
}

function sortAncestorEntries(entries: LineageEntry[]): LineageEntry[] {
  return [...entries].sort((left, right) => {
    if (right.depth !== left.depth) {
      return right.depth - left.depth;
    }

    return compareNames(left.person, right.person);
  });
}

function sortDescendantEntries(entries: LineageEntry[]): LineageEntry[] {
  return [...entries].sort((left, right) => {
    if (left.depth !== right.depth) {
      return left.depth - right.depth;
    }

    return compareNames(left.person, right.person);
  });
}

/** Direct structural children — father_id / mother_id only. */
export function getChildren(
  rootPerson: Relative,
  relatives: Relative[],
  options: LineageTraversalOptions = {},
): Relative[] {
  const includeDeceased = options.includeDeceased ?? false;

  return relatives
    .filter((candidate) => isLiving(candidate, includeDeceased))
    .filter(
      (candidate) =>
        relativeLinkIdsMatch(candidate.fatherId, rootPerson.id) ||
        relativeLinkIdsMatch(candidate.motherId, rootPerson.id),
    )
    .sort(compareNames);
}

export function getSpouse(rootPerson: Relative, relatives: Relative[]): Relative | null {
  return getEffectiveSpouse(rootPerson, relatives);
}

export function getSiblings(
  rootPerson: Relative,
  relatives: Relative[],
  options: LineageTraversalOptions = {},
): Relative[] {
  const includeDeceased = options.includeDeceased ?? false;

  return relatives
    .filter((candidate) => isLiving(candidate, includeDeceased))
    .filter((candidate) => !relativeLinkIdsMatch(candidate.id, rootPerson.id))
    .filter((candidate) => sharesLinkedParentWithRoot(rootPerson, candidate))
    .sort(compareNames);
}

/**
 * Traverse upward through father_id / mother_id with cycle protection.
 */
export function getAncestors(
  rootPerson: Relative,
  relatives: Relative[],
  options: LineageTraversalOptions = {},
): LineageEntry[] {
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_LINEAGE_DEPTH;
  const includeDeceased = options.includeDeceased ?? false;
  const collected: LineageEntry[] = [];

  const walk = (person: Relative, depth: number, pathVisited: Set<string>) => {
    if (depth > maxDepth) {
      return;
    }

    if (pathVisited.has(person.id)) {
      return;
    }

    const nextPath = new Set(pathVisited);
    nextPath.add(person.id);

    for (const parentId of [person.fatherId, person.motherId]) {
      const parent = resolvePerson(relatives, parentId);

      if (!parent || !isLiving(parent, includeDeceased)) {
        continue;
      }

      collected.push({ person: parent, depth });
      walk(parent, depth + 1, nextPath);
    }
  };

  walk(rootPerson, 1, new Set());

  return sortAncestorEntries(dedupeById(collected));
}

/**
 * Traverse downward through structural child links with cycle protection.
 */
export function getDescendants(
  rootPerson: Relative,
  relatives: Relative[],
  options: LineageTraversalOptions = {},
): LineageEntry[] {
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_LINEAGE_DEPTH;
  const includeDeceased = options.includeDeceased ?? false;
  const collected: LineageEntry[] = [];

  const walk = (person: Relative, depth: number, pathVisited: Set<string>) => {
    if (depth > maxDepth) {
      return;
    }

    if (pathVisited.has(person.id)) {
      return;
    }

    const nextPath = new Set(pathVisited);
    nextPath.add(person.id);

    for (const child of getChildren(person, relatives, options)) {
      if (!isLiving(child, includeDeceased)) {
        continue;
      }

      collected.push({ person: child, depth });
      walk(child, depth + 1, nextPath);
    }
  };

  walk(rootPerson, 1, new Set());

  return sortDescendantEntries(dedupeById(collected));
}

/** Ancestors beyond immediate parents (grandparents and above). */
export function getAncestorChain(
  rootPerson: Relative,
  relatives: Relative[],
  options?: LineageTraversalOptions,
): Relative[] {
  return getAncestors(rootPerson, relatives, options)
    .filter((entry) => entry.depth >= 2)
    .map((entry) => entry.person);
}

/** Descendants beyond direct children (grandchildren and below). */
export function getExtendedDescendants(
  rootPerson: Relative,
  relatives: Relative[],
  options?: LineageTraversalOptions,
): LineageEntry[] {
  return getDescendants(rootPerson, relatives, options).filter((entry) => entry.depth >= 2);
}

/**
 * All relatives structurally reachable from root via parent/child/spouse/sibling hops.
 * Used to keep connected people out of the “unplaced” list when focus changes.
 */
export function getLineageConnectedIds(
  rootPerson: Relative,
  relatives: Relative[],
  options: LineageTraversalOptions = {},
): Set<string> {
  void options;
  return getConnectedRelativeIds(rootPerson, relatives);
}

export function getLineageRelativeIds(
  rootPerson: Relative,
  relatives: Relative[],
  options?: LineageTraversalOptions,
): Set<string> {
  return getLineageConnectedIds(rootPerson, relatives, options);
}
