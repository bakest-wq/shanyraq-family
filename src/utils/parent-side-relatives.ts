import type { Relative } from '@/types/relative';
import { isCoreFamilyRelation } from '@/utils/core-family-relation';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getShezhireSiblingIds } from '@/utils/focused-family-tree';
import {
  evaluateParentSideGuard,
  getParentSideGuidanceMessage,
  sharesExactParentsWith,
  type ParentSideKind,
} from '@/utils/parent-side-quality';
import { sortRelativesBySmartPriority } from '@/services/relative-priority-sort';

export type { ParentSideKind } from '@/utils/parent-side-quality';

export type ParentSideRelativeEntry = {
  person: Relative;
  children: Relative[];
};

export type ParentSideBranch = {
  side: ParentSideKind;
  parent: Relative | null;
  parentLinked: boolean;
  grandparentsReady: boolean;
  guidanceMessage: string | null;
  entries: ParentSideRelativeEntry[];
};

export type ParentSideRelativesTree = {
  fatherSide: ParentSideBranch;
  motherSide: ParentSideBranch;
};

function sortRelatives(
  rootPerson: Relative,
  relatives: Relative[],
  allRelatives: Relative[],
): Relative[] {
  return sortRelativesBySmartPriority(rootPerson, relatives, { allRelatives });
}

function isLiving(relative: Relative): boolean {
  return !relative.isDeceased;
}

function isExcluded(relative: Relative, excludeIds: Set<string>): boolean {
  return [...excludeIds].some((id) => relativeLinkIdsMatch(id, relative.id));
}

function findParentSiblings(
  parent: Relative,
  rootPerson: Relative,
  rootSiblingIds: Set<string>,
  relatives: Relative[],
  excludeIds: Set<string>,
  grandparents: { fatherId: string; motherId: string },
): Relative[] {
  return sortRelatives(
    rootPerson,
    relatives.filter((relative) => {
      if (!isLiving(relative)) {
        return false;
      }

      if (relativeLinkIdsMatch(relative.id, rootPerson.id)) {
        return false;
      }

      if (rootSiblingIds.has(relative.id)) {
        return false;
      }

      if (isExcluded(relative, excludeIds)) {
        return false;
      }

      return sharesExactParentsWith(relative, parent, grandparents);
    }),
    relatives,
  );
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

function buildBranchEntries(
  parent: Relative,
  rootPerson: Relative,
  rootSiblingIds: Set<string>,
  relatives: Relative[],
  excludeIds: Set<string>,
  grandparents: { fatherId: string; motherId: string },
): ParentSideRelativeEntry[] {
  const siblings = findParentSiblings(
    parent,
    rootPerson,
    rootSiblingIds,
    relatives,
    excludeIds,
    grandparents,
  );

  return siblings.map((person) => ({
    person,
    children: findChildrenOf(rootPerson, person, relatives).filter(
      (child) =>
        !isExcluded(child, excludeIds) &&
        !isCoreFamilyRelation(rootPerson, child, relatives),
    ),
  }));
}

function buildBranch(
  kind: ParentSideKind,
  rootPerson: Relative,
  rootSiblingIds: Set<string>,
  relatives: Relative[],
  excludeIds: Set<string>,
): ParentSideBranch {
  const guard = evaluateParentSideGuard(kind, rootPerson, relatives);
  const guidanceMessage = getParentSideGuidanceMessage(guard);

  if (guard.state === 'parent_missing') {
    return {
      side: kind,
      parent: null,
      parentLinked: false,
      grandparentsReady: false,
      guidanceMessage,
      entries: [],
    };
  }

  if (guard.state === 'grandparents_missing') {
    return {
      side: kind,
      parent: guard.parent,
      parentLinked: true,
      grandparentsReady: false,
      guidanceMessage,
      entries: [],
    };
  }

  return {
    side: kind,
    parent: guard.parent,
    parentLinked: true,
    grandparentsReady: true,
    guidanceMessage: null,
    entries: buildBranchEntries(
      guard.parent,
      rootPerson,
      rootSiblingIds,
      relatives,
      excludeIds,
      guard.grandparents,
    ),
  };
}

export function buildParentSideRelativesTree(
  rootPerson: Relative,
  relatives: Relative[],
  excludeIds: Set<string> = new Set(),
): ParentSideRelativesTree {
  const rootSiblingIds = getShezhireSiblingIds(rootPerson, relatives);

  return {
    fatherSide: buildBranch('father', rootPerson, rootSiblingIds, relatives, excludeIds),
    motherSide: buildBranch('mother', rootPerson, rootSiblingIds, relatives, excludeIds),
  };
}

export function getParentSideRelativeIds(tree: ParentSideRelativesTree): Set<string> {
  const ids = new Set<string>();

  for (const branch of [tree.fatherSide, tree.motherSide]) {
    for (const entry of branch.entries) {
      ids.add(entry.person.id);

      for (const child of entry.children) {
        ids.add(child.id);
      }
    }
  }

  return ids;
}

export function countParentSideRelatives(branch: ParentSideBranch): number {
  return branch.entries.reduce((total, entry) => total + 1 + entry.children.length, 0);
}

export function hasParentSideRelatives(tree: ParentSideRelativesTree): boolean {
  return tree.fatherSide.entries.length > 0 || tree.motherSide.entries.length > 0;
}
