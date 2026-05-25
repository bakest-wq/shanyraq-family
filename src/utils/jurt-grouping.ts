import type { Relative } from '@/types/relative';
import { isCoreFamilyRelation } from '@/utils/core-family-relation';
import { findRelativeById, relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getFocusedTreeRelativeIds } from '@/utils/focused-family-tree';
import {
  getThreeJurtGroup,
  mapThreeJurtGroupToJurtKind,
} from '@/services/kinship/kinship-groups';
import { kinshipCacheService } from '@/services/kinship/kinship-cache.service';
import {
  buildParentSideRelativesTree,
  countParentSideRelatives,
  getParentSideRelativeIds,
  type ParentSideBranch,
  type ParentSideRelativeEntry,
  type ParentSideRelativesTree,
} from '@/utils/parent-side-relatives';
import { sortRelativesBySmartPriority } from '@/services/relative-priority-sort';
import {
  getEffectiveSpouse,
  getSiblings,
} from '@/utils/kinship/graph';
import {
  buildOzJurtSubgroups,
  countOzJurtSubgroups,
  flattenOzJurtSubgroups,
  type OzJurtSubgroup,
} from '@/utils/oz-jurt-subgroups';
import {
  buildKayinJurtSubgroups,
  countKayinJurtSubgroups,
  type KayinJurtSubgroup,
} from '@/utils/kayin-jurt-subgroups';

export type { OzJurtSubgroup, OzJurtSubgroupId } from '@/utils/oz-jurt-subgroups';
export type { KayinJurtSubgroup, KayinJurtSubgroupId } from '@/utils/kayin-jurt-subgroups';
export {
  OZ_JURT_SUBGROUP_ORDER,
  buildOzJurtSubgroups,
  classifyOzJurtSubgroup,
  countOzJurtSubgroup,
  countOzJurtSubgroups,
  filterVisibleOzJurtSubgroups,
} from '@/utils/oz-jurt-subgroups';

export type JurtKind = 'oz' | 'nagashy' | 'kayin';

export type JurtRelativeEntry = {
  person: Relative;
  children: Relative[];
};

export type JurtSideGroup = {
  kind: JurtKind;
  guidanceMessage: string | null;
  entries: JurtRelativeEntry[];
  extraRelatives: Relative[];
  subgroups?: OzJurtSubgroup[] | KayinJurtSubgroup[];
};

export type JurtGroupsTree = {
  oz: JurtSideGroup;
  nagashy: JurtSideGroup;
  kayin: JurtSideGroup;
  parentSide: ParentSideRelativesTree;
};

function sortRelatives(
  rootPerson: Relative,
  relatives: Relative[],
  allRelatives: Relative[],
): Relative[] {
  return sortRelativesBySmartPriority(rootPerson, relatives, { ignoreInteraction: false });
}

function isLiving(relative: Relative): boolean {
  return !relative.isDeceased;
}

function isExcluded(relative: Relative, excludeIds: Set<string>): boolean {
  return [...excludeIds].some((id) => relativeLinkIdsMatch(id, relative.id));
}

function findChildrenOf(
  rootPerson: Relative,
  relative: Relative,
  relatives: Relative[],
): Relative[] {
  return sortRelatives(
    rootPerson,
    relatives.filter(
      (child) =>
        isLiving(child) &&
        (relativeLinkIdsMatch(child.fatherId, relative.id) ||
          relativeLinkIdsMatch(child.motherId, relative.id)),
    ),
    relatives,
  );
}

function branchToEntries(branch: ParentSideBranch): JurtRelativeEntry[] {
  return branch.entries.map((entry) => ({
    person: entry.person,
    children: entry.children,
  }));
}

