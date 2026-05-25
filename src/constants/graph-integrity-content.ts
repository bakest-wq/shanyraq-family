import { bilingual, FAMILY_LANGUAGE, kk, ru } from '@/content/family-language';

export const GRAPH_INTEGRITY_COPY = {
  deleteBlocked: kk(FAMILY_LANGUAGE.health.deleteBlocked),
  deleteBlockedHint: bilingual(FAMILY_LANGUAGE.health.deleteBlockedHint),
  clearReferences: kk(FAMILY_LANGUAGE.health.clearReferences),
  deleteAfterClear: kk(FAMILY_LANGUAGE.health.deleteAfterClear),
  affectedRelatives: kk(FAMILY_LANGUAGE.health.affectedRelatives),
  healthCheckTitle: kk(FAMILY_LANGUAGE.health.title),
  healthCheckSubtitle: bilingual(FAMILY_LANGUAGE.health.subtitle),
  allClear: kk(FAMILY_LANGUAGE.health.allClear),
  allClearHint: bilingual(FAMILY_LANGUAGE.health.allClearHint),
  needsAttention: kk(FAMILY_LANGUAGE.health.needsAttention),
  needsAttentionHint: bilingual(FAMILY_LANGUAGE.health.needsAttentionHint),
  sections: {
    brokenParents: kk(FAMILY_LANGUAGE.health.sectionBrokenParents),
    brokenSpouses: kk(FAMILY_LANGUAGE.health.sectionBrokenSpouses),
    duplicates: kk(FAMILY_LANGUAGE.health.sectionDuplicates),
    circular: kk(FAMILY_LANGUAGE.health.sectionCircular),
    invalidChildParent: kk(FAMILY_LANGUAGE.health.sectionInvalidChildParent),
    orphans: kk(FAMILY_LANGUAGE.health.sectionOrphans),
    unplaced: kk(FAMILY_LANGUAGE.unlinked.sectionTitle),
  },
  empty: {
    brokenParents: kk(FAMILY_LANGUAGE.health.emptyBrokenParents),
    brokenSpouses: kk(FAMILY_LANGUAGE.health.emptyBrokenSpouses),
    duplicates: kk(FAMILY_LANGUAGE.health.emptyDuplicates),
    circular: kk(FAMILY_LANGUAGE.health.emptyCircular),
    invalidChildParent: kk(FAMILY_LANGUAGE.health.emptyInvalidChildParent),
    orphans: kk(FAMILY_LANGUAGE.health.emptyOrphans),
    orphanMessage: kk(FAMILY_LANGUAGE.unlinked.placeUnknown),
    unplaced: kk(FAMILY_LANGUAGE.health.emptyUnplaced),
  },
  repairs: {
    clearBrokenParents: kk(FAMILY_LANGUAGE.health.repairClearParents),
    syncSpouses: kk(FAMILY_LANGUAGE.health.repairSyncSpouses),
    clearOrphanRefs: kk(FAMILY_LANGUAGE.health.repairClearOrphans),
    runAllSafe: kk(FAMILY_LANGUAGE.health.repairRunAllSafe),
    applied: kk(FAMILY_LANGUAGE.success.repairsApplied),
    nothingNeeded: kk(FAMILY_LANGUAGE.health.repairNothingNeeded),
  },
  validation: {
    siblingAsParent: kk(FAMILY_LANGUAGE.relationships.siblingAsParent),
    siblingAsChild: kk(FAMILY_LANGUAGE.relationships.siblingAsChild),
  },
} as const;

export { FAMILY_LANGUAGE, bilingual, kk, ru } from '@/content/family-language';
