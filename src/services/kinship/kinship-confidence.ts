import type { Relative } from '@/types/relative';
import { AGE_AWARE_BROAD_LABELS } from '@/services/kinship/age-aware-kinship';
import type { KinshipIntelligenceMeta, KinshipResult, KinshipType } from '@/services/kinship/types';
import { getThreeJurtGroupFromResult } from '@/services/kinship/kinship-groups';
import { getRelationshipPathHopCount } from '@/services/kinship/relationship-path.engine';
import { classifyKinship } from '@/utils/kinship/classify';
import { INCOMPLETE_LINK_HINT, UNKNOWN_KINSHIP_LABEL } from '@/utils/kinship/classify-helpers';
import { formatKinshipMainLabel } from '@/utils/kinship/kinship-display';
import { UNKNOWN_KINSHIP } from '@/utils/kinship/labels.kz';

export type KinshipConfidence = 'high' | 'medium' | 'low';

/** User-facing broad labels — preferred over wrong precise terms. */
export const BROAD_KINSHIP_LABELS = {
  kuda: 'Құдалық байланыс',
  kayin: 'Қайын туыс',
  nagashy: 'Нағашы жақ туыс',
  paternal: 'Өз жақ туыс',
  sibling: 'Бауыр',
  relative: 'Туыс',
  unknown: UNKNOWN_KINSHIP.kazakh,
} as const;

const NEUTRAL_TYPE_LABELS: Partial<Record<KinshipType, string>> = {
  kuda_neutral: BROAD_KINSHIP_LABELS.kuda,
  kayin_neutral: BROAD_KINSHIP_LABELS.kayin,
  nagashy_neutral: BROAD_KINSHIP_LABELS.nagashy,
  paternal_neutral: BROAD_KINSHIP_LABELS.paternal,
  sibling_neutral: BROAD_KINSHIP_LABELS.sibling,
  relative_neutral: BROAD_KINSHIP_LABELS.relative,
};

const PRECISE_KAYIN_SIBLING_TYPES: KinshipType[] = [
  'kayin_aga',
  'kayin_ini',
  'kayin_apke',
  'kayin_singli',
];

const PRECISE_BROTHER_CHILD_TYPES: KinshipType[] = [
  'brother_child_older',
  'brother_child_younger',
];

const MEDIUM_FALLBACK_BY_TYPE: Partial<Record<KinshipType, string>> = {
  kuda: BROAD_KINSHIP_LABELS.kuda,
  kudagi: BROAD_KINSHIP_LABELS.kuda,
  kuda_neutral: BROAD_KINSHIP_LABELS.kuda,
  kayin_neutral: BROAD_KINSHIP_LABELS.kayin,
  kayin_jurt: BROAD_KINSHIP_LABELS.kayin,
  nagashy_aga: BROAD_KINSHIP_LABELS.nagashy,
  nagashy_ini: BROAD_KINSHIP_LABELS.nagashy,
  nagashy_apke: BROAD_KINSHIP_LABELS.nagashy,
  nagashy_singli: BROAD_KINSHIP_LABELS.nagashy,
  nagashy_neutral: BROAD_KINSHIP_LABELS.nagashy,
  paternal_aga: BROAD_KINSHIP_LABELS.paternal,
  paternal_ini: BROAD_KINSHIP_LABELS.paternal,
  paternal_apke: BROAD_KINSHIP_LABELS.paternal,
  paternal_singli: BROAD_KINSHIP_LABELS.paternal,
  paternal_neutral: BROAD_KINSHIP_LABELS.paternal,
  aga: BROAD_KINSHIP_LABELS.sibling,
  ini: BROAD_KINSHIP_LABELS.sibling,
  apke: BROAD_KINSHIP_LABELS.sibling,
  singli: BROAD_KINSHIP_LABELS.sibling,
  sibling_neutral: BROAD_KINSHIP_LABELS.sibling,
  brother_child_neutral: AGE_AWARE_BROAD_LABELS.brotherChild,
  relative_neutral: BROAD_KINSHIP_LABELS.relative,
};

const CATEGORY_BROAD_LABEL: Partial<Record<KinshipResult['category'], string>> = {
  kuda: BROAD_KINSHIP_LABELS.kuda,
  in_law: BROAD_KINSHIP_LABELS.kayin,
  nagashy: BROAD_KINSHIP_LABELS.nagashy,
  paternal: BROAD_KINSHIP_LABELS.paternal,
  sibling: BROAD_KINSHIP_LABELS.sibling,
  unknown: BROAD_KINSHIP_LABELS.unknown,
};

function hasIncompleteStructuralPath(
  result: KinshipResult,
  structuralPathLength?: number,
): boolean {
  if (result.type === 'unknown' || result.resolved === false) {
    return true;
  }

  if (result.pathSteps.length > 0) {
    return false;
  }

  const extendedTypes: KinshipType[] = [
    'kuda',
    'kudagi',
    'kuda_neutral',
    'kayin_ata',
    'kayin_ene',
    'kayin_aga',
    'kayin_ini',
    'kayin_apke',
    'kayin_singli',
    'zhien',
    'brother_child_older',
    'brother_child_younger',
    'brother_child_neutral',
    'bole',
    'tuas',
    'jenge',
    'brother_wife_neutral',
    'jezde',
    'kelin',
    'kuyeu_bala',
  ];

  if (!extendedTypes.includes(result.type)) {
    return false;
  }

  if (typeof structuralPathLength === 'number') {
    return structuralPathLength === 0;
  }

  return result.pathSteps.length === 0;
}

