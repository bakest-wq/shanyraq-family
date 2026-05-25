import type {
  KinshipConfidence,
  KinshipIntelligenceMeta,
  KinshipPathStep,
  KinshipResult,
  ThreeJurtGroup,
} from '@/services/kinship/types';

/** Cached relationship intelligence for one root → target pair. */
export type KinshipRelationshipSnapshot = {
  label: KinshipResult;
  cardLine: string;
  confidence: KinshipConfidence;
  jurtGroup: ThreeJurtGroup;
  path: KinshipPathStep[];
  meta: KinshipIntelligenceMeta;
  structuralPathLength: number;
};

export type KinshipCacheStats = {
  pairEntries: number;
  jurtEntries: number;
  structuralFingerprint: string | null;
  jurtFingerprint: string | null;
  familyId: string | null;
};
