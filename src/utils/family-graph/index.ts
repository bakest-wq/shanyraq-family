export type {
  AgeOrder,
  DuplicateCandidate,
  DuplicateSignal,
  FamilyGraphDerived,
  FamilyLinkField,
  FamilyLinkSnapshot,
  GraphIntegrityCode,
  GraphIntegrityIssue,
  GraphIntegrityReport,
  GraphIntegritySeverity,
  GraphRepairPatch,
  SafeDeleteImpact,
  SafeDeletePlan,
} from '@/utils/family-graph/types';

export {
  buildFamilyGraph,
  FamilyGraph,
  areSiblings,
  areSpouses,
  compareBirthYear,
  getAncestorIds,
  getById,
  getChildren,
  getChildrenById,
  getDescendantDepth,
  getDescendantIds,
  getEffectiveSpouse,
  getFather,
  getGrandchildren,
  getGrandparents,
  getMother,
  getParents,
  getPersonById,
  getSiblings,
  hasParentLinks,
  isChildOf,
  isFemale,
  isMale,
  sortRelativesByName,
} from '@/utils/family-graph/graph';

export {
  dedupeRelativesById,
  linkTargetsExist,
  linksFromRelative,
  mergeLinkSnapshots,
  normalizeFamilyLinkSnapshot,
  normalizeLinkId,
  normalizeRelativeList,
  normalizeRelativeStructuralLinks,
  resolveLinkTarget,
  snapshotsEqual,
} from '@/utils/family-graph/normalize';

export {
  getIntegrityIssuesForRelative,
  hasBlockingIntegrityErrors,
  validateGraphIntegrity,
  validateProposedLinks,
  wouldPatchCreateCycle,
} from '@/utils/family-graph/integrity';

export {
  collectRelativesAffectedByDelete,
  planSafeDelete,
  summarizeDeleteImpact,
} from '@/utils/family-graph/delete';

export {
  findDuplicateCandidates,
  findDuplicatesForRelative,
  type DuplicateDetectionOptions,
} from '@/utils/family-graph/duplicates';

export {
  applyGraphRepairPatches,
  buildLinkSyncPatchesFromGraph,
  buildSpouseReciprocalPatches,
  diffStructuralLinks,
  rebuildFamilyGraph,
  type RebuiltFamilyGraph,
} from '@/utils/family-graph/rebuild';
