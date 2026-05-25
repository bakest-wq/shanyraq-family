import type {
  KinshipConfidence,
  KinshipExplanation,
  KinshipIntelligenceMeta,
  KinshipPathStep,
  KinshipResult,
  ThreeJurtGroup,
} from '@/services/kinship/types';

/** Full intelligence snapshot returned by analyzeKinship. */
export type AnalyzeKinshipResult = {
  label: KinshipResult;
  cardLine: string;
  explanation: KinshipExplanation;
  confidence: KinshipConfidence;
  jurtGroup: ThreeJurtGroup;
  path: KinshipPathStep[];
  meta: KinshipIntelligenceMeta;
};
