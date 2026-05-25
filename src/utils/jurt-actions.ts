import { SHEZHIRE_FOCUSED_ROOT, SHEZHIRE_JURT } from '@/constants/family-ux-content';
import type { Relative } from '@/types/relative';
import type { JurtKind } from '@/utils/jurt-grouping';
import {
  getParentGrandparentLinks,
  resolveParentByKind,
} from '@/utils/parent-side-quality';
import { getEffectiveSpouse } from '@/utils/relationship-engine';
import { resolveShezhireRootPerson } from '@/utils/shezhire-parent-lookup';
import type { ParentSideSiblingAddParams } from '@/utils/parent-side-sibling-add';

export type JurtAddNavigateParams = {
  context: string;
  relationship: string;
  rootId: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
};

export type JurtSideAddAction =
  | {
      status: 'blocked';
      message: string;
      buttonLabel: string;
    }
  | {
      status: 'ready';
      buttonLabel: string;
      navigate: JurtAddNavigateParams;
      legacyParams: ParentSideSiblingAddParams | null;
    };

function resolveFreshRoot(rootPerson: Relative, relatives: Relative[]): Relative {
  return resolveShezhireRootPerson(rootPerson, relatives) ?? rootPerson;
}

function resolveParentForSide(
  kind: 'father' | 'mother',
  rootPerson: Relative,
  relatives: Relative[],
  hintParent?: Relative | null,
): Relative | null {
  const root = resolveFreshRoot(rootPerson, relatives);
  return resolveParentByKind(kind, root, relatives, hintParent);
}

export function resolveFatherSideSiblingAdd(
  rootPerson: Relative,
  relatives: Relative[],
  fatherParent?: Relative | null,
): JurtSideAddAction {
  const copy = SHEZHIRE_FOCUSED_ROOT.parentSide;
  const root = resolveFreshRoot(rootPerson, relatives);
  const father = resolveParentForSide('father', root, relatives, fatherParent);
  const mother = resolveParentByKind('mother', root, relatives);

  console.log('resolved father', father);
  console.log('resolved mother', mother);

  if (!father) {
    return {
      status: 'blocked',
      message: copy.fatherMissing,
      buttonLabel: copy.addFatherSibling,
    };
  }

  const grandparents = getParentGrandparentLinks(father);

  if (!grandparents) {
    return {
      status: 'blocked',
      message: copy.grandparentsMissingFather,
      buttonLabel: copy.addFatherSibling,
    };
  }

  return {
    status: 'ready',
    buttonLabel: copy.addFatherSibling,
    navigate: {
      context: 'father_side_sibling',
      relationship: 'father_side_sibling',
      rootId: root.id,
      fatherId: grandparents.fatherId,
      motherId: grandparents.motherId,
    },
    legacyParams: {
      relationship: 'father_side_sibling',
      rootId: root.id,
      fatherId: grandparents.fatherId,
      motherId: grandparents.motherId,
    },
  };
}

export function resolveMotherSideSiblingAdd(
  rootPerson: Relative,
  relatives: Relative[],
  motherParent?: Relative | null,
): JurtSideAddAction {
  const copy = SHEZHIRE_FOCUSED_ROOT.parentSide;
  const root = resolveFreshRoot(rootPerson, relatives);
  const mother = resolveParentForSide('mother', root, relatives, motherParent);
  const father = resolveParentByKind('father', root, relatives);

  console.log('resolved father', father);
  console.log('resolved mother', mother);

  if (!mother) {
    return {
      status: 'blocked',
      message: copy.motherMissing,
      buttonLabel: copy.addMotherSibling,
    };
  }

  const grandparents = getParentGrandparentLinks(mother);

  if (!grandparents) {
    return {
      status: 'blocked',
      message: copy.grandparentsMissingMother,
      buttonLabel: copy.addMotherSibling,
    };
  }

  return {
    status: 'ready',
    buttonLabel: copy.addMotherSibling,
    navigate: {
      context: 'mother_side_sibling',
      relationship: 'mother_side_sibling',
      rootId: root.id,
      fatherId: grandparents.fatherId,
      motherId: grandparents.motherId,
    },
    legacyParams: {
      relationship: 'mother_side_sibling',
      rootId: root.id,
      fatherId: grandparents.fatherId,
      motherId: grandparents.motherId,
    },
  };
}

export function resolveKayinSideAdd(
  rootPerson: Relative,
  relatives: Relative[],
): JurtSideAddAction {
  const spouse = getEffectiveSpouse(rootPerson, relatives);

  if (!spouse) {
    return {
      status: 'blocked',
      message: SHEZHIRE_JURT.kayinSpouseMissing,
      buttonLabel: SHEZHIRE_JURT.addKayinRelative,
    };
  }

  return {
    status: 'ready',
    buttonLabel: SHEZHIRE_JURT.addKayinRelative,
    navigate: {
      context: 'kayin',
      relationship: 'Туысы',
      rootId: rootPerson.id,
      spouseId: spouse.id,
    },
    legacyParams: null,
  };
}

export function resolveJurtSideAddAction(
  kind: JurtKind,
  rootPerson: Relative,
  relatives: Relative[],
  options?: {
    fatherParent?: Relative | null;
    motherParent?: Relative | null;
  },
): JurtSideAddAction {
  if (kind === 'kayin') {
    return resolveKayinSideAdd(rootPerson, relatives);
  }

  if (kind === 'oz') {
    return resolveFatherSideSiblingAdd(rootPerson, relatives, options?.fatherParent);
  }

  return resolveMotherSideSiblingAdd(rootPerson, relatives, options?.motherParent);
}

export function jurtNavigateParamsToRouterRecord(
  params: JurtAddNavigateParams,
): Record<string, string> {
  const record: Record<string, string> = {
    context: params.context,
    relationship: params.relationship,
    rootId: params.rootId,
  };

  if (params.fatherId) {
    record.fatherId = params.fatherId;
    record.father_id = params.fatherId;
  }

  if (params.motherId) {
    record.motherId = params.motherId;
    record.mother_id = params.motherId;
  }

  if (params.spouseId) {
    record.spouseId = params.spouseId;
  }

  return record;
}

export function getAddRelativeContextHelper(context: string | null | undefined): string | null {
  if (!context) {
    return null;
  }

  if (context === 'father_side_sibling') {
    return SHEZHIRE_JURT.contextHelper.fatherSideSibling;
  }

  if (context === 'mother_side_sibling') {
    return SHEZHIRE_JURT.contextHelper.motherSideSibling;
  }

  if (context === 'kayin') {
    return SHEZHIRE_JURT.contextHelper.kayin;
  }

  return null;
}
