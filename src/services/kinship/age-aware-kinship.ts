import type { Relative } from '@/types/relative';
import type { KinshipLabel, KinshipType } from '@/services/kinship/types';
import {
  KAYIN_SIBLING_AGE_MAP,
  ROOT_SIBLING_AGE_MAP,
  resolveSiblingAgeType,
  type SiblingAgeMap,
} from '@/utils/kinship/classify-helpers';
import { isFemale, isMale } from '@/utils/kinship/graph';

/** Safe broad labels when age cannot be determined — never fake precision. */
export const AGE_AWARE_BROAD_LABELS = {
  sibling: 'Бауыр',
  kayin: 'Қайын туыс',
  relative: 'Туыс',
  brotherChild: 'Бауырыңыздың баласы',
} as const;

export type AgeAwareSiblingKinship = {
  type: KinshipType;
  uncertain: boolean;
  missingGenderHint: boolean;
  labelOverride?: KinshipLabel;
};

export type AgeAwareInLawKinship = {
  type: 'jenge' | 'jezde' | 'kelin' | 'brother_wife_neutral';
  uncertain: boolean;
  labelOverride?: KinshipLabel;
};

const BROTHER_WIFE_NEUTRAL_LABEL: KinshipLabel = {
  kazakh: 'Бауырының жұбайы',
  russian: 'Жена брата',
  subtitle: 'жас нақтыланбаған',
};

export type AgeAwareChildKinship = {
  type: KinshipType;
  uncertain: boolean;
  missingGenderHint: boolean;
};

const SINGLI_FEMALE_ROOT_LABEL: KinshipLabel = {
  kazakh: 'Сіңлі',
  russian: 'Младшая сестра',
};

/** Phase 1 — root siblings with gender-aware younger-sister labels. */
export function resolveRootSiblingKinship(
  rootPerson: Relative,
  sibling: Relative,
): AgeAwareSiblingKinship {
  const kinship = resolveSiblingAgeType(rootPerson, sibling, ROOT_SIBLING_AGE_MAP);

  if (kinship.type === 'singli' && isFemale(rootPerson)) {
    return {
      ...kinship,
      labelOverride: SINGLI_FEMALE_ROOT_LABEL,
    };
  }

  return kinship;
}

/** Phase 2A — brother's wife adapts by brother age relative to root. */
export function resolveBrotherSpouseKinship(
  rootPerson: Relative,
  brother: Relative,
): AgeAwareInLawKinship {
  const siblingKinship = resolveSiblingAgeType(rootPerson, brother, ROOT_SIBLING_AGE_MAP);

  if (siblingKinship.type === 'ini') {
    return { type: 'kelin', uncertain: false };
  }

  if (siblingKinship.type === 'aga') {
    return { type: 'jenge', uncertain: false };
  }

  return {
    type: 'brother_wife_neutral',
    uncertain: true,
    labelOverride: BROTHER_WIFE_NEUTRAL_LABEL,
  };
}

/** Phase 2B — sister's husband stays Жезде regardless of sister age. */
export function resolveSisterSpouseKinship(): AgeAwareInLawKinship {
  return { type: 'jezde', uncertain: false };
}

/** Phase 3 — spouse-side siblings (re-exported policy layer). */
export function resolveKayinSiblingKinship(
  spouse: Relative,
  spouseSibling: Relative,
): Pick<AgeAwareSiblingKinship, 'type' | 'uncertain' | 'missingGenderHint'> {
  const kinship = resolveSiblingAgeType(spouse, spouseSibling, KAYIN_SIBLING_AGE_MAP);

  if (kinship.type !== 'kayin_neutral') {
    return kinship;
  }

  if (isMale(spouseSibling)) {
    return { type: 'kayin_aga', uncertain: true, missingGenderHint: false };
  }

  if (isFemale(spouseSibling)) {
    return { type: 'kayin_apke', uncertain: true, missingGenderHint: false };
  }

  return kinship;
}

/** Phase 4 — sister's / daughter's children = Жиен; brother's children use age-specific labels. */
export function resolveSiblingChildKinship(
  rootPerson: Relative,
  sibling: Relative,
): AgeAwareChildKinship {
  if (isFemale(sibling)) {
    return { type: 'zhien', uncertain: false, missingGenderHint: false };
  }

  if (isMale(sibling)) {
    const siblingKinship = resolveSiblingAgeType(rootPerson, sibling, ROOT_SIBLING_AGE_MAP);

    if (siblingKinship.type === 'aga') {
      return { type: 'brother_child_older', uncertain: false, missingGenderHint: false };
    }

    if (siblingKinship.type === 'ini') {
      return { type: 'brother_child_younger', uncertain: false, missingGenderHint: false };
    }

    return { type: 'brother_child_neutral', uncertain: true, missingGenderHint: false };
  }

  return { type: 'brother_child_neutral', uncertain: true, missingGenderHint: true };
}

/** Daughter's children are жиен — not немере. */
export function resolveDaughterChildKinship(): AgeAwareChildKinship {
  return { type: 'zhien', uncertain: false, missingGenderHint: false };
}

/** Whether a type represents a brother's child (not Жиен). */
export function isBrotherChildKinshipType(type: KinshipType): boolean {
  return type === 'brother_child_older' || type === 'brother_child_younger' || type === 'brother_child_neutral';
}

export function isZhienKinshipType(type: KinshipType): boolean {
  return type === 'zhien';
}

/** Shared age resolution for extended maps (nagashy, paternal, etc.). */
export function resolveMappedSiblingKinship(
  anchor: Relative,
  sibling: Relative,
  map: SiblingAgeMap,
): AgeAwareSiblingKinship {
  return resolveSiblingAgeType(anchor, sibling, map);
}
