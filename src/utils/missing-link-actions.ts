import type { ConnectParentsInput, Relative } from '@/types/relative';
import { normalizeRelativeLinkId } from '@/utils/family-link-picker';
import { getFocusedAddChildParams } from '@/utils/focused-family-tree';
import type { PendingRootLinkAfterSave } from '@/services/guided-family-builder.service';
import { isFemale, isMale } from '@/utils/relationship-engine';

export type MissingLinkSavePatch = {
  personId: string;
  patch: Partial<ConnectParentsInput>;
};

export type MissingLinkKind = 'father' | 'mother' | 'spouse' | 'child' | 'sibling';

export type MissingLinkContext =
  | 'add_father'
  | 'add_mother'
  | 'add_spouse'
  | 'add_child'
  | 'add_sibling';

export type MissingLinkNavigateParams = Record<string, string>;

export function isMissingLinkContext(
  context: string | null | undefined,
): context is MissingLinkContext {
  return (
    context === 'add_father' ||
    context === 'add_mother' ||
    context === 'add_spouse' ||
    context === 'add_child' ||
    context === 'add_sibling'
  );
}

export function missingLinkKindToContext(kind: MissingLinkKind): MissingLinkContext {
  return `add_${kind}` as MissingLinkContext;
}

export function hasMissingFather(person: Relative): boolean {
  return !normalizeRelativeLinkId(person.fatherId);
}

export function hasMissingMother(person: Relative): boolean {
  return !normalizeRelativeLinkId(person.motherId);
}

export function hasMissingSpouse(
  _person: Relative,
  resolvedSpouse: Relative | null,
): boolean {
  return !resolvedSpouse;
}

export function resolveSpousePresetForTarget(target: Relative): {
  relationship: string;
  gender?: 'male' | 'female';
} {
  if (isMale(target)) {
    return { relationship: 'Әйелі', gender: 'female' };
  }

  if (isFemale(target)) {
    return { relationship: 'Күйеуі', gender: 'male' };
  }

  return { relationship: 'Жұбайы' };
}

export function buildMissingLinkNavigateParams(
  kind: MissingLinkKind,
  targetPerson: Relative,
  options: {
    shezhireRootId: string;
    spouse?: Relative | null;
  },
): MissingLinkNavigateParams {
  const base: MissingLinkNavigateParams = {
    context: missingLinkKindToContext(kind),
    targetRelativeId: targetPerson.id,
    target_relative_id: targetPerson.id,
    rootId: options.shezhireRootId,
    returnTo: 'shezhire',
  };

  switch (kind) {
    case 'father':
      return {
        ...base,
        gender: 'male',
        relationship: 'Әке',
      };
    case 'mother':
      return {
        ...base,
        gender: 'female',
        relationship: 'Ана',
      };
    case 'spouse': {
      const preset = resolveSpousePresetForTarget(targetPerson);
      return {
        ...base,
        relationship: preset.relationship,
        spouseId: targetPerson.id,
        ...(preset.gender ? { gender: preset.gender } : {}),
      };
    }
    case 'child': {
      const childParams = getFocusedAddChildParams(targetPerson, options.spouse ?? null);
      return {
        ...base,
        parentRelativeId: targetPerson.id,
        parent_relative_id: targetPerson.id,
        relationship: 'Бала',
        ...(childParams.fatherId
          ? { fatherId: childParams.fatherId, father_id: childParams.fatherId }
          : {}),
        ...(childParams.motherId
          ? { motherId: childParams.motherId, mother_id: childParams.motherId }
          : {}),
      };
    }
    case 'sibling':
      return {
        ...base,
        relationship: 'Бауыр',
        siblingReferenceId: targetPerson.id,
        ...(targetPerson.fatherId
          ? { fatherId: targetPerson.fatherId, father_id: targetPerson.fatherId }
          : {}),
        ...(targetPerson.motherId
          ? { motherId: targetPerson.motherId, mother_id: targetPerson.motherId }
          : {}),
      };
  }
}

export function resolvePendingMissingLinkAfterSave(
  context: MissingLinkContext,
  targetPersonId: string,
): PendingRootLinkAfterSave | null {
  if (context === 'add_father') {
    return {
      rootPersonId: targetPersonId,
      linkField: 'fatherId',
    };
  }

  if (context === 'add_mother') {
    return {
      rootPersonId: targetPersonId,
      linkField: 'motherId',
    };
  }

  return null;
}

export function resolveMissingLinkSavePatches(
  context: MissingLinkContext,
  targetPersonId: string,
  createdRelativeId: string,
  options: {
    targetPerson?: Relative | null;
    spouse?: Relative | null;
  } = {},
): MissingLinkSavePatch[] {
  switch (context) {
    case 'add_father':
      return [{ personId: targetPersonId, patch: { fatherId: createdRelativeId } }];
    case 'add_mother':
      return [{ personId: targetPersonId, patch: { motherId: createdRelativeId } }];
    case 'add_spouse':
      return [{ personId: targetPersonId, patch: { spouseId: createdRelativeId } }];
    case 'add_child': {
      if (!options.targetPerson) {
        return [];
      }

      const childParams = getFocusedAddChildParams(
        options.targetPerson,
        options.spouse ?? null,
      );
      const patch: Partial<ConnectParentsInput> = {};

      if (childParams.fatherId) {
        patch.fatherId = childParams.fatherId;
      }

      if (childParams.motherId) {
        patch.motherId = childParams.motherId;
      }

      return Object.keys(patch).length > 0
        ? [{ personId: createdRelativeId, patch }]
        : [];
    }
    case 'add_sibling':
      return [];
  }
}

export function getMissingLinkActionLabel(kind: MissingLinkKind): string {
  switch (kind) {
    case 'father':
      return '+ Әкесін қосу';
    case 'mother':
      return '+ Анасын қосу';
    case 'spouse':
      return '+ Жұбайын қосу';
    case 'child':
      return '+ Баласын қосу';
    case 'sibling':
      return '+ Бауырын қосу';
  }
}

export function getMissingLinkContextHelper(context: MissingLinkContext): string {
  switch (context) {
    case 'add_father':
      return 'Әкенің аты-жөнін енгізіңіз — ол автоматты түрде байланысады.';
    case 'add_mother':
      return 'Ананың аты-жөнін енгізіңіз — ол автоматты түрде байланысады.';
    case 'add_spouse':
      return 'Жұбайдың аты-жөнін енгізіңіз — екеуі бір-біріне байланысады.';
    case 'add_child':
      return 'Баланың аты-жөнін енгізіңіз — ата-анасымен бірге сақталады.';
    case 'add_sibling':
      return 'Бауырыңыздың аты-жөнін енгізіңіз — ата-анасы автоматты түрде байланысады.';
  }
}

export function shouldReturnToShezhireAfterSave(
  returnTo: string | null | undefined,
  context: string | null | undefined,
): boolean {
  return returnTo === 'shezhire' || isMissingLinkContext(context);
}
