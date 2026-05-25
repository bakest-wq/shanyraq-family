import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import {
  getChildren,
  getEffectiveSpouse,
  getSiblings,
} from '@/utils/kinship/graph';
import { resolveKinshipResult } from '@/services/kinship/kinship-labels';
import type { KinshipType } from '@/services/kinship/types';
import { getRelativeDisplayName } from '@/utils/relative-names';

import {
  getRelativeLastViewedAt,
  getRelativeOpenCount,
} from '@/services/relative-interaction-session';

/** Lower number = higher priority. */
export const RELATIVE_PRIORITY_TIERS = {
  parents: 1,
  spouse: 2,
  children: 3,
  siblings: 4,
  siblingSpouses: 5,
  siblingChildren: 6,
  spouseSideClose: 7,
  extended: 8,
} as const;

export type RelativePriorityTier =
  (typeof RELATIVE_PRIORITY_TIERS)[keyof typeof RELATIVE_PRIORITY_TIERS];

const PARENT_TYPES = new Set<KinshipType>(['father', 'mother']);
const SPOUSE_TYPES = new Set<KinshipType>(['spouse', 'husband', 'wife']);
const CHILD_TYPES = new Set<KinshipType>(['son', 'daughter']);
const SIBLING_TYPES = new Set<KinshipType>([
  'aga',
  'ini',
  'apke',
  'singli',
  'sibling_neutral',
]);
const SIBLING_SPOUSE_TYPES = new Set<KinshipType>([
  'jenge',
  'brother_wife_neutral',
  'jezde',
  'kelin',
  'kuyeu_bala',
]);
const SIBLING_CHILD_TYPES = new Set<KinshipType>([
  'brother_child_older',
  'brother_child_younger',
  'brother_child_neutral',
]);
const SPOUSE_SIDE_CLOSE_TYPES = new Set<KinshipType>([
  'kayin_ata',
  'kayin_ene',
  'kayin_aga',
  'kayin_ini',
  'kayin_apke',
  'kayin_singli',
  'kayin_neutral',
  'kayin_jurt',
  'abysyn',
  'kayin_jezde',
]);

function isRootSiblingSpouse(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): boolean {
  for (const sibling of getSiblings(rootPerson, allRelatives)) {
    const siblingSpouse = getEffectiveSpouse(sibling, allRelatives);
    if (siblingSpouse && relativeLinkIdsMatch(siblingSpouse.id, targetPerson.id)) {
      return true;
    }
  }

  return false;
}

function isRootChildSpouse(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): boolean {
  for (const child of getChildren(rootPerson, allRelatives)) {
    const childSpouse = getEffectiveSpouse(child, allRelatives);
    if (childSpouse && relativeLinkIdsMatch(childSpouse.id, targetPerson.id)) {
      return true;
    }
  }

  return false;
}

function isSpouseSideCloseRelative(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): boolean {
  const spouse = getEffectiveSpouse(rootPerson, allRelatives);
  if (!spouse) {
    return false;
  }

  if (relativeLinkIdsMatch(targetPerson.id, spouse.id)) {
    return false;
  }

  if (
    (spouse.fatherId && relativeLinkIdsMatch(targetPerson.id, spouse.fatherId)) ||
    (spouse.motherId && relativeLinkIdsMatch(targetPerson.id, spouse.motherId))
  ) {
    return true;
  }

  for (const sibling of getSiblings(spouse, allRelatives)) {
    if (relativeLinkIdsMatch(sibling.id, targetPerson.id)) {
      return true;
    }

    const siblingSpouse = getEffectiveSpouse(sibling, allRelatives);
    if (siblingSpouse && relativeLinkIdsMatch(siblingSpouse.id, targetPerson.id)) {
      return true;
    }
  }

  for (const child of getChildren(spouse, allRelatives)) {
    if (relativeLinkIdsMatch(child.id, targetPerson.id)) {
      return true;
    }
  }

  return false;
}

function tierFromKinshipType(type: KinshipType): RelativePriorityTier | null {
  if (PARENT_TYPES.has(type)) {
    return RELATIVE_PRIORITY_TIERS.parents;
  }

  if (SPOUSE_TYPES.has(type)) {
    return RELATIVE_PRIORITY_TIERS.spouse;
  }

  if (CHILD_TYPES.has(type)) {
    return RELATIVE_PRIORITY_TIERS.children;
  }

  if (SIBLING_TYPES.has(type)) {
    return RELATIVE_PRIORITY_TIERS.siblings;
  }

  if (SIBLING_SPOUSE_TYPES.has(type)) {
    return RELATIVE_PRIORITY_TIERS.siblingSpouses;
  }

  if (SIBLING_CHILD_TYPES.has(type)) {
    return RELATIVE_PRIORITY_TIERS.siblingChildren;
  }

  if (SPOUSE_SIDE_CLOSE_TYPES.has(type)) {
    return RELATIVE_PRIORITY_TIERS.spouseSideClose;
  }

  return null;
}

