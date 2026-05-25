import type { Relative } from '@/types/relative';

import {
  DEFAULT_RELATIONSHIP_PATH_MAX_HOPS,
  findShortestRelationshipPath,
  formatInternalRelationshipPathTrace,
  getRelationshipPathHopCount,
  toKinshipPathSteps,
} from '@/services/kinship/relationship-path.engine';
import type {
  RelationshipPathEngineOptions,
  RelationshipPathResult,
} from '@/services/kinship/relationship-path.types';
import type { KinshipPathStep } from '@/services/kinship/types';

export type {
  RelationshipPathEdgeKind,
  RelationshipPathEngineOptions,
  RelationshipPathResult,
  RelationshipPathStep,
} from '@/services/kinship/relationship-path.types';

export {
  DEFAULT_RELATIONSHIP_PATH_MAX_HOPS,
  findShortestRelationshipPath,
  formatInternalRelationshipPathTrace,
  getRelationshipPathHopCount,
  toKinshipPathSteps,
};

/** Service boundary — shortest path for kinship intelligence layers. */
export function resolveRelationshipPath(
  fromPerson: Relative,
  toPerson: Relative,
  relatives: Relative[],
  options?: RelationshipPathEngineOptions,
): RelationshipPathResult {
  return findShortestRelationshipPath(fromPerson, toPerson, relatives, options);
}

/** Kinship-facing path steps — internal use for labels, confidence, explanations. */
export function getRelationshipPathSteps(
  fromPerson: Relative,
  toPerson: Relative,
  relatives: Relative[],
): KinshipPathStep[] {
  return toKinshipPathSteps(findShortestRelationshipPath(fromPerson, toPerson, relatives));
}
