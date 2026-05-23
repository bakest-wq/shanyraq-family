import { SHEZHIRE_FOCUSED_ROOT } from '@/constants/family-ux-content';
import type { Relative } from '@/types/relative';
import {
  evaluateParentSideGuard,
  getParentSideGuidanceMessage,
  type ParentSideKind,
} from '@/utils/parent-side-quality';

export type { ParentSideKind } from '@/utils/parent-side-quality';

export type ParentSideSiblingRelationship = 'father_side_sibling' | 'mother_side_sibling';

export type ParentSideSiblingAddParams = {
  fatherId: string;
  motherId: string;
  relationship: ParentSideSiblingRelationship;
  rootId: string;
};

export type ParentSideSiblingAddAction = {
  kind: ParentSideKind;
  canAdd: boolean;
  blockedReason?: 'parent_missing' | 'grandparents_missing';
  blockedMessage?: string;
  helperText: string;
  autoLabelHelper: string;
  buttonLabel: string;
  relationship: ParentSideSiblingRelationship;
  fatherId: string | null;
  motherId: string | null;
  addParams: ParentSideSiblingAddParams | null;
};

const RELATIONSHIP_BY_KIND: Record<ParentSideKind, ParentSideSiblingRelationship> = {
  father: 'father_side_sibling',
  mother: 'mother_side_sibling',
};

export function isParentSideSiblingRelationship(value: string): value is ParentSideSiblingRelationship {
  return value === 'father_side_sibling' || value === 'mother_side_sibling';
}

export function getParentSideSiblingHelperText(relationship: string): string | null {
  const copy = SHEZHIRE_FOCUSED_ROOT.parentSide;

  if (relationship === 'father_side_sibling') {
    return copy.helperFatherSibling;
  }

  if (relationship === 'mother_side_sibling') {
    return copy.helperMotherSibling;
  }

  return null;
}

export function getParentSideAutoLabelHelperText(): string {
  return SHEZHIRE_FOCUSED_ROOT.parentSide.kinshipAutoCalculated;
}

export function buildParentSideSiblingAddAction(
  kind: ParentSideKind,
  rootPerson: Relative,
  relatives: Relative[],
): ParentSideSiblingAddAction {
  const copy = SHEZHIRE_FOCUSED_ROOT.parentSide;
  const relationship = RELATIONSHIP_BY_KIND[kind];
  const helperText = kind === 'father' ? copy.helperFatherSibling : copy.helperMotherSibling;
  const buttonLabel = kind === 'father' ? copy.addFatherSibling : copy.addMotherSibling;
  const autoLabelHelper = copy.kinshipAutoCalculated;
  const guard = evaluateParentSideGuard(kind, rootPerson, relatives);

  const base = {
    kind,
    helperText,
    autoLabelHelper,
    buttonLabel,
    relationship,
    fatherId: null,
    motherId: null,
    addParams: null,
    canAdd: false,
  } satisfies Omit<ParentSideSiblingAddAction, 'canAdd'> & { canAdd: boolean };

  if (guard.state !== 'ready') {
    return {
      ...base,
      blockedReason: guard.state,
      blockedMessage: getParentSideGuidanceMessage(guard) ?? undefined,
    };
  }

  const addParams: ParentSideSiblingAddParams = {
    relationship,
    rootId: rootPerson.id,
    fatherId: guard.grandparents.fatherId,
    motherId: guard.grandparents.motherId,
  };

  return {
    kind,
    canAdd: true,
    helperText,
    autoLabelHelper,
    buttonLabel,
    relationship,
    fatherId: guard.grandparents.fatherId,
    motherId: guard.grandparents.motherId,
    addParams,
  };
}
