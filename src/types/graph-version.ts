import type { EditActor } from '@/types/edit-history';
import type { Relative } from '@/types/relative';

export const GRAPH_VERSION_MAX = 24;

export type GraphVersionKind = 'change' | 'restore' | 'safety';

/** Lightweight version metadata — full graph stored separately. */
export type GraphVersionEntry = {
  id: string;
  familyId: string;
  at: string;
  actor: EditActor;
  kind: GraphVersionKind;
  summary: string;
  relativeCount: number;
  structuralFingerprint: string;
  editEventId?: string;
  restoredFromVersionId?: string;
};

export type GraphVersionSnapshot = {
  versionId: string;
  familyId: string;
  capturedAt: string;
  relatives: Relative[];
  structuralFingerprint: string;
};

export type RestoreGraphVersionResult = {
  versionId: string;
  relativesRestored: number;
  safetyVersionId: string;
};
