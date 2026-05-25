import type { Relative } from '@/types/relative';
import { normalizeRelativeLinkId } from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  getAncestors,
  getChildren,
  getDescendants,
  getSiblings,
  type LineageEntry,
  type LineageTraversalOptions,
} from '@/utils/shezhire-lineage';
import {
  getConnectedRelativeIds,
  getUnplacedRelatives,
} from '@/utils/shezhire/connectedGraph';
import {
  resolveShezhireParentSlots,
  resolveShezhireRootPerson,
  resolveShezhireSpouse,
} from '@/utils/shezhire-parent-lookup';

export type ShezhireDebugRelativeRow = {
  id: string;
  name: string;
  fatherId: string | null;
  motherId: string | null;
  spouseId: string | null;
  depth?: number;
  group?: string;
};

export type ShezhireDebugGraphResult = {
  root: Relative;
  parents: Relative[];
  siblings: Relative[];
  spouse: Relative | null;
  children: Relative[];
  ancestors: LineageEntry[];
  descendants: LineageEntry[];
  connectedIds: Set<string>;
  unplacedCandidates: Relative[];
  parentSlots: ShezhireGraphParentSlots;
};

/** Product-facing alias — same structural graph, no debug semantics in UI code. */
export type ShezhireRootGraph = ShezhireDebugGraphResult;

export type ShezhireGraphParentSlots = {
  fatherId: string | null;
  motherId: string | null;
  father: Relative | null;
  mother: Relative | null;
};

export type ShezhireGraphDisplaySections = {
  ancestorChain: Relative[];
  visibleChildren: Relative[];
  extendedDescendants: Relative[];
  parentSlots: ShezhireGraphParentSlots;
};

function toRelativeRow(
  relative: Relative,
  options: { depth?: number; group?: string } = {},
): ShezhireDebugRelativeRow {
  return {
    id: relative.id,
    name: getRelativeDisplayName(relative),
    fatherId: normalizeRelativeLinkId(relative.fatherId),
    motherId: normalizeRelativeLinkId(relative.motherId),
    spouseId: normalizeRelativeLinkId(relative.spouseId),
    ...(options.depth !== undefined ? { depth: options.depth } : {}),
    ...(options.group ? { group: options.group } : {}),
  };
}

function toLineageRows(entries: LineageEntry[], group: string): ShezhireDebugRelativeRow[] {
  return entries.map((entry) =>
    toRelativeRow(entry.person, {
      depth: entry.depth,
      group,
    }),
  );
}

function logDebugTable(label: string, rows: ShezhireDebugRelativeRow[]): void {
  console.log(`[Shezhire debugGraph] ${label} (${rows.length})`);

  if (rows.length === 0) {
    console.table([]);
    return;
  }

  console.table(rows);
}

function logDebugGraphResult(result: ShezhireDebugGraphResult): void {
  const rootLabel = getRelativeDisplayName(result.root);

  console.log(
    `[Shezhire debugGraph] root changed → ${result.root.id} · ${rootLabel}`,
  );

  logDebugTable('1. root', [toRelativeRow(result.root, { group: 'root', depth: 0 })]);
  logDebugTable(
    '2. parents',
    result.parents.map((person) => toRelativeRow(person, { group: 'parents', depth: 1 })),
  );
  logDebugTable(
    '3. siblings',
    result.siblings.map((person) => toRelativeRow(person, { group: 'siblings' })),
  );
  logDebugTable(
    '4. spouse',
    result.spouse ? [toRelativeRow(result.spouse, { group: 'spouse' })] : [],
  );
  logDebugTable(
    '5. children',
    result.children.map((person) => toRelativeRow(person, { group: 'children', depth: 1 })),
  );
  logDebugTable('6. ancestors', toLineageRows(result.ancestors, 'ancestors'));
  logDebugTable('7. descendants', toLineageRows(result.descendants, 'descendants'));
  logDebugTable(
    '8. unplaced candidates',
    result.unplacedCandidates.map((person) => toRelativeRow(person, { group: 'unplaced' })),
  );
}

/** Log a precomputed graph result without rebuilding traversal. */
export function logShezhireDebugGraph(result: ShezhireDebugGraphResult): void {
  logDebugGraphResult(result);
}

export function buildGraphParentSlots(
  root: Relative,
  allRelatives: Relative[],
): ShezhireGraphParentSlots {
  const slots = resolveShezhireParentSlots(root, allRelatives);

  return {
    fatherId: slots.father.linkId,
    motherId: slots.mother.linkId,
    father: slots.father.parent,
    mother: slots.mother.parent,
  };
}

/** @deprecated Use buildGraphParentSlots */
export function splitGraphParents(
  root: Relative,
  parents: Relative[],
): ShezhireGraphParentSlots {
  return buildGraphParentSlots(root, parents);
}

/** Derive UI section slices from a graph result — no extra graph traversal. */
export function getGraphDisplaySections(
  graph: ShezhireDebugGraphResult,
): ShezhireGraphDisplaySections {
  return {
    ancestorChain: graph.ancestors.filter((entry) => entry.depth >= 2).map((entry) => entry.person),
    visibleChildren: graph.children,
    extendedDescendants: graph.descendants
      .filter((entry) => entry.depth >= 2)
      .map((entry) => entry.person),
    parentSlots: graph.parentSlots,
  };
}

/**
 * Diagnose structural graph groups for a focused Shezhire root.
 * Uses only father_id, mother_id, spouse_id, and child links.
 */
export function debugRootGraph(
  rootPerson: Relative,
  allRelatives: Relative[],
  options: { log?: boolean } = {},
): ShezhireDebugGraphResult {
  const ringOptions: LineageTraversalOptions = { includeDeceased: true };

  const root = resolveShezhireRootPerson(rootPerson, allRelatives) ?? rootPerson;

  const parentSlots = buildGraphParentSlots(root, allRelatives);
  const parents = [parentSlots.father, parentSlots.mother].filter(
    (parent): parent is Relative => parent !== null,
  );
  const siblings = getSiblings(root, allRelatives, ringOptions);
  const spouse = resolveShezhireSpouse(root, allRelatives);
  const children = getChildren(root, allRelatives, ringOptions);
  const ancestors = getAncestors(root, allRelatives, ringOptions);
  const descendants = getDescendants(root, allRelatives, ringOptions);

  const connectedIds = getConnectedRelativeIds(root, allRelatives, {
    log: options.log === true,
  });
  const unplacedCandidates = getUnplacedRelatives(root, allRelatives, connectedIds);

  const result: ShezhireDebugGraphResult = {
    root,
    parents,
    siblings,
    spouse,
    children,
    ancestors,
    descendants,
    connectedIds,
    unplacedCandidates,
    parentSlots,
  };

  if (options.log === true) {
    logDebugGraphResult(result);
  }

  return result;
}

/** Product-facing entry — builds the focused Shezhire tree for UI. */
export function buildRootGraph(
  rootPerson: Relative,
  allRelatives: Relative[],
  options: { log?: boolean } = {},
): ShezhireRootGraph {
  return debugRootGraph(rootPerson, allRelatives, options);
}
