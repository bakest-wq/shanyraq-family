import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { isCoreFamilyRelation } from '@/utils/core-family-relation';
import {
  getChildren,
  getEffectiveSpouse,
  getParents,
  getSiblings,
} from '@/utils/kinship/graph';
import { resolveKinshipResult } from '@/services/kinship/kinship-labels';
import type { KinshipResult, ThreeJurtGroup } from '@/services/kinship/types';

const DIRECT_FAMILY_TYPES = new Set<KinshipResult['type']>([
  'self',
  'father',
  'mother',
  'son',
  'daughter',
  'spouse',
  'husband',
  'wife',
  'aga',
  'ini',
  'apke',
  'singli',
  'sibling_neutral',
  'nemere',
  'shobere',
]);

/** Root-side in-laws — sibling/child spouses, not spouse-side kayin jurt. */
const ROOT_SIDE_IN_LAW_TYPES = new Set<KinshipResult['type']>([
  'jenge',
  'brother_wife_neutral',
  'jezde',
  'kelin',
  'kuyeu_bala',
]);

/** Spouse-side relatives only — root → spouse → spouse's family. */
const SPOUSE_SIDE_KAYIN_TYPES = new Set<KinshipResult['type']>([
  'kayin_ata',
  'kayin_ene',
  'kayin_aga',
  'kayin_ini',
  'kayin_apke',
  'kayin_singli',
  'kayin_neutral',
  'kayin_jurt',
  'abysyn',
  'kayin_jezde',
]);

function isRootSiblingSpouse(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): boolean {
  for (const sibling of getSiblings(rootPerson, allRelatives)) {
    const siblingSpouse = getEffectiveSpouse(sibling, allRelatives);
    if (siblingSpouse && relativeLinkIdsMatch(siblingSpouse.id, targetPerson.id)) {
      return true;
    }
  }

  return false;
}

function isRootChildSpouse(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): boolean {
  for (const child of getChildren(rootPerson, allRelatives)) {
    const childSpouse = getEffectiveSpouse(child, allRelatives);
    if (childSpouse && relativeLinkIdsMatch(childSpouse.id, targetPerson.id)) {
      return true;
    }
  }

  return false;
}

export const JURT_GROUP_LABELS: Record<ThreeJurtGroup, string> = {
  oz_jurt: 'Өз жұрты',
  nagashy_jurt: 'Нағашы жұрты',
  kaiyn_jurt: 'Қайын жұрты',
  kuda_jurt: 'Құдалық байланыс',
  direct_family: 'Тікелей отбасы',
  unknown: 'Байланыс анықталмады',
};

function isSpouseSideRelative(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): boolean {
  if (
    isRootSiblingSpouse(rootPerson, targetPerson, allRelatives) ||
    isRootChildSpouse(rootPerson, targetPerson, allRelatives)
  ) {
    return false;
  }

  const spouse = getEffectiveSpouse(rootPerson, allRelatives);
  if (!spouse) {
    return false;
  }

  if (relativeLinkIdsMatch(targetPerson.id, spouse.id)) {
    return false;
  }

  if (
    (spouse.fatherId && relativeLinkIdsMatch(targetPerson.id, spouse.fatherId)) ||
    (spouse.motherId && relativeLinkIdsMatch(targetPerson.id, spouse.motherId))
  ) {
    return true;
  }

  for (const parent of getParents(spouse, allRelatives)) {
    if (relativeLinkIdsMatch(parent.id, targetPerson.id)) {
      return true;
    }
  }

  for (const sibling of getSiblings(spouse, allRelatives)) {
    if (relativeLinkIdsMatch(sibling.id, targetPerson.id)) {
      return true;
    }

    const siblingSpouse = getEffectiveSpouse(sibling, allRelatives);
    if (siblingSpouse && relativeLinkIdsMatch(siblingSpouse.id, targetPerson.id)) {
      return true;
    }
  }

  return false;
}

export function getThreeJurtGroupFromResult(result: KinshipResult): ThreeJurtGroup {
  if (result.type === 'unknown' || result.resolved === false) {
    return 'unknown';
  }

  if (DIRECT_FAMILY_TYPES.has(result.type)) {
    return 'direct_family';
  }

  if (result.category === 'kuda') {
    return 'kuda_jurt';
  }

  if (ROOT_SIDE_IN_LAW_TYPES.has(result.type)) {
    return 'oz_jurt';
  }

  if (SPOUSE_SIDE_KAYIN_TYPES.has(result.type)) {
    return 'kaiyn_jurt';
  }

  if (result.category === 'in_law') {
    return 'kaiyn_jurt';
  }

  if (result.category === 'nagashy') {
    return 'nagashy_jurt';
  }

  if (result.category === 'paternal') {
    return 'oz_jurt';
  }

  if (result.type === 'grandfather' || result.type === 'grandmother') {
    return 'oz_jurt';
  }

  if (result.type === 'zhien' || result.type === 'tuas') {
    return 'oz_jurt';
  }

  if (
    result.type === 'brother_child_older'
    || result.type === 'brother_child_younger'
    || result.type === 'brother_child_neutral'
  ) {
    return 'oz_jurt';
  }

  if (result.type === 'bole') {
    return 'nagashy_jurt';
  }

  if (result.category === 'extended') {
    return 'oz_jurt';
  }

  return 'unknown';
}

export function resolveStructuralThreeJurtGroup(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): ThreeJurtGroup | null {
  if (isSpouseSideRelative(rootPerson, targetPerson, allRelatives)) {
    return 'kaiyn_jurt';
  }

  return null;
}

export function getThreeJurtGroup(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): ThreeJurtGroup {
  if (isCoreFamilyRelation(rootPerson, targetPerson, allRelatives)) {
    return 'direct_family';
  }

  const result = resolveKinshipResult(rootPerson, targetPerson, allRelatives);
  const fromKinship = getThreeJurtGroupFromResult(result);

  if (fromKinship !== 'unknown') {
    return fromKinship;
  }

  return resolveStructuralThreeJurtGroup(rootPerson, targetPerson, allRelatives) ?? 'unknown';
}

/** Map jurt group to legacy Shezhire tab kind. */
export function mapThreeJurtGroupToJurtKind(
  group: ThreeJurtGroup,
): 'oz' | 'nagashy' | 'kayin' | null {
  switch (group) {
    case 'direct_family':
      return null;
    case 'oz_jurt':
    case 'kuda_jurt':
      return 'oz';
    case 'nagashy_jurt':
      return 'nagashy';
    case 'kaiyn_jurt':
      return 'kayin';
    default:
      return null;
  }
}
