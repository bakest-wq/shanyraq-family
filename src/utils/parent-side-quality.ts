import { SHEZHIRE_FOCUSED_ROOT } from '@/constants/family-ux-content';
import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';

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
): Relative | null {
  const parentId = kind === 'father' ? rootPerson.fatherId : rootPerson.motherId;

  if (!parentId) {
    return null;
  }

  return relatives.find((relative) => relativeLinkIdsMatch(relative.id, parentId)) ?? null;
}

export function getParentGrandparentLinks(parent: Relative): ParentSideGrandparentLinks | null {
  const fatherId = parent.fatherId?.trim();
  const motherId = parent.motherId?.trim();

  if (!fatherId || !motherId) {
    return null;
  }

  return { fatherId, motherId };
}

export function evaluateParentSideGuard(
  kind: ParentSideKind,
  rootPerson: Relative,
  relatives: Relative[],
): ParentSideGuardResult {
  const parent = resolveParentByKind(kind, rootPerson, relatives);

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
