import type { Relative } from '@/types/relative';
import { kk, FAMILY_LANGUAGE } from '@/content/family-language';
import { getKinshipLabelText } from '@/utils/kinship/labels.kz';
import type { KinshipCategory, KinshipPathStep, KinshipResult, KinshipType } from '@/utils/kinship/types';
import { compareBirthYear, isFemale, isMale } from '@/utils/kinship/graph';

const CATEGORY_BY_TYPE: Record<KinshipType, KinshipCategory> = {
  self: 'self',
  father: 'direct',
  mother: 'direct',
  son: 'direct',
  daughter: 'direct',
  spouse: 'direct',
  husband: 'direct',
  wife: 'direct',
  aga: 'sibling',
  ini: 'sibling',
  apke: 'sibling',
  singli: 'sibling',
  sibling_neutral: 'sibling',
  grandfather: 'grand',
  grandmother: 'grand',
  nemere: 'grand',
  shobere: 'grand',
  jenge: 'in_law',
  brother_wife_neutral: 'in_law',
  jezde: 'in_law',
  kelin: 'in_law',
  kuyeu_bala: 'in_law',
  kayin_ata: 'in_law',
  kayin_ene: 'in_law',
  kayin_aga: 'in_law',
  kayin_ini: 'in_law',
  kayin_apke: 'in_law',
  kayin_singli: 'in_law',
  kayin_neutral: 'in_law',
  kayin_jurt: 'in_law',
  abysyn: 'in_law',
  kayin_jezde: 'in_law',
  nagashy_ata: 'nagashy',
  nagashy_aje: 'nagashy',
  nagashy_aga: 'nagashy',
  nagashy_ini: 'nagashy',
  nagashy_apke: 'nagashy',
  nagashy_singli: 'nagashy',
  nagashy_neutral: 'nagashy',
  paternal_aga: 'paternal',
  paternal_ini: 'paternal',
  paternal_apke: 'paternal',
  paternal_singli: 'paternal',
  paternal_neutral: 'paternal',
  zhien: 'extended',
  brother_child_older: 'extended',
  brother_child_younger: 'extended',
  brother_child_neutral: 'extended',
  bole: 'extended',
  tuas: 'extended',
  kuda: 'kuda',
  kudagi: 'kuda',
  kuda_neutral: 'kuda',
  relative_neutral: 'extended',
  unknown: 'unknown',
};

export type SiblingAgeMap = {
  olderMale: KinshipType;
  youngerMale: KinshipType;
  olderFemale: KinshipType;
  youngerFemale: KinshipType;
  neutral: KinshipType;
};

export function buildKinshipResult(
  type: KinshipType,
  options: {
    uncertain?: boolean;
    missingGenderHint?: boolean;
    pathSteps?: KinshipPathStep[];
    labelOverride?: KinshipResult['label'];
    resolved?: boolean;
    confidenceHint?: string;
  } = {},
): KinshipResult {
  return {
    type,
    category: CATEGORY_BY_TYPE[type],
    label: options.labelOverride ?? getKinshipLabelText(type),
    uncertain: options.uncertain ?? false,
    missingGenderHint: options.missingGenderHint ?? false,
    pathSteps: options.pathSteps ?? [],
    resolved: options.resolved ?? type !== 'unknown',
    confidenceHint: options.confidenceHint,
  };
}

export function resolveSiblingAgeType(
  anchor: Relative,
  sibling: Relative,
  map: SiblingAgeMap,
): Pick<KinshipResult, 'type' | 'uncertain' | 'missingGenderHint'> {
  const ageOrder = compareBirthYear(sibling, anchor);

  if (isMale(sibling)) {
    if (ageOrder === 'older') {
      return { type: map.olderMale, uncertain: false, missingGenderHint: false };
    }

    if (ageOrder === 'younger') {
      return { type: map.youngerMale, uncertain: false, missingGenderHint: false };
    }

    return { type: map.neutral, uncertain: true, missingGenderHint: false };
  }

  if (isFemale(sibling)) {
    if (ageOrder === 'older') {
      return { type: map.olderFemale, uncertain: false, missingGenderHint: false };
    }

    if (ageOrder === 'younger') {
      return { type: map.youngerFemale, uncertain: false, missingGenderHint: false };
    }

    return { type: map.neutral, uncertain: true, missingGenderHint: false };
  }

  return { type: map.neutral, uncertain: true, missingGenderHint: true };
}

export function siblingStepLabel(type: KinshipType): string {
  return getKinshipLabelText(type).kazakh.toLowerCase();
}

export const ROOT_SIBLING_AGE_MAP: SiblingAgeMap = {
  olderMale: 'aga',
  youngerMale: 'ini',
  olderFemale: 'apke',
  youngerFemale: 'singli',
  neutral: 'sibling_neutral',
};

export const NAGASHY_SIBLING_AGE_MAP: SiblingAgeMap = {
  olderMale: 'nagashy_aga',
  youngerMale: 'nagashy_ini',
  olderFemale: 'nagashy_apke',
  youngerFemale: 'nagashy_singli',
  neutral: 'nagashy_neutral',
};

export const PATERNAL_SIBLING_AGE_MAP: SiblingAgeMap = {
  olderMale: 'paternal_aga',
  youngerMale: 'paternal_ini',
  olderFemale: 'paternal_apke',
  youngerFemale: 'paternal_singli',
  neutral: 'paternal_neutral',
};

export const KAYIN_SIBLING_AGE_MAP: SiblingAgeMap = {
  olderMale: 'kayin_aga',
  youngerMale: 'kayin_ini',
  olderFemale: 'kayin_apke',
  youngerFemale: 'kayin_singli',
  neutral: 'kayin_neutral',
};

export const PARTIAL_PARENT_HINT = kk(FAMILY_LANGUAGE.relationships.partialParentHint);

export const INCOMPLETE_LINK_HINT = kk(FAMILY_LANGUAGE.relationships.incompleteLink);

export const UNKNOWN_KINSHIP_LABEL = INCOMPLETE_LINK_HINT;
