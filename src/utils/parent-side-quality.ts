import { SHEZHIRE_FOCUSED_ROOT } from '@/constants/family-ux-content';
import type { Relative } from '@/types/relative';
import {
  findRelativeByLinkId,
  normalizeRelativeLinkId,
  relativeLinkIdsMatch,
} from '@/utils/family-link-picker';
import { resolveShezhireRootPerson } from '@/utils/shezhire-parent-lookup';

export type ParentSideKind = 'father' | 'mother';

export type ParentSideGrandparentLinks = {
  fatherId: string;
  motherId: string;
};

export type ParentSideGuardResult =
  | {
      state: 'ready';
      kind: ParentSideKind;
      parent: Relative;
      grandparents: ParentSideGrandparentLinks;
    }
  | {
      state: 'parent_missing';
      kind: ParentSideKind;
    }
  | {
      state: 'grandparents_missing';
      kind: ParentSideKind;
      parent: Relative;
    };

export function resolveParentByKind(
  kind: ParentSideKind,
  rootPerson: Relative,
  relatives: Relative[],
  hintParent?: Relative | null,
): Relative | null {
  const root = resolveShezhireRootPerson(rootPerson, relatives) ?? rootPerson;
  const linkId =
    normalizeRelativeLinkId(kind === 'father' ? root.fatherId : root.motherId) ??
    (hintParent ? normalizeRelativeLinkId(hintParent.id) : null);

  if (!linkId) {
    return null;
  }

  const fromRelatives = findRelativeByLinkId(relatives, linkId);
  if (fromRelatives) {
    return fromRelatives;
  }

  if (hintParent && relativeLinkIdsMatch(hintParent.id, linkId)) {
    return hintParent;
  }

  return null;
}

export function getParentGrandparentLinks(parent: Relative): ParentSideGrandparentLinks | null {
  const fatherId = normalizeRelativeLinkId(parent.fatherId);
  const motherId = normalizeRelativeLinkId(parent.motherId);

  if (!fatherId || !motherId) {
    return null;
  }

  return { fatherId, motherId };
}

export function evaluateParentSideGuard(
  kind: ParentSideKind,
  rootPerson: Relative,
  relatives: Relative[],
  hintParent?: Relative | null,
): ParentSideGuardResult {
  const parent = resolveParentByKind(kind, rootPerson, relatives, hintParent);

  if (!parent) {
    return { state: 'parent_missing', kind };
  }

  const grandparents = getParentGrandparentLinks(parent);

  if (!grandparents) {
    return { state: 'grandparents_missing', kind, parent };
  }

  return {
    state: 'ready',
    kind,
    parent,
    grandparents,
  };
}

export function getParentSideGrandparentsMissingMessage(kind: ParentSideKind): string {
  const copy = SHEZHIRE_FOCUSED_ROOT.parentSide;

  if (kind === 'father') {
    return copy.grandparentsMissingFather;
  }

  return copy.grandparentsMissingMother;
}

export function getParentSideGuidanceMessage(guard: ParentSideGuardResult): string | null {
  if (guard.state === 'parent_missing') {
    const copy = SHEZHIRE_FOCUSED_ROOT.parentSide;
    return guard.kind === 'father' ? copy.fatherMissing : copy.motherMissing;
  }

  if (guard.state === 'grandparents_missing') {
    return getParentSideGrandparentsMissingMessage(guard.kind);
  }

  return null;
}

export function sharesExactParentsWith(
  candidate: Relative,
  parent: Relative,
  grandparents: ParentSideGrandparentLinks,
): boolean {
  return (
    Boolean(
      candidate.fatherId &&
        relativeLinkIdsMatch(candidate.fatherId, grandparents.fatherId),
    ) &&
    Boolean(
      candidate.motherId &&
        relativeLinkIdsMatch(candidate.motherId, grandparents.motherId),
    ) &&
    !relativeLinkIdsMatch(candidate.id, parent.id)
  );
}