function collectExtraJurtRelatives(
  rootPerson: Relative,
  relatives: Relative[],
  excludeIds: Set<string>,
  assignedIds: Set<string>,
  targetJurt: JurtKind,
): Relative[] {
  const extras: Relative[] = [];

  for (const relative of relatives) {
    if (!isLiving(relative)) {
      continue;
    }

    if (relativeLinkIdsMatch(relative.id, rootPerson.id)) {
      continue;
    }

    if (isCoreFamilyRelation(rootPerson, relative, relatives)) {
      continue;
    }

    if (isExcluded(relative, excludeIds)) {
      continue;
    }

    if ([...assignedIds].some((id) => relativeLinkIdsMatch(id, relative.id))) {
      continue;
    }

    const jurtKind = mapThreeJurtGroupToJurtKind(
      getThreeJurtGroup(rootPerson, relative, relatives),
    );
    if (jurtKind === targetJurt) {
      extras.push(relative);
      assignedIds.add(relative.id);
    }
  }

  return sortRelatives(rootPerson, extras, relatives);
}

function buildKayinEntries(
  rootPerson: Relative,
  relatives: Relative[],
  excludeIds: Set<string>,
): { spouse: Relative | null; entries: JurtRelativeEntry[]; guidanceMessage: string | null } {
  const spouse = getEffectiveSpouse(rootPerson, relatives);

  if (!spouse) {
    return {
      spouse: null,
      entries: [],
      guidanceMessage: 'Жұбай байланыстырылмаған. Қайын жұрт көрсетілуі үшін жұбайды қосыңыз.',
    };
  }

  const entries: JurtRelativeEntry[] = [];
  const seen = new Set<string>();

  const pushEntry = (person: Relative) => {
    if (!isLiving(person) || isExcluded(person, excludeIds)) {
      return;
    }

    if (relativeLinkIdsMatch(person.id, rootPerson.id)) {
      return;
    }

    if (isCoreFamilyRelation(rootPerson, person, relatives)) {
      return;
    }

    if (seen.has(person.id)) {
      return;
    }

    seen.add(person.id);
    const children = findChildrenOf(rootPerson, person, relatives).filter(
      (child) =>
        !isExcluded(child, excludeIds) &&
        !relativeLinkIdsMatch(child.id, rootPerson.id) &&
        !relativeLinkIdsMatch(child.id, spouse.id) &&
        !isCoreFamilyRelation(rootPerson, child, relatives),
    );

    for (const child of children) {
      seen.add(child.id);
    }

    entries.push({ person, children });
  };

  for (const parentId of [spouse.fatherId, spouse.motherId]) {
    if (!parentId) {
      continue;
    }

    const parent = findRelativeById(relatives, parentId);
    if (parent) {
      pushEntry(parent);
    }
  }

  for (const sibling of getSiblings(spouse, relatives)) {
    pushEntry(sibling);

    const siblingSpouse = getEffectiveSpouse(sibling, relatives);
    if (siblingSpouse) {
      pushEntry(siblingSpouse);
    }
  }

  const sortedPeople = sortRelativesBySmartPriority(
    rootPerson,
    entries.map((entry) => entry.person),
    { allRelatives: relatives },
  );
  const entryById = new Map(entries.map((entry) => [entry.person.id, entry]));
  entries.length = 0;
  for (const person of sortedPeople) {
    const entry = entryById.get(person.id);
    if (entry) {
      entries.push(entry);
    }
  }

  return {
    spouse,
    entries,
    guidanceMessage:
      entries.length === 0
        ? 'Жұбай жағыndan туыс әлі қосылмаған немесе байланыстырылмаған.'
        : null,
  };
}

export function buildJurtGroups(
  rootPerson: Relative,
  relatives: Relative[],
  excludeIds: Set<string> = new Set(),
): JurtGroupsTree {
  return kinshipCacheService.getJurtGroups(rootPerson, relatives, excludeIds, () =>
    computeJurtGroups(rootPerson, relatives, excludeIds),
  );
}

