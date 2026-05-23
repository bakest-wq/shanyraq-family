import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import {
  buildFamilyGraph,
  type FamilyGraph,
} from '@/utils/family-graph/graph';
import {
  linksFromRelative,
  normalizeRelativeList,
  snapshotsEqual,
} from '@/utils/family-graph/normalize';
import type {
  FamilyGraphDerived,
  FamilyLinkSnapshot,
  GraphRepairPatch,
} from '@/utils/family-graph/types';

export type RebuiltFamilyGraph = {
  graph: FamilyGraph;
  derived: FamilyGraphDerived;
  normalizedRelatives: Relative[];
};

export function rebuildFamilyGraph(relatives: Relative[]): RebuiltFamilyGraph {
  const normalizedRelatives = normalizeRelativeList(relatives);
  const graph = buildFamilyGraph(normalizedRelatives);

  return {
    graph,
    derived: graph.derived,
    normalizedRelatives,
  };
}

export function buildSpouseReciprocalPatches(graph: FamilyGraph): GraphRepairPatch[] {
  const patches: GraphRepairPatch[] = [];

  for (const relative of graph.relatives) {
    if (!relative.spouseId) {
      continue;
    }

    const spouse = graph.getById(relative.spouseId);
    if (!spouse) {
      continue;
    }

    if (!relativeLinkIdsMatch(spouse.spouseId, relative.id)) {
      patches.push({
        personId: spouse.id,
        patch: { spouseId: relative.id },
        reason: 'Жұбай байланысын екі жаққа да сәйкестендіру',
      });
    }
  }

  return dedupeRepairPatches(patches);
}

export function applyGraphRepairPatches(
  graph: FamilyGraph,
  patches: GraphRepairPatch[],
): FamilyGraph {
  let next = graph;

  for (const { personId, patch } of patches) {
    next = next.withPatchedLinks(personId, patch);
  }

  return next;
}

export function buildLinkSyncPatchesFromGraph(
  subjectId: string,
  before: FamilyLinkSnapshot | null,
  after: FamilyLinkSnapshot,
  graph: FamilyGraph,
): Array<{ personId: string; patch: Partial<FamilyLinkSnapshot> }> {
  const patches: Array<{ personId: string; patch: Partial<FamilyLinkSnapshot> }> = [];
  const previousSpouseId = before?.spouseId ?? null;
  const nextSpouseId = after.spouseId ?? null;

  if (previousSpouseId && !relativeLinkIdsMatch(previousSpouseId, nextSpouseId)) {
    const previousSpouse = graph.getById(previousSpouseId);
    if (previousSpouse && relativeLinkIdsMatch(previousSpouse.spouseId, subjectId)) {
      patches.push({
        personId: previousSpouseId,
        patch: { spouseId: null },
      });
    }
  }

  if (!nextSpouseId || relativeLinkIdsMatch(nextSpouseId, previousSpouseId)) {
    return dedupeLinkPatches(patches).filter(isEffectivePatch(graph));
  }

  const nextSpouse = graph.getById(nextSpouseId);
  if (
    nextSpouse &&
    (!nextSpouse.spouseId || relativeLinkIdsMatch(nextSpouse.spouseId, subjectId))
  ) {
    patches.push({
      personId: nextSpouseId,
      patch: { spouseId: subjectId },
    });
  }

  return dedupeLinkPatches(patches).filter(isEffectivePatch(graph));
}

function dedupeLinkPatches(
  patches: Array<{ personId: string; patch: Partial<FamilyLinkSnapshot> }>,
): Array<{ personId: string; patch: Partial<FamilyLinkSnapshot> }> {
  const byPerson = new Map<string, Partial<FamilyLinkSnapshot>>();

  for (const { personId, patch } of patches) {
    byPerson.set(personId, { ...(byPerson.get(personId) ?? {}), ...patch });
  }

  return Array.from(byPerson.entries()).map(([personId, patch]) => ({
    personId,
    patch,
  }));
}

function dedupeRepairPatches(patches: GraphRepairPatch[]): GraphRepairPatch[] {
  const byPerson = new Map<string, GraphRepairPatch>();

  for (const patch of patches) {
    const existing = byPerson.get(patch.personId);
    if (!existing) {
      byPerson.set(patch.personId, patch);
      continue;
    }

    byPerson.set(patch.personId, {
      ...existing,
      patch: { ...existing.patch, ...patch.patch },
      reason: existing.reason,
    });
  }

  return [...byPerson.values()];
}

function isEffectivePatch(graph: FamilyGraph) {
  return ({ personId, patch }: { personId: string; patch: Partial<FamilyLinkSnapshot> }) => {
    const person = graph.getById(personId);
    if (!person) {
      return false;
    }

    const current = linksFromRelative(person);
    const next = {
      fatherId: patch.fatherId !== undefined ? patch.fatherId : current.fatherId,
      motherId: patch.motherId !== undefined ? patch.motherId : current.motherId,
      spouseId: patch.spouseId !== undefined ? patch.spouseId : current.spouseId,
    };

    return !snapshotsEqual(current, next);
  };
}

export function diffStructuralLinks(
  before: Relative,
  after: Relative,
): Partial<FamilyLinkSnapshot> | null {
  const left = linksFromRelative(before);
  const right = linksFromRelative(after);

  if (snapshotsEqual(left, right)) {
    return null;
  }

  return {
    fatherId: right.fatherId,
    motherId: right.motherId,
    spouseId: right.spouseId,
  };
}
