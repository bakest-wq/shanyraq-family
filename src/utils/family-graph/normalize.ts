import type { Relative } from '@/types/relative';
import {
  findRelativeByLinkId,
  normalizeRelativeLinkId,
  relativeLinkIdsMatch,
} from '@/utils/family-link-picker';
import type { FamilyLinkSnapshot } from '@/utils/family-graph/types';

export function normalizeLinkId(value?: string | null): string | null {
  return normalizeRelativeLinkId(value);
}

export function normalizeFamilyLinkSnapshot(
  snapshot: FamilyLinkSnapshot,
): Required<FamilyLinkSnapshot> {
  return {
    fatherId: normalizeLinkId(snapshot.fatherId),
    motherId: normalizeLinkId(snapshot.motherId),
    spouseId: normalizeLinkId(snapshot.spouseId),
  };
}

export function normalizeRelativeStructuralLinks(relative: Relative): Relative {
  return {
    ...relative,
    fatherId: normalizeLinkId(relative.fatherId) ?? undefined,
    motherId: normalizeLinkId(relative.motherId) ?? undefined,
    spouseId: normalizeLinkId(relative.spouseId) ?? undefined,
  };
}

export function normalizeRelativeList(relatives: Relative[]): Relative[] {
  return relatives.map(normalizeRelativeStructuralLinks);
}

export function linksFromRelative(relative: Relative): Required<FamilyLinkSnapshot> {
  return normalizeFamilyLinkSnapshot({
    fatherId: relative.fatherId,
    motherId: relative.motherId,
    spouseId: relative.spouseId,
  });
}

export function mergeLinkSnapshots(
  base: FamilyLinkSnapshot,
  patch: Partial<FamilyLinkSnapshot>,
): Required<FamilyLinkSnapshot> {
  return normalizeFamilyLinkSnapshot({
    fatherId: patch.fatherId !== undefined ? patch.fatherId : base.fatherId,
    motherId: patch.motherId !== undefined ? patch.motherId : base.motherId,
    spouseId: patch.spouseId !== undefined ? patch.spouseId : base.spouseId,
  });
}

export function resolveLinkTarget(
  relatives: Relative[],
  linkId?: string | null,
): Relative | null {
  return findRelativeByLinkId(relatives, linkId);
}

export function linkTargetsExist(
  relatives: Relative[],
  snapshot: FamilyLinkSnapshot,
): boolean {
  const normalized = normalizeFamilyLinkSnapshot(snapshot);

  for (const linkId of [normalized.fatherId, normalized.motherId, normalized.spouseId]) {
    if (linkId && !resolveLinkTarget(relatives, linkId)) {
      return false;
    }
  }

  return true;
}

export function snapshotsEqual(a: FamilyLinkSnapshot, b: FamilyLinkSnapshot): boolean {
  const left = normalizeFamilyLinkSnapshot(a);
  const right = normalizeFamilyLinkSnapshot(b);

  return (
    left.fatherId === right.fatherId &&
    left.motherId === right.motherId &&
    left.spouseId === right.spouseId
  );
}

export function dedupeRelativesById(relatives: Relative[]): Relative[] {
  const seen = new Set<string>();

  return relatives.filter((relative) => {
    if (seen.has(relative.id)) {
      return false;
    }

    seen.add(relative.id);
    return true;
  });
}

export function sameParentPair(left: FamilyLinkSnapshot, right: FamilyLinkSnapshot): boolean {
  const a = normalizeFamilyLinkSnapshot(left);
  const b = normalizeFamilyLinkSnapshot(right);

  return (
    Boolean(a.fatherId && b.fatherId && relativeLinkIdsMatch(a.fatherId, b.fatherId)) &&
    Boolean(a.motherId && b.motherId && relativeLinkIdsMatch(a.motherId, b.motherId))
  );
}
