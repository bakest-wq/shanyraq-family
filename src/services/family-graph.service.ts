import type { Relative } from '@/types/relative';
import { findRelativeById } from '@/utils/family-link-picker';
import { getEffectiveSpouse } from '@/utils/kinship/graph';
import { getChildren, getSiblings } from '@/utils/shezhire-lineage';
import {
  buildJurtGroups,
  buildJurtGroupsForFocusedTree,
  countJurtRelatives,
  getJurtRelativeIds,
} from '@/utils/jurt-grouping';
import {
  buildRootGraph,
  getGraphDisplaySections,
} from '@/utils/shezhire/debugGraph';

import type {
  FamilyRing,
  JurtGroupsTree,
  ShezhireGraphDisplaySections,
  ShezhireRootGraph,
} from '@/services/family-graph.types';

export type {
  FamilyRing,
  JurtGroupsTree,
  JurtKind,
  JurtRelativeEntry,
  JurtSideGroup,
  ShezhireGraphDisplaySections,
  ShezhireGraphParentSlots,
  ShezhireRootGraph,
} from '@/services/family-graph.types';

/** Parents, spouse, children, and siblings for one person. */
export function resolveFamilyRing(relative: Relative, relatives: Relative[]): FamilyRing {
  return {
    father: findRelativeById(relatives, relative.fatherId),
    mother: findRelativeById(relatives, relative.motherId),
    spouse: getEffectiveSpouse(relative, relatives),
    children: getChildren(relative, relatives, { includeDeceased: true }),
    siblings: getSiblings(relative, relatives, { includeDeceased: true }),
  };
}

/** Focused shezhire tree graph from a root person. */
export function buildShezhireRootGraph(
  root: Relative,
  relatives: Relative[],
  options: { log?: boolean } = {},
): ShezhireRootGraph {
  return buildRootGraph(root, relatives, options);
}

/** Relatives already shown on the main tree — exclude from jurt tabs only. */
export function buildShezhireMainTreeExcludeIds(rootGraph: ShezhireRootGraph): Set<string> {
  const ids = new Set<string>([rootGraph.root.id]);

  for (const parent of rootGraph.parents) {
    ids.add(parent.id);
  }

  if (rootGraph.spouse) {
    ids.add(rootGraph.spouse.id);
  }

  for (const sibling of rootGraph.siblings) {
    ids.add(sibling.id);
  }

  for (const child of rootGraph.children) {
    ids.add(child.id);
  }

  return ids;
}

/** Three jurt groups (öz / нағашы / қайын) from the active root. */
export function buildThreeJurtGroups(
  rootPerson: Relative,
  relatives: Relative[],
  excludeIds: Set<string> = new Set(),
): JurtGroupsTree {
  return buildJurtGroups(rootPerson, relatives, excludeIds);
}

export {
  buildJurtGroupsForFocusedTree as buildThreeJurtGroupsForFocusedTree,
  countJurtRelatives,
  getGraphDisplaySections,
  getJurtRelativeIds,
};

export { resolveJurtKind } from '@/utils/jurt-grouping';

export {
  RELATIVE_PRIORITY_TIERS,
  getRelativePriorityTier,
  sortRelativesBySmartPriority,
  type RelativePriorityTier,
  type SortRelativesBySmartPriorityOptions,
} from '@/services/relative-priority-sort';

export {
  clearRelativeInteractionSession,
  getRelativeLastViewedAt,
  getRelativeOpenCount,
  recordRelativeInteraction,
} from '@/services/relative-interaction-session';
