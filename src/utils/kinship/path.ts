import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { classifyKinship } from '@/utils/kinship/classify';
import {
  areSpouses,
  getChildren,
  getEffectiveSpouse,
  getParents,
  getPersonById,
} from '@/utils/kinship/graph';
import type { KinshipPathStep } from '@/utils/kinship/types';

export type KinshipGraphEdge = {
  fromId: string;
  toId: string;
  kind: 'parent' | 'child' | 'spouse';
};

/** Build adjacency list from structural links only. */
export function buildKinshipEdges(relatives: Relative[]): KinshipGraphEdge[] {
  const edges: KinshipGraphEdge[] = [];

  for (const person of relatives) {
    if (person.fatherId) {
      edges.push({ fromId: person.id, toId: person.fatherId, kind: 'parent' });
      edges.push({ fromId: person.fatherId, toId: person.id, kind: 'child' });
    }

    if (person.motherId) {
      edges.push({ fromId: person.id, toId: person.motherId, kind: 'parent' });
      edges.push({ fromId: person.motherId, toId: person.id, kind: 'child' });
    }

    if (person.spouseId) {
      edges.push({ fromId: person.id, toId: person.spouseId, kind: 'spouse' });
      edges.push({ fromId: person.spouseId, toId: person.id, kind: 'spouse' });
    }
  }

  return edges;
}

type QueueItem = {
  personId: string;
  path: KinshipPathStep[];
};

/**
 * Shortest structural path between root and target using parent/child/spouse edges.
 * Semantic kinship labels are applied separately in classifyKinship().
 */
export function findKinshipPath(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipPathStep[] {
  if (relativeLinkIdsMatch(rootPerson.id, targetPerson.id)) {
    return [];
  }

  const classified = classifyKinship(rootPerson, targetPerson, relatives);
  if (classified.pathSteps.length > 0) {
    return classified.pathSteps;
  }

  const edges = buildKinshipEdges(relatives);
  const byFrom = new Map<string, KinshipGraphEdge[]>();

  for (const edge of edges) {
    const bucket = byFrom.get(edge.fromId) ?? [];
    bucket.push(edge);
    byFrom.set(edge.fromId, bucket);
  }

  const visited = new Set<string>([rootPerson.id]);
  const queue: QueueItem[] = [{ personId: rootPerson.id, path: [] }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    const outgoing = byFrom.get(current.personId) ?? [];

    for (const edge of outgoing) {
      if (visited.has(edge.toId)) {
        continue;
      }

      const nextPerson = getPersonById(relatives, edge.toId);
      if (!nextPerson) {
        continue;
      }

      const stepLabel =
        edge.kind === 'parent' ? 'ата-ана' : edge.kind === 'child' ? 'бала' : 'жұбайы';
      const nextPath = [...current.path, { person: nextPerson, stepLabel }];

      if (relativeLinkIdsMatch(nextPerson.id, targetPerson.id)) {
        return nextPath;
      }

      visited.add(edge.toId);
      queue.push({ personId: edge.toId, path: nextPath });
    }
  }

  return [];
}

export function describeKinshipPath(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): string {
  const steps = findKinshipPath(rootPerson, targetPerson, relatives);

  if (steps.length === 0) {
    if (relativeLinkIdsMatch(rootPerson.id, targetPerson.id)) {
      return 'Бұл сіздің профиліңіз';
    }

    return '';
  }

  return steps
    .map((step) => `${getRelativeDisplayName(step.person)} (${step.stepLabel})`)
    .join(' → ');
}

export function summarizeStructuralBridge(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): string | null {
  const spouse = getEffectiveSpouse(rootPerson, relatives);
  if (spouse && areSpouses(spouse, targetPerson)) {
    return `${getRelativeDisplayName(spouse)} жұбайы`;
  }

  for (const sibling of relatives.filter((candidate) =>
    getParents(rootPerson, relatives).some(
      (parent) =>
        relativeLinkIdsMatch(candidate.fatherId, parent.id) ||
        relativeLinkIdsMatch(candidate.motherId, parent.id),
    ),
  )) {
    const siblingSpouse = getEffectiveSpouse(sibling, relatives);
    if (siblingSpouse && relativeLinkIdsMatch(siblingSpouse.id, targetPerson.id)) {
      return `${getRelativeDisplayName(sibling)} бауырдың жұбайы`;
    }
  }

  for (const child of getChildren(rootPerson, relatives)) {
    const childSpouse = getEffectiveSpouse(child, relatives);
    if (childSpouse && relativeLinkIdsMatch(childSpouse.id, targetPerson.id)) {
      return `${getRelativeDisplayName(child)} баланың жұбайы`;
    }
  }

  return null;
}
