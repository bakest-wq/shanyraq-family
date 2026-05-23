import type { Relative } from '@/types/relative';
import { findRelativeByLinkId, relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { findFamilyAnchor } from '@/utils/kinship-path';

export function resolveMyRelative(
  relatives: Relative[],
  myRelativeId?: string | null,
): Relative | null {
  if (myRelativeId) {
    const linked = findRelativeByLinkId(relatives, myRelativeId);
    if (linked && !linked.isDeceased) {
      return linked;
    }
  }

  return findFamilyAnchor(relatives.filter((relative) => !relative.isDeceased));
}

export function resolveMyRelativeId(
  relatives: Relative[],
  myRelativeId?: string | null,
): string | null {
  const person = resolveMyRelative(relatives, myRelativeId);
  return person?.id ?? null;
}

export function isLinkedToMyRelative(
  relativeId: string,
  myRelativeId?: string | null,
): boolean {
  return Boolean(myRelativeId && relativeLinkIdsMatch(relativeId, myRelativeId));
}