function computeJurtGroups(
  rootPerson: Relative,
  relatives: Relative[],
  excludeIds: Set<string> = new Set(),
): JurtGroupsTree {
  const parentSide = buildParentSideRelativesTree(rootPerson, relatives, excludeIds);
  const parentSideIds = getParentSideRelativeIds(parentSide);
  const assignedIds = new Set<string>(parentSideIds);

  const ozEntries = branchToEntries(parentSide.fatherSide);
  const nagashyEntries = branchToEntries(parentSide.motherSide);

  for (const entry of ozEntries) {
    assignedIds.add(entry.person.id);
    entry.children.forEach((child) => assignedIds.add(child.id));
  }

  for (const entry of nagashyEntries) {
    assignedIds.add(entry.person.id);
    entry.children.forEach((child) => assignedIds.add(child.id));
  }

  const kayinBuilt = buildKayinEntries(rootPerson, relatives, excludeIds);
  for (const entry of kayinBuilt.entries) {
    assignedIds.add(entry.person.id);
    entry.children.forEach((child) => assignedIds.add(child.id));
  }

  const ozExtra = collectExtraJurtRelatives(rootPerson, relatives, excludeIds, assignedIds, 'oz');
  const nagashyExtra = collectExtraJurtRelatives(
    rootPerson,
    relatives,
    excludeIds,
    assignedIds,
    'nagashy',
  );
  const kayinExtra = collectExtraJurtRelatives(
    rootPerson,
    relatives,
    excludeIds,
    assignedIds,
    'kayin',
  );
  const kayinSubgroups = buildKayinJurtSubgroups(
    rootPerson,
    relatives,
    kayinBuilt.entries,
    kayinExtra,
  );

  const ozSubgroups = buildOzJurtSubgroups(
    rootPerson,
    relatives,
    excludeIds,
    ozEntries,
    ozExtra,
  );
  const flattenedOz = flattenOzJurtSubgroups(ozSubgroups);

  return {
    parentSide,
    oz: {
      kind: 'oz',
      guidanceMessage: parentSide.fatherSide.guidanceMessage,
      entries: flattenedOz.entries,
      extraRelatives: flattenedOz.extraRelatives,
      subgroups: ozSubgroups,
    },
    nagashy: {
      kind: 'nagashy',
      guidanceMessage: parentSide.motherSide.guidanceMessage,
      entries: nagashyEntries,
      extraRelatives: nagashyExtra,
    },
    kayin: {
      kind: 'kayin',
      guidanceMessage: kayinBuilt.guidanceMessage,
      entries: [],
      extraRelatives: [],
      subgroups: kayinSubgroups,
    },
  };
}

export function buildJurtGroupsForFocusedTree(
  rootPerson: Relative,
  relatives: Relative[],
  focusedTreeIds: Set<string>,
): JurtGroupsTree {
  return buildJurtGroups(rootPerson, relatives, focusedTreeIds);
}

export function countJurtRelatives(group: JurtSideGroup): number {
  if (group.subgroups?.length) {
    const first = group.subgroups[0];
    if (first && 'id' in first) {
      if (first.id === 'kayin_ata_ene' || first.id === 'kayin_siblings' || first.id === 'kuda') {
        return countKayinJurtSubgroups(group.subgroups as KayinJurtSubgroup[]);
      }

      return countOzJurtSubgroups(group.subgroups as OzJurtSubgroup[]);
    }
  }

  const entryCount = group.entries.reduce(
    (total, entry) => total + 1 + entry.children.length,
    0,
  );

  return entryCount + group.extraRelatives.length;
}

export function getJurtRelativeIds(tree: JurtGroupsTree): Set<string> {
  const ids = new Set<string>();

  for (const group of [tree.oz, tree.nagashy, tree.kayin]) {
    for (const entry of group.entries) {
      ids.add(entry.person.id);
      entry.children.forEach((child) => ids.add(child.id));
    }

    group.extraRelatives.forEach((relative) => ids.add(relative.id));
  }

  return ids;
}

/** Resolve jurt tab for one relative — delegates to central kinship service. */
export function resolveJurtKind(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): JurtKind | null {
  if (relativeLinkIdsMatch(rootPerson.id, targetPerson.id)) {
    return 'oz';
  }

  return mapThreeJurtGroupToJurtKind(getThreeJurtGroup(rootPerson, targetPerson, relatives));
}

export { getFocusedTreeRelativeIds };
