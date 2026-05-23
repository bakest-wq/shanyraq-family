import { ConnectParentsInput, Relative } from '@/types/relative';
import {
  buildFamilyGraph,
  buildLinkSyncPatchesFromGraph,
  getById,
  linksFromRelative as graphLinksFromRelative,
  snapshotsEqual,
  type FamilyLinkSnapshot,
} from '@/utils/family-graph';

export type { FamilyLinkSnapshot };

export type LinkSyncPatch = {
  personId: string;
  patch: Partial<ConnectParentsInput>;
};

export function linksFromRelative(relative: Relative): FamilyLinkSnapshot {
  return graphLinksFromRelative(relative);
}

export function linksFromInput(input: ConnectParentsInput): FamilyLinkSnapshot {
  return {
    fatherId: input.fatherId ?? null,
    motherId: input.motherId ?? null,
    spouseId: input.spouseId ?? null,
  };
}

/** Only sync explicit spouse_id reciprocals — never infer parents from names or labels. */
export function buildLinkSyncPatches(
  subjectId: string,
  before: FamilyLinkSnapshot | null,
  after: FamilyLinkSnapshot,
  relatives: Relative[],
): LinkSyncPatch[] {
  const graph = buildFamilyGraph(relatives);
  return buildLinkSyncPatchesFromGraph(subjectId, before, after, graph);
}

export function clearFamilyLinkSnapshot(): FamilyLinkSnapshot {
  return {
    fatherId: null,
    motherId: null,
    spouseId: null,
  };
}

export { getById, snapshotsEqual };
