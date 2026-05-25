import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import {
  areSiblings,
  areSpouses,
  getChildren,
  getEffectiveSpouse,
  getParents,
  getSiblings,
} from '@/utils/kinship/graph';

/**
 * Direct core family relative to the Shezhire root — belongs on the main tree only,
 * never in Өз / Нағашы / Қайын жұрт tabs.
 */
export function isCoreFamilyRelation(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): boolean {
  if (relativeLinkIdsMatch(rootPerson.id, targetPerson.id)) {
    return true;
  }

  if (
    relativeLinkIdsMatch(targetPerson.id, rootPerson.fatherId) ||
    relativeLinkIdsMatch(targetPerson.id, rootPerson.motherId)
  ) {
    return true;
  }

  if (areSpouses(rootPerson, targetPerson)) {
    return true;
  }

  if (
    relativeLinkIdsMatch(targetPerson.fatherId, rootPerson.id) ||
    relativeLinkIdsMatch(targetPerson.motherId, rootPerson.id)
  ) {
    return true;
  }

  for (const child of getChildren(rootPerson, relatives)) {
    if (relativeLinkIdsMatch(child.id, targetPerson.id)) {
      return true;
    }
  }

  const spouse = getEffectiveSpouse(rootPerson, relatives);
  if (spouse) {
    for (const child of getChildren(spouse, relatives)) {
      if (!relativeLinkIdsMatch(child.id, targetPerson.id)) {
        continue;
      }

      // Co-parented or spouse-only child link — still main-tree balalar, never kayin jurt.
      if (
        relativeLinkIdsMatch(child.fatherId, rootPerson.id) ||
        relativeLinkIdsMatch(child.motherId, rootPerson.id) ||
        relativeLinkIdsMatch(child.fatherId, spouse.id) ||
        relativeLinkIdsMatch(child.motherId, spouse.id)
      ) {
        return true;
      }
    }
  }

  for (const parent of getParents(rootPerson, relatives)) {
    if (relativeLinkIdsMatch(parent.id, targetPerson.id)) {
      return true;
    }
  }

  if (areSiblings(rootPerson, targetPerson, relatives)) {
    return true;
  }

  for (const sibling of getSiblings(rootPerson, relatives)) {
    if (relativeLinkIdsMatch(sibling.id, targetPerson.id)) {
      return true;
    }
  }

  return false;
}

/** Alias for jurt grouping guards. */
export const isDirectCoreFamily = isCoreFamilyRelation;