/** Numeric kinship tier for one relative from the active root (1 = closest). */
export function getRelativePriorityTier(
  rootPerson: Relative,
  relative: Relative,
  relatives: Relative[],
): RelativePriorityTier {
  if (relativeLinkIdsMatch(rootPerson.id, relative.id)) {
    return RELATIVE_PRIORITY_TIERS.parents;
  }

  if (isRootSiblingSpouse(rootPerson, relative, relatives)) {
    return RELATIVE_PRIORITY_TIERS.siblingSpouses;
  }

  if (isRootChildSpouse(rootPerson, relative, relatives)) {
    return RELATIVE_PRIORITY_TIERS.siblingSpouses;
  }

  const result = resolveKinshipResult(rootPerson, relative, relatives);
  const fromType = tierFromKinshipType(result.type);
  if (fromType !== null) {
    return fromType;
  }

  if (isSpouseSideCloseRelative(rootPerson, relative, relatives)) {
    return RELATIVE_PRIORITY_TIERS.spouseSideClose;
  }

  return RELATIVE_PRIORITY_TIERS.extended;
}

export type SortRelativesBySmartPriorityOptions = {
  ignoreInteraction?: boolean;
  /** Most-recent-first ids (e.g. from recentPeopleService). Lower index = more recent. */
  recentIds?: string[];
  /** Full family graph for kinship tier resolution — defaults to `relatives`. */
  allRelatives?: Relative[];
};

function compareRelativesByName(left: Relative, right: Relative): number {
  const byName = getRelativeDisplayName(left).localeCompare(getRelativeDisplayName(right), 'ru');
  if (byName !== 0) {
    return byName;
  }

  return left.id.localeCompare(right.id);
}

function getRecentIndex(relativeId: string, recentIds?: string[]): number {
  if (!recentIds?.length) {
    return Number.POSITIVE_INFINITY;
  }

  const index = recentIds.findIndex((id) => relativeLinkIdsMatch(id, relativeId));
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

function compareByInteraction(
  rootPerson: Relative,
  left: Relative,
  right: Relative,
  options: SortRelativesBySmartPriorityOptions,
): number {
  if (options.ignoreInteraction) {
    return 0;
  }

  const recentLeft = getRecentIndex(left.id, options.recentIds);
  const recentRight = getRecentIndex(right.id, options.recentIds);
  if (recentLeft !== recentRight) {
    return recentLeft - recentRight;
  }

  const viewedLeft = getRelativeLastViewedAt(rootPerson.id, left.id) ?? 0;
  const viewedRight = getRelativeLastViewedAt(rootPerson.id, right.id) ?? 0;
  if (viewedLeft !== viewedRight) {
    return viewedRight - viewedLeft;
  }

  const opensLeft = getRelativeOpenCount(rootPerson.id, left.id);
  const opensRight = getRelativeOpenCount(rootPerson.id, right.id);
  if (opensLeft !== opensRight) {
    return opensRight - opensLeft;
  }

  return 0;
}

/** Stable sort: tier → recency/frequency → name → id. */
export function sortRelativesBySmartPriority(
  rootPerson: Relative,
  relatives: Relative[],
  options: SortRelativesBySmartPriorityOptions = {},
): Relative[] {
  const allRelatives = options.allRelatives ?? relatives;
  const indexed = relatives.map((relative, index) => ({ relative, index }));

  indexed.sort((leftEntry, rightEntry) => {
    const left = leftEntry.relative;
    const right = rightEntry.relative;

    const tierLeft = getRelativePriorityTier(rootPerson, left, allRelatives);
    const tierRight = getRelativePriorityTier(rootPerson, right, allRelatives);
    if (tierLeft !== tierRight) {
      return tierLeft - tierRight;
    }

    const byInteraction = compareByInteraction(rootPerson, left, right, options);
    if (byInteraction !== 0) {
      return byInteraction;
    }

    const byName = compareRelativesByName(left, right);
    if (byName !== 0) {
      return byName;
    }

    return leftEntry.index - rightEntry.index;
  });

  return indexed.map((entry) => entry.relative);
}
