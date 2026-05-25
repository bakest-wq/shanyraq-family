import { kk, FAMILY_LANGUAGE } from '@/content/family-language';

export const HEALTH_CHECK_COPY = {
  title: kk(FAMILY_LANGUAGE.health.title),
  subtitle: kk(FAMILY_LANGUAGE.health.subtitle),
  allClear: kk(FAMILY_LANGUAGE.health.allClear),
  allClearHint: kk(FAMILY_LANGUAGE.health.allClearHint),
  needsAttention: kk(FAMILY_LANGUAGE.health.needsAttention),
  needsAttentionHint: kk(FAMILY_LANGUAGE.health.needsAttentionHint),
  sections: {
    brokenLinks: kk(FAMILY_LANGUAGE.health.sectionBrokenLinks),
    duplicateCandidates: kk(FAMILY_LANGUAGE.health.sectionDuplicateCandidates),
    missingParents: kk(FAMILY_LANGUAGE.health.sectionMissingParents),
    spouseMismatch: kk(FAMILY_LANGUAGE.health.sectionSpouseMismatch),
    circularRelations: kk(FAMILY_LANGUAGE.health.sectionCircular),
  },
  empty: {
    brokenLinks: kk(FAMILY_LANGUAGE.health.emptyBrokenLinks),
    duplicateCandidates: kk(FAMILY_LANGUAGE.health.emptyDuplicates),
    missingParents: kk(FAMILY_LANGUAGE.health.emptyMissingParents),
    spouseMismatch: kk(FAMILY_LANGUAGE.health.emptySpouseMismatch),
    circularRelations: kk(FAMILY_LANGUAGE.health.emptyCircular),
  },
  explain: {
    parentsNotSet: kk(FAMILY_LANGUAGE.health.explainParentsNotSet),
    parentNotFound: kk(FAMILY_LANGUAGE.health.explainParentNotFound),
    parentLinkNeedsReview: kk(FAMILY_LANGUAGE.health.explainParentLinkNeedsReview),
    spouseNotFound: kk(FAMILY_LANGUAGE.health.explainSpouseNotFound),
    spouseMismatch: kk(FAMILY_LANGUAGE.health.explainSpouseMismatch),
    duplicateProfile: kk(FAMILY_LANGUAGE.health.explainDuplicateProfile),
    circularRelation: kk(FAMILY_LANGUAGE.health.ancestorCycle),
    invalidSiblingParent: kk(FAMILY_LANGUAGE.relationships.siblingAsParent),
    selfLink: kk(FAMILY_LANGUAGE.health.selfLink),
    parentSpouseConflict: kk(FAMILY_LANGUAGE.health.parentSpouseConflict),
    sameParents: kk(FAMILY_LANGUAGE.health.sameParents),
  },
  actions: {
    addParents: kk(FAMILY_LANGUAGE.health.actionAddParents),
    fixParentLink: kk(FAMILY_LANGUAGE.health.actionFixParentLink),
    reviewLink: kk(FAMILY_LANGUAGE.health.actionReviewLink),
    fixSpouse: kk(FAMILY_LANGUAGE.health.actionFixSpouse),
    syncSpouse: kk(FAMILY_LANGUAGE.health.actionSyncSpouse),
    reviewDuplicate: kk(FAMILY_LANGUAGE.health.actionReviewDuplicate),
  },
  toast: {
    linkCleared: kk(FAMILY_LANGUAGE.health.toastLinkCleared),
    spouseSynced: kk(FAMILY_LANGUAGE.health.toastSpouseSynced),
  },
} as const;

/** Five calm sections shown on the health check screen, in display order. */
export const HEALTH_CHECK_SECTION_ORDER = [
  'brokenLinks',
  'duplicateCandidates',
  'missingParents',
  'spouseMismatch',
  'circularRelations',
] as const;

export type HealthCheckSectionKey = (typeof HEALTH_CHECK_SECTION_ORDER)[number];
