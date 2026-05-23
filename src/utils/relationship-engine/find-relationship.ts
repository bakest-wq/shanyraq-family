import { Relative } from '@/types/relative';
import {
  buildUnknownResult,
  findAdvancedKazakhRelationship,
} from '@/utils/relationship-engine/advanced-kazakh';
import { findCoreRelationship } from '@/utils/relationship-engine/core-relationship';
import { ADVANCED_RELATIONSHIP_LABELS, getRelationshipLabel } from '@/utils/relationship-engine/labels';
import { buildCoreRelationshipPath } from '@/utils/relationship-engine/relationship-path';
import type { RelationshipResult } from '@/utils/relationship-engine/types';

function attachPath(
  result: RelationshipResult,
  personA: Relative,
  personB: Relative,
  relatives: Relative[],
): RelationshipResult {
  const path =
    buildCoreRelationshipPath(personA, personB, relatives, result.type) ??
    result.path;

  if (result.type === 'grandson' || result.type === 'granddaughter') {
    return {
      ...result,
      label: getRelationshipLabel('nemere'),
      path,
    };
  }

  return path ? { ...result, path } : result;
}

/**
 * Determines how `personB` is related to `personA`.
 * Core links first, then advanced Kazakh kinship, then fallback hint.
 */
export function findRelationship(
  personA: Relative,
  personB: Relative,
  relatives: Relative[],
): RelationshipResult {
  const core = findCoreRelationship(personA, personB, relatives);

  if (core.type !== 'unknown') {
    return attachPath(core, personA, personB, relatives);
  }

  const advanced = findAdvancedKazakhRelationship(personA, personB, relatives);
  if (advanced) {
    return advanced;
  }

  return buildUnknownResult(personA, personB, false);
}

export { ADVANCED_RELATIONSHIP_LABELS };