/** Score how certain the engine is about a precise label. */
export function scoreKinshipConfidence(
  result: KinshipResult,
  structuralPathLength?: number,
): KinshipConfidence {
  if (result.type === 'unknown' || result.resolved === false) {
    return 'low';
  }

  if (result.confidenceHint === INCOMPLETE_LINK_HINT || result.confidenceHint === UNKNOWN_KINSHIP_LABEL) {
    return 'low';
  }

  if (hasIncompleteStructuralPath(result, structuralPathLength)) {
    return 'medium';
  }

  if (result.uncertain || result.missingGenderHint) {
    if (PRECISE_KAYIN_SIBLING_TYPES.includes(result.type) && result.pathSteps.length > 0) {
      return 'high';
    }

    if (PRECISE_BROTHER_CHILD_TYPES.includes(result.type) && result.pathSteps.length > 0) {
      return 'high';
    }

    if (
      (result.type === 'jenge'
        || result.type === 'jezde'
        || result.type === 'kelin'
        || result.type === 'brother_wife_neutral')
      && result.pathSteps.length > 0
    ) {
      return 'high';
    }

    return 'medium';
  }

  if (NEUTRAL_TYPE_LABELS[result.type]) {
    return 'medium';
  }

  if (result.confidenceHint) {
    return 'medium';
  }

  return 'high';
}

export function getKinshipConfidence(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipConfidence {
  const result = classifyKinship(rootPerson, targetPerson, allRelatives);
  const structuralPathLength = getRelationshipPathHopCount(rootPerson, targetPerson, allRelatives);

  return scoreKinshipConfidence(result, structuralPathLength);
}

/** @deprecated Use getKinshipConfidence */
export const getRelationshipConfidence = getKinshipConfidence;

/** Whether the UI should avoid a precise gendered / marriage-specific label. */
export function shouldPreferBroadLabel(
  result: KinshipResult,
  confidence: KinshipConfidence,
): boolean {
  return confidence !== 'high';
}

/** Resolve a user-safe card label — broader when confidence is not high. */
export function resolveConfidenceSafeLabel(
  result: KinshipResult,
  confidence: KinshipConfidence = scoreKinshipConfidence(result),
): string {
  if (result.type === 'unknown' || result.resolved === false) {
    return result.confidenceHint ?? BROAD_KINSHIP_LABELS.unknown;
  }

  if (confidence === 'low') {
    return result.confidenceHint ?? BROAD_KINSHIP_LABELS.unknown;
  }

  if (confidence === 'medium') {
    if (result.confidenceHint === BROAD_KINSHIP_LABELS.kuda) {
      return BROAD_KINSHIP_LABELS.kuda;
    }

    const typeFallback = MEDIUM_FALLBACK_BY_TYPE[result.type];
    if (typeFallback) {
      return typeFallback;
    }

    if (result.uncertain) {
      return (
        CATEGORY_BROAD_LABEL[result.category] ??
        NEUTRAL_TYPE_LABELS[result.type] ??
        BROAD_KINSHIP_LABELS.relative
      );
    }

    if (result.confidenceHint) {
      return result.confidenceHint;
    }
  }

  return formatKinshipMainLabel(result);
}

/** Softer explanation wording when confidence is not high. */
export function resolveConfidenceSafeExplanation(
  summary: string,
  result: KinshipResult,
  confidence: KinshipConfidence = scoreKinshipConfidence(result),
): string {
  if (confidence === 'low') {
    return result.confidenceHint ?? `${BROAD_KINSHIP_LABELS.unknown}.`;
  }

  if (confidence !== 'medium') {
    return summary;
  }

  const broadLabel = resolveConfidenceSafeLabel(result, confidence);

  if (result.category === 'kuda' || result.type === 'kuda' || result.type === 'kudagi') {
    const lead = summary.split('.')[0]?.trim() ?? summary;
    return `${lead}. ${broadLabel}.`;
  }

  if (result.uncertain || result.missingGenderHint) {
    return `${summary.replace(/\.\s*$/, '')}. Байланыс дәл нақтыланбаған.`;
  }

  if (result.confidenceHint && summary !== result.confidenceHint) {
    return `${summary.replace(/\.\s*$/, '')}. ${result.confidenceHint}.`;
  }

  return summary;
}

export function isLowConfidenceLabel(label: string | null | undefined): boolean {
  if (!label) {
    return true;
  }

  const normalized = label.trim().toLowerCase();
  return (
    normalized.includes('анықталмады') ||
    normalized.includes('құдалық байланыс') ||
    normalized.includes('не определена')
  );
}

export function buildKinshipIntelligenceMeta(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
  pathLength = 0,
): KinshipIntelligenceMeta {
  const result = classifyKinship(rootPerson, targetPerson, allRelatives);

  return {
    confidence: scoreKinshipConfidence(result),
    jurtGroup: getThreeJurtGroupFromResult(result),
    structuralPathLength: pathLength,
    uncertain: result.uncertain,
  };
}
