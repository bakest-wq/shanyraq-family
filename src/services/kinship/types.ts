export type {
  KinshipCategory,
  KinshipExplanation,
  KinshipLabel,
  KinshipPathStep,
  KinshipResult,
  KinshipType,
} from '@/utils/kinship/types';

/** Graph-driven three-jurt grouping — never stored in the database. */
export type ThreeJurtGroup =
  | 'oz_jurt'
  | 'nagashy_jurt'
  | 'kaiyn_jurt'
  | 'kuda_jurt'
  | 'direct_family'
  | 'unknown';

/** Confidence tier for display — broader labels when low. */
export type KinshipConfidence = 'high' | 'medium' | 'low';

/** Future-ready metadata for AI / voice / storytelling layers. */
export type KinshipIntelligenceMeta = {
  confidence: KinshipConfidence;
  jurtGroup: ThreeJurtGroup;
  structuralPathLength: number;
  uncertain: boolean;
};
