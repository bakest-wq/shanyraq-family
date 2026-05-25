import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { buildKinshipEdges } from '@/utils/kinship/path';
import type { KinshipPathStep } from '@/services/kinship/types';

import {
  DEFAULT_RELATIONSHIP_PATH_MAX_HOPS,
  findShortestRelationshipPath,
  toKinshipPathSteps,
} from '@/services/kinship/relationship-path.engine';

export type { KinshipGraphEdge } from '@/utils/kinship/path';

/** Safety cap — prevents runaway traversal on corrupted graphs. */
export const MAX_GRAPH_TRAVERSAL_STEPS = DEFAULT_RELATIONSHIP_PATH_MAX_HOPS;

export { buildKinshipEdges, summarizeStructuralBridge } from '@/utils/kinship/path';

/**
 * Shortest structural path via the relationship path engine (BFS + loop protection).
 * Semantic kinship labels are applied separately in classifyKinship().
 */
export function getKinshipPath(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipPathStep[] {
  const result = findShortestRelationshipPath(rootPerson, targetPerson, allRelatives);

  if (!result.resolved) {
    return [];
  }

  const steps = toKinshipPathSteps(result);
  return steps.length > MAX_GRAPH_TRAVERSAL_STEPS
    ? steps.slice(0, MAX_GRAPH_TRAVERSAL_STEPS)
    : steps;
}

export function getKinshipPathDescription(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): string {
  const result = findShortestRelationshipPath(rootPerson, targetPerson, allRelatives);

  if (!result.resolved || result.steps.length === 0) {
    if (relativeLinkIdsMatch(rootPerson.id, targetPerson.id)) {
      return 'Бұл сіздің профиліңіз';
    }

    return '';
  }

  return result.steps
    .map((step) => `${getRelativeDisplayName(step.person)} (${step.stepLabel})`)
    .join(' → ');
}
