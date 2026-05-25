/** Cached kinship facade — UI and features should import from here only. */
import type { Relative } from '@/types/relative';

import {
  isBrotherChildKinshipType,
  isZhienKinshipType,
  resolveBrotherSpouseKinship,
  resolveDaughterChildKinship,
  resolveKayinSiblingKinship,
  resolveMappedSiblingKinship,
  resolveRootSiblingKinship,
  resolveSiblingChildKinship,
  resolveSisterSpouseKinship,
} from '@/services/kinship/age-aware-kinship';
import {
  BROAD_KINSHIP_LABELS,
  buildKinshipIntelligenceMeta,
  getKinshipConfidence,
  getRelationshipConfidence,
  isLowConfidenceLabel,
  resolveConfidenceSafeExplanation,
  resolveConfidenceSafeLabel,
  scoreKinshipConfidence,
  shouldPreferBroadLabel,
} from '@/services/kinship/kinship-confidence';
import { kinshipCacheService, invalidateKinshipCache } from '@/services/kinship/kinship-cache.service';
import { buildHumanKinshipExplanation } from '@/services/kinship/kinship-human-explanation';
import {
  buildKinshipMemoryLine,
  buildKinshipMemorySnapshot,
} from '@/services/kinship/kinship-memory';
import { analyzeKinship } from '@/services/kinship/shared/kinship-analyze';
import {
  JURT_GROUP_LABELS,
  getThreeJurtGroupFromResult,
  mapThreeJurtGroupToJurtKind,
} from '@/services/kinship/kinship-groups';
import {
  getKinshipCardLabel,
  resolveKinshipResult,
  ROOT_PERSON_LABEL,
} from '@/services/kinship/kinship-labels';
import {
  getKinshipPathDescription,
  MAX_GRAPH_TRAVERSAL_STEPS,
} from '@/services/kinship/kinship-path';
import type {
  KinshipConfidence,
  KinshipExplanation,
  KinshipIntelligenceMeta,
  KinshipPathStep,
  KinshipResult,
  ThreeJurtGroup,
} from '@/services/kinship/types';

export type {
  KinshipCategory,
  KinshipConfidence,
  KinshipExplanation,
  KinshipIntelligenceMeta,
  KinshipLabel,
  KinshipPathStep,
  KinshipResult,
  KinshipType,
  ThreeJurtGroup,
} from '@/services/kinship/types';

export type {
  KinshipMemoryContext,
  KinshipMemorySignal,
  KinshipMemorySnapshot,
  KinshipMemorySource,
  KinshipMemoryTone,
} from '@/services/kinship/kinship-memory.types';

export {
  buildKinshipMemoryLine,
  buildKinshipMemorySnapshot,
} from '@/services/kinship/kinship-memory';
export { analyzeKinship } from '@/services/kinship/shared/kinship-analyze';
export type { AnalyzeKinshipResult } from '@/services/kinship/shared/kinship-types';
export {
  invalidateKinshipCache,
  kinshipCacheService,
} from '@/services/kinship/kinship-cache.service';
export type { KinshipCacheStats, KinshipRelationshipSnapshot } from '@/services/kinship/kinship-cache.types';
export {
  buildKinshipStructuralFingerprint,
  buildJurtGraphFingerprint,
  hasStructuralKinshipChange,
} from '@/services/kinship/family-structural-fingerprint';
export {
  findShortestRelationshipPath,
  formatInternalRelationshipPathTrace,
  getRelationshipPathHopCount,
  getRelationshipPathSteps,
  resolveRelationshipPath,
  toKinshipPathSteps,
} from '@/services/kinship/relationship-path.service';
export type {
  RelationshipPathEdgeKind,
  RelationshipPathEngineOptions,
  RelationshipPathResult,
  RelationshipPathStep,
} from '@/services/kinship/relationship-path.types';

