import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  getChildren,
  getEffectiveSpouse,
  getPersonById,
  isFemale,
  isMale,
} from '@/utils/kinship/graph';

import type {
  RelationshipPathEdgeKind,
  RelationshipPathEngineOptions,
  RelationshipPathResult,
  RelationshipPathStep,
} from '@/services/kinship/relationship-path.types';
import type { KinshipPathStep } from '@/services/kinship/types';

export type { KinshipPathStep } from '@/services/kinship/types';

/** Safety cap — corrupted graphs cannot run away. */
export const DEFAULT_RELATIONSHIP_PATH_MAX_HOPS = 48;

type TraversalEdge = {
  toId: string;
  kind: RelationshipPathEdgeKind;
};

type QueueItem = {
  personId: string;
  depth: number;
};

function collectTraversalEdges(person: Relative, relatives: Relative[]): TraversalEdge[] {
  const edges: TraversalEdge[] = [];

  if (person.fatherId) {
    edges.push({ toId: person.fatherId, kind: 'parent' });
  }

  if (person.motherId) {
    edges.push({ toId: person.motherId, kind: 'parent' });
  }

  for (const child of getChildren(person, relatives)) {
    edges.push({ toId: child.id, kind: 'child' });
  }

  const spouse = getEffectiveSpouse(person, relatives);
  if (spouse) {
    edges.push({ toId: spouse.id, kind: 'spouse' });
  }

  return edges;
}

function labelTraversedEdge(
  fromPerson: Relative,
  toPerson: Relative,
  edgeKind: RelationshipPathEdgeKind,
): string {
  if (edgeKind === 'spouse') {
    return 'жұбайы';
  }

  if (edgeKind === 'parent') {
    if (relativeLinkIdsMatch(fromPerson.fatherId, toPerson.id)) {
      return 'әкesi';
    }

    if (relativeLinkIdsMatch(fromPerson.motherId, toPerson.id)) {
      return 'anası';
    }

    return 'ата-анасы';
  }

  if (isMale(toPerson)) {
    return 'ұлы';
  }

  if (isFemale(toPerson)) {
    return 'қызы';
  }

  return 'баласы';
}

/**
 * Shortest valid structural path via BFS over parent / child / spouse edges.
 * Visited-set loop protection; hop cap prevents runaway traversal.
 */
export function findShortestRelationshipPath(
  fromPerson: Relative,
  toPerson: Relative,
  relatives: Relative[],
  options: RelationshipPathEngineOptions = {},
): RelationshipPathResult {
  const maxHops = options.maxHops ?? DEFAULT_RELATIONSHIP_PATH_MAX_HOPS;

  if (relativeLinkIdsMatch(fromPerson.id, toPerson.id)) {
    return { steps: [], hopCount: 0, resolved: true, truncated: false };
  }

  const visited = new Set<string>([fromPerson.id]);
  const previousById = new Map<string, { fromId: string; via: RelationshipPathEdgeKind }>();
  const queue: QueueItem[] = [{ personId: fromPerson.id, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    if (current.depth >= maxHops) {
      continue;
    }

    const person = getPersonById(relatives, current.personId);
    if (!person) {
      continue;
    }

    for (const edge of collectTraversalEdges(person, relatives)) {
      if (visited.has(edge.toId)) {
        continue;
      }

      const nextPerson = getPersonById(relatives, edge.toId);
      if (!nextPerson) {
        continue;
      }

      previousById.set(edge.toId, { fromId: current.personId, via: edge.kind });

      if (relativeLinkIdsMatch(edge.toId, toPerson.id)) {
        const steps = rebuildSteps(toPerson.id, previousById, relatives);
        return {
          steps,
          hopCount: steps.length,
          resolved: true,
          truncated: steps.length >= maxHops,
        };
      }

      visited.add(edge.toId);
      queue.push({ personId: edge.toId, depth: current.depth + 1 });
    }
  }

  return { steps: [], hopCount: 0, resolved: false, truncated: false };
}

function rebuildSteps(
  targetId: string,
  previousById: Map<string, { fromId: string; via: RelationshipPathEdgeKind }>,
  relatives: Relative[],
): RelationshipPathStep[] {
  const hopIds: string[] = [];
  let cursor: string | null = targetId;

  while (cursor) {
    hopIds.unshift(cursor);
    const link = previousById.get(cursor);
    cursor = link?.fromId ?? null;
  }

  hopIds.shift();

  const steps: RelationshipPathStep[] = [];

  for (const personId of hopIds) {
    const person = getPersonById(relatives, personId);
    const link = previousById.get(personId);
    if (!person || !link) {
      continue;
    }

    const previous = getPersonById(relatives, link.fromId);
    if (!previous) {
      continue;
    }

    steps.push({
      person,
      edgeKind: link.via,
      stepLabel: labelTraversedEdge(previous, person, link.via),
    });
  }

  return steps;
}

export function toKinshipPathSteps(result: RelationshipPathResult): KinshipPathStep[] {
  return result.steps.map((step) => ({
    person: step.person,
    stepLabel: step.stepLabel,
  }));
}

/** Internal trace for tests and debugging — not for user-facing UI. */
export function formatInternalRelationshipPathTrace(
  fromPerson: Relative,
  result: RelationshipPathResult,
): string {
  if (!result.resolved || result.steps.length === 0) {
    return getRelativeDisplayName(fromPerson);
  }

  const parts = [getRelativeDisplayName(fromPerson)];

  for (const step of result.steps) {
    parts.push(`${step.stepLabel} ${getRelativeDisplayName(step.person)}`);
  }

  return parts.join(' → ');
}

export function getRelationshipPathHopCount(
  fromPerson: Relative,
  toPerson: Relative,
  relatives: Relative[],
): number {
  return findShortestRelationshipPath(fromPerson, toPerson, relatives).hopCount;
}
