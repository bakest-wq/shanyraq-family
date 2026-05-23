import { Relative } from '@/types/relative';
import {
  getChildren,
  getGrandchildren,
  getGrandparents,
  getSiblings,
  isFemale,
  isMale,
} from '@/utils/relationship-engine/graph';
import { getRelationshipLabel } from '@/utils/relationship-engine/labels';
import type { CoreRelationshipType, RelationshipResult } from '@/utils/relationship-engine/types';

function inferChildType(relative: Relative): CoreRelationshipType | null {
  if (isMale(relative)) {
    return 'son';
  }

  if (isFemale(relative)) {
    return 'daughter';
  }

  return null;
}

function inferSiblingType(relative: Relative): CoreRelationshipType | null {
  if (isMale(relative)) {
    return 'brother';
  }

  if (isFemale(relative)) {
    return 'sister';
  }

  return null;
}

function inferGrandparentType(relative: Relative): CoreRelationshipType | null {
  if (isMale(relative)) {
    return 'grandfather';
  }

  if (isFemale(relative)) {
    return 'grandmother';
  }

  return null;
}

function inferGrandchildType(relative: Relative): CoreRelationshipType | null {
  if (isMale(relative)) {
    return 'grandson';
  }

  if (isFemale(relative)) {
    return 'granddaughter';
  }

  return null;
}

function buildCoreResult(
  type: CoreRelationshipType,
  subject?: Relative,
  resolved = true,
): RelationshipResult {
  return {
    type,
    category: 'core',
    label: getRelationshipLabel(type, subject?.gender),
    resolved,
  };
}

/**
 * Core MVP relationships — direct parent/child/spouse/sibling/grand links.
 *
 * @example
 * findCoreRelationship(me, father) → { type: 'father', label: 'Әkesi · Отец' }
 */
export function findCoreRelationship(
  personA: Relative,
  personB: Relative,
  relatives: Relative[],
): RelationshipResult {
  if (personA.id === personB.id) {
    return buildCoreResult('self', personB);
  }

  if (personB.id === personA.fatherId) {
    return buildCoreResult('father', personB);
  }

  if (personB.id === personA.motherId) {
    return buildCoreResult('mother', personB);
  }

  if (personB.fatherId === personA.id || personB.motherId === personA.id) {
    const childType = inferChildType(personB);
    if (childType) {
      return buildCoreResult(childType, personB);
    }

    return buildCoreResult('unknown', undefined, false);
  }

  if (personA.spouseId === personB.id || personB.spouseId === personA.id) {
    return buildCoreResult('spouse', personB);
  }

  if (getSiblings(personA, relatives).some((sibling) => sibling.id === personB.id)) {
    const siblingType = inferSiblingType(personB);
    if (siblingType) {
      return buildCoreResult(siblingType, personB);
    }

    return buildCoreResult('unknown', undefined, false);
  }

  if (getGrandparents(personA, relatives).some((grandparent) => grandparent.id === personB.id)) {
    const grandparentType = inferGrandparentType(personB);
    if (grandparentType) {
      return buildCoreResult(grandparentType, personB);
    }

    return buildCoreResult('unknown', undefined, false);
  }

  if (getGrandchildren(personA, relatives).some((grandchild) => grandchild.id === personB.id)) {
    const grandchildType = inferGrandchildType(personB);
    if (grandchildType) {
      return buildCoreResult(grandchildType, personB);
    }

    return buildCoreResult('unknown', undefined, false);
  }

  return buildCoreResult('unknown', undefined, false);
}