export {
  AGE_AWARE_BROAD_LABELS,
  isBrotherChildKinshipType,
  isZhienKinshipType,
  resolveBrotherSpouseKinship,
  resolveDaughterChildKinship,
  resolveKayinSiblingKinship,
  resolveMappedSiblingKinship,
  resolveRootSiblingKinship,
  resolveSiblingChildKinship,
  resolveSisterSpouseKinship,
} from '@/services/kinship/age-aware-kinship';

export {
  BROAD_KINSHIP_LABELS,
  JURT_GROUP_LABELS,
  MAX_GRAPH_TRAVERSAL_STEPS,
  ROOT_PERSON_LABEL,
  buildKinshipIntelligenceMeta,
  buildHumanKinshipExplanation,
  getKinshipCardLabel,
  getKinshipConfidence,
  getKinshipPathDescription,
  getRelationshipConfidence,
  getThreeJurtGroupFromResult,
  isLowConfidenceLabel,
  mapThreeJurtGroupToJurtKind,
  resolveConfidenceSafeExplanation,
  resolveConfidenceSafeLabel,
  resolveKinshipResult,
  scoreKinshipConfidence,
  shouldPreferBroadLabel,
};

export {
  areSpouses,
  areSiblings,
  getChildren,
  getEffectiveSpouse,
  getFather,
  getMother,
  getParents,
  getPersonById,
  getSiblings,
  isChildOf,
  isFemale,
  isMale,
} from '@/utils/kinship/graph';

/** Primary label API — same person, different meaning per root. */
export function getKinshipLabel(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipResult {
  return kinshipCacheService
    .getRelationshipSnapshot(rootPerson, targetPerson, allRelatives)
    .label;
}

export function getKinshipCardLine(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): string {
  return kinshipCacheService.getRelationshipSnapshot(rootPerson, targetPerson, allRelatives)
    .cardLine;
}

/** Batch card lines for lists and trees — single kinship entry point. */
export function buildKinshipCardLineMap(
  rootPerson: Relative,
  targetPeople: Relative[],
  allRelatives: Relative[],
): Map<string, string> {
  const labels = new Map<string, string>();

  for (const target of targetPeople) {
    if (rootPerson.id === target.id) {
      continue;
    }

    labels.set(target.id, getKinshipCardLine(rootPerson, target, allRelatives));
  }

  return labels;
}

export function getKinshipExplanation(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipExplanation {
  return kinshipCacheService.getExplanation(rootPerson, targetPerson, allRelatives, true);
}

export function getKinshipExplanationBetween(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipExplanation {
  return kinshipCacheService.getExplanation(rootPerson, targetPerson, allRelatives, false);
}

export function getKinshipPath(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipPathStep[] {
  return kinshipCacheService.getRelationshipSnapshot(rootPerson, targetPerson, allRelatives).path;
}

export function getThreeJurtGroup(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): ThreeJurtGroup {
  return kinshipCacheService.getRelationshipSnapshot(rootPerson, targetPerson, allRelatives)
    .jurtGroup;
}

export const kinshipService = {
  analyzeKinship,
  buildKinshipCardLineMap,
  buildKinshipMemoryLine,
  buildKinshipMemorySnapshot,
  getKinshipLabel,
  getKinshipCardLabel,
  getKinshipCardLine,
  getKinshipExplanation,
  getKinshipExplanationBetween,
  getKinshipPath,
  getKinshipPathDescription,
  getKinshipConfidence,
  getRelationshipConfidence,
  getThreeJurtGroup,
  getThreeJurtGroupFromResult,
  mapThreeJurtGroupToJurtKind,
  resolveKinshipResult,
  scoreKinshipConfidence,
  buildKinshipIntelligenceMeta,
  resolveRootSiblingKinship,
  resolveBrotherSpouseKinship,
  resolveSisterSpouseKinship,
  resolveKayinSiblingKinship,
  resolveSiblingChildKinship,
  resolveDaughterChildKinship,
  isBrotherChildKinshipType,
  isZhienKinshipType,
} as const;
