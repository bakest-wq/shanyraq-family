import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import {
  collectKinshipCandidates,
  getPrimaryKinshipResult,
} from '@/utils/kinship/classify';
import type { KinshipResult, KinshipType } from '@/utils/kinship/types';
import { areSpouses, isFemale, isMale } from '@/utils/kinship/graph';

import {
  formatDisplayLabel,
  formatPreciseLabel,
} from '@/services/kinship/kinship-labels';
import { getRelationshipPathHopCount } from '@/services/kinship/relationship-path.engine';

const SPOUSE_TYPES = new Set<KinshipType>(['husband', 'wife', 'spouse']);
const PARENT_TYPES = new Set<KinshipType>(['father', 'mother']);
const CHILD_TYPES = new Set<KinshipType>(['son', 'daughter']);
const SIBLING_TYPES = new Set<KinshipType>([
  'aga',
  'ini',
  'apke',
  'singli',
  'sibling_neutral',
]);

/** Lower number = higher priority when multiple kinship paths exist. */
export function getKinshipTypePriority(type: KinshipType): number {
  if (SPOUSE_TYPES.has(type)) {
    return 1;
  }

  if (PARENT_TYPES.has(type)) {
    return 2;
  }

  if (CHILD_TYPES.has(type)) {
    return 3;
  }

  if (SIBLING_TYPES.has(type)) {
    return 4;
  }

  if (
    type === 'grandfather' ||
    type === 'grandmother' ||
    type === 'nemere' ||
    type === 'shobere'
  ) {
    return 5;
  }

  if (
    type === 'jenge' ||
    type === 'brother_wife_neutral' ||
    type === 'jezde' ||
    type === 'kelin' ||
    type === 'kuyeu_bala' ||
    type.startsWith('kayin_') ||
    type === 'abysyn'
  ) {
    return 6;
  }

  if (type === 'kuda' || type === 'kudagi' || type === 'kuda_neutral') {
    return 7;
  }

  if (type.startsWith('nagashy_') || type.startsWith('paternal_')) {
    return 8;
  }

  if (
    type === 'zhien' ||
    type.startsWith('brother_child_') ||
    type === 'bole' ||
    type === 'tuas' ||
    type === 'relative_neutral'
  ) {
    return 9;
  }

  if (type === 'self') {
    return 0;
  }

  return 10;
}

function compareKinshipCandidates(a: KinshipResult, b: KinshipResult): number {
  const priorityDiff = getKinshipTypePriority(a.type) - getKinshipTypePriority(b.type);
  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  if (a.uncertain !== b.uncertain) {
    return a.uncertain ? 1 : -1;
  }

  if (a.missingGenderHint !== b.missingGenderHint) {
    return a.missingGenderHint ? 1 : -1;
  }

  return a.pathSteps.length - b.pathSteps.length;
}

export function pickPrimaryKinshipResult(candidates: KinshipResult[]): KinshipResult | null {
  const visible = candidates.filter((candidate) => candidate.resolved !== false && candidate.type !== 'unknown');

  if (visible.length === 0) {
    return null;
  }

  return [...visible].sort(compareKinshipCandidates)[0] ?? null;
}

export function resolvePrimaryKinshipResult(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipResult {
  return getPrimaryKinshipResult(rootPerson, targetPerson, allRelatives);
}

export function resolvePrimaryKinshipCandidates(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipResult[] {
  return collectKinshipCandidates(rootPerson, targetPerson, allRelatives);
}

/** Final displayed Kazakh label after priority resolution and confidence formatting. */
export function getPrimaryKinshipLabel(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): string {
  if (relativeLinkIdsMatch(rootPerson.id, targetPerson.id)) {
    return 'Орталық тұлға';
  }

  const result = resolvePrimaryKinshipResult(rootPerson, targetPerson, allRelatives);
  const structuralPathLength = getRelationshipPathHopCount(
    rootPerson,
    targetPerson,
    allRelatives,
  );

  return formatDisplayLabel(result, structuralPathLength);
}

/** Precise Kazakh label from the winning candidate (no confidence broadening). */
export function getPrimaryPreciseKinshipLabel(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): string {
  if (relativeLinkIdsMatch(rootPerson.id, targetPerson.id)) {
    return 'Орталық тұлға';
  }

  const result = resolvePrimaryKinshipResult(rootPerson, targetPerson, allRelatives);
  return formatPreciseLabel(result);
}

export function isRootSpouseKinship(
  rootPerson: Relative,
  targetPerson: Relative,
): boolean {
  return areSpouses(rootPerson, targetPerson);
}

export function isSpouseKinshipResult(result: KinshipResult): boolean {
  return SPOUSE_TYPES.has(result.type);
}

const JENGELER_LABELS = new Set(['Жеңге', 'Бауырының жұбайы']);
const JEZDELDER_LABELS = new Set(['Жезде']);
const KELINLER_LABELS = new Set(['Келін']);

export function classifyOzJurtSubgroupByPrimaryLabel(
  displayLabel: string,
  person: Relative,
): 'kelinler' | 'jengeler' | 'jezdelder' | null {
  if (KELINLER_LABELS.has(displayLabel)) {
    return 'kelinler';
  }

  if (JEZDELDER_LABELS.has(displayLabel)) {
    if (isFemale(person)) {
      return 'jengeler';
    }

    return 'jezdelder';
  }

  if (JENGELER_LABELS.has(displayLabel)) {
    if (isMale(person)) {
      return 'jezdelder';
    }

    return 'jengeler';
  }

  return null;
}
