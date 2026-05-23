import type { Relative } from '@/types/relative';
import {
  getById as getGraphById,
  getChildren as getGraphChildren,
  getEffectiveSpouse as getGraphEffectiveSpouse,
  getGrandchildren as getGraphGrandchildren,
  getGrandparents as getGraphGrandparents,
  getParents as getGraphParents,
  getSiblings as getGraphSiblings,
  isFemale,
  isMale,
  sortRelativesByName,
} from '@/utils/family-graph';

export { getById, isFemale, isMale } from '@/utils/family-graph';

/** Parents linked through `father_id` and `mother_id`. */
export function getParents(relative: Relative, relatives: Relative[]): Relative[] {
  return sortRelativesByName(getGraphParents(relative, relatives));
}

/** Children linked through `father_id` / `mother_id` pointing to this person. */
export function getChildren(relative: Relative, relatives: Relative[]): Relative[] {
  return sortRelativesByName(getGraphChildren(relative, relatives));
}

/** Children by relative id — convenience wrapper for existing call sites. */
export function getChildrenById(relativeId: string, relatives: Relative[]): Relative[] {
  const person = getGraphById(relatives, relativeId);
  if (!person) {
    return [];
  }

  return getChildren(person, relatives);
}

/** Siblings share at least one linked parent. */
export function getSiblings(relative: Relative, relatives: Relative[]): Relative[] {
  return sortRelativesByName(getGraphSiblings(relative, relatives));
}

/** Parents of parents. */
export function getGrandparents(relative: Relative, relatives: Relative[]): Relative[] {
  return sortRelativesByName(getGraphGrandparents(relative, relatives));
}

/** Children of children. */
export function getGrandchildren(relative: Relative, relatives: Relative[]): Relative[] {
  return sortRelativesByName(getGraphGrandchildren(relative, relatives));
}

export function getEffectiveSpouse(relative: Relative, relatives: Relative[]): Relative | null {
  return getGraphEffectiveSpouse(relative, relatives);
}
