import type { CreateRelativeInput, Relative } from '@/types/relative';
import { GRAPH_INTEGRITY_COPY } from '@/constants/graph-integrity-content';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import type { ParentLinkRole } from '@/utils/family-child-links';
import {
  getRelativeReferences,
} from '@/utils/get-relative-references';
import {
  validateFamilyLinks,
  type FamilyLinkErrors,
  type ValidateFamilyLinksContext,
} from '@/utils/family-link-validation';
import {
  buildFamilyGraph,
  buildSpouseReciprocalPatches,
  findDuplicateCandidates,
  type FamilyGraph,
  type GraphIntegrityIssue,
  type GraphRepairPatch,
  validateGraphIntegrity,
} from '@/utils/family-graph';
import {
  PROPOSED_RELATIVE_ID,
  validateLinkedChildIdsBeforeSave,
  validateRelationshipSafetyForSave,
} from '@/utils/relationship-safety-validation';
import { getRelativeDisplayName } from '@/utils/relative-names';

export {
  RelationshipSafetyBlockedError,
  RELATIONSHIP_SAFETY_MESSAGE,
} from '@/utils/relationship-safety-validation';

export type GraphIntegrityHealthItem = {
  code: string;
  severity: 'error' | 'warning';
  relativeId: string;
  relatedId?: string;
  field?: 'fatherId' | 'motherId' | 'spouseId';
  message: string;
};

export type ShezhireRepairKind =
  | 'clear_broken_parents'
  | 'sync_spouses'
  | 'clear_orphan_references';

export type ShezhireRepairPlan = {
  clearBrokenParents: GraphRepairPatch[];
  syncSpouses: GraphRepairPatch[];
  clearOrphanReferences: GraphRepairPatch[];
};

export type ShezhireHealthCheckReport = {
  brokenParentLinks: GraphIntegrityHealthItem[];
  brokenSpouseLinks: GraphIntegrityHealthItem[];
  duplicatePeople: ReturnType<typeof findDuplicateCandidates>;
  circularRelations: GraphIntegrityHealthItem[];
  invalidChildParentLinks: GraphIntegrityHealthItem[];
  orphanRelatives: Relative[];
  integrityIssues: GraphIntegrityIssue[];
  repairPlan: ShezhireRepairPlan;
  hasBlockingIssues: boolean;
  hasRepairableIssues: boolean;
};

export type RelativeSaveValidation = {
  valid: boolean;
  errors: FamilyLinkErrors;
  issues: GraphIntegrityIssue[];
};

export type SafeDeleteAssessment = {
  relativeId: string;
  canDelete: boolean;
  blockMessage?: string;
  referencingRelatives: Relative[];
  clearReferencePatches: GraphRepairPatch[];
};

export class DeleteBlockedError extends Error {
  assessment: SafeDeleteAssessment;

  constructor(assessment: SafeDeleteAssessment) {
    super(assessment.blockMessage ?? GRAPH_INTEGRITY_COPY.deleteBlocked);
    this.name = 'DeleteBlockedError';
    this.assessment = assessment;
  }
}

function toHealthItem(issue: GraphIntegrityIssue): GraphIntegrityHealthItem {
  return {
    code: issue.code,
    severity: issue.severity,
    relativeId: issue.relativeId,
    relatedId: issue.relatedId,
    field: issue.field,
    message: issue.message,
  };
}

function buildGraph(allRelatives: Relative[]): FamilyGraph {
  return buildFamilyGraph(allRelatives);
}

function shareAnyParent(left: Relative, right: Relative): boolean {
  return (
    Boolean(
      left.fatherId &&
        right.fatherId &&
        relativeLinkIdsMatch(left.fatherId, right.fatherId),
    ) ||
    Boolean(
      left.motherId &&
        right.motherId &&
        relativeLinkIdsMatch(left.motherId, right.motherId),
    )
  );
}

export type RelativeSaveValidationOptions = {
  linkedChildIds?: string[];
  parentLinkRole?: ParentLinkRole;
};

export function validateRelativeBeforeSave(
  input: CreateRelativeInput,
  allRelatives: Relative[],
  context: ValidateFamilyLinksContext = { relatives: allRelatives },
  options: RelativeSaveValidationOptions = {},
): RelativeSaveValidation {
  const linkErrors = validateFamilyLinks(
    {
      fatherId: input.fatherId,
      motherId: input.motherId,
      spouseId: input.spouseId,
    },
    {
      ...context,
      subjectGender: input.gender ?? context.subjectGender,
    },
  );

  const safetyErrors = validateRelationshipSafetyForSave(input, allRelatives, context);
  const errors: FamilyLinkErrors = { ...linkErrors, ...safetyErrors };

  if (options.linkedChildIds?.length && options.parentLinkRole) {
    const parentId = context.relativeId ?? PROPOSED_RELATIVE_ID;
    const childLinkErrors = validateLinkedChildIdsBeforeSave(
      parentId,
      options.linkedChildIds,
      options.parentLinkRole,
      allRelatives,
      parentId === PROPOSED_RELATIVE_ID
        ? {
            fatherId: input.fatherId ?? undefined,
            motherId: input.motherId ?? undefined,
          }
        : undefined,
    );
    Object.assign(errors, childLinkErrors);
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    issues: [],
  };
}

export function findBrokenParentLinks(allRelatives: Relative[]): GraphIntegrityHealthItem[] {
  const graph = buildGraph(allRelatives);

  return validateGraphIntegrity(graph).issues
    .filter(
      (issue) =>
        issue.code === 'broken_link' &&
        (issue.field === 'fatherId' || issue.field === 'motherId'),
    )
    .map(toHealthItem);
}

export function findBrokenSpouseLinks(allRelatives: Relative[]): GraphIntegrityHealthItem[] {
  const graph = buildGraph(allRelatives);

  return validateGraphIntegrity(graph).issues
    .filter(
      (issue) =>
        (issue.code === 'broken_link' && issue.field === 'spouseId') ||
        issue.code === 'spouse_mismatch',
    )
    .map(toHealthItem);
}

export function findCircularParentChains(allRelatives: Relative[]): GraphIntegrityHealthItem[] {
  const graph = buildGraph(allRelatives);

  return validateGraphIntegrity(graph).issues
    .filter((issue) => issue.code === 'ancestor_cycle')
    .map(toHealthItem);
}

export function findDuplicatePeople(allRelatives: Relative[]) {
  const graph = buildGraph(allRelatives);
  return findDuplicateCandidates(graph);
}

export function findInvalidChildParentLinks(allRelatives: Relative[]): GraphIntegrityHealthItem[] {
  const items: GraphIntegrityHealthItem[] = [];

  for (const relative of allRelatives) {
    for (const [field, parentId] of [
      ['fatherId', relative.fatherId],
      ['motherId', relative.motherId],
    ] as const) {
      if (!parentId) {
        continue;
      }

      const parent = allRelatives.find((candidate) => relativeLinkIdsMatch(candidate.id, parentId));
      if (!parent) {
        continue;
      }

      if (shareAnyParent(relative, parent)) {
        items.push({
          code: 'invalid_child_parent',
          severity: 'error',
          relativeId: relative.id,
          relatedId: parent.id,
          field,
          message: GRAPH_INTEGRITY_COPY.validation.siblingAsParent,
        });
      }
    }

    for (const candidate of allRelatives) {
      if (relativeLinkIdsMatch(candidate.id, relative.id)) {
        continue;
      }

      const childPointsToRelative =
        relativeLinkIdsMatch(candidate.fatherId, relative.id) ||
        relativeLinkIdsMatch(candidate.motherId, relative.id);

      if (childPointsToRelative && shareAnyParent(relative, candidate)) {
        items.push({
          code: 'invalid_child_parent',
          severity: 'error',
          relativeId: candidate.id,
          relatedId: relative.id,
          field: relativeLinkIdsMatch(candidate.fatherId, relative.id) ? 'fatherId' : 'motherId',
          message: GRAPH_INTEGRITY_COPY.validation.siblingAsChild,
        });
      }
    }
  }

  return dedupeHealthItems(items);
}

export function findOrphanRelatives(allRelatives: Relative[]): Relative[] {
  const graph = buildGraph(allRelatives);
  const unlinkedIds = new Set(graph.derived.unlinkedIds);

  return allRelatives.filter((relative) => unlinkedIds.has(relative.id));
}

export function findReferencingRelatives(
  relativeId: string,
  allRelatives: Relative[],
): Relative[] {
  return getRelativeReferences(relativeId, allRelatives).referencingRelatives;
}

export { buildClearReferencePatches } from '@/utils/get-relative-references';

export function buildClearBrokenParentLinkPatches(allRelatives: Relative[]): GraphRepairPatch[] {
  const graph = buildGraph(allRelatives);
  const patches: GraphRepairPatch[] = [];

  for (const issue of findBrokenParentLinks(allRelatives)) {
    if (!issue.field || !issue.relativeId) {
      continue;
    }

    patches.push({
      personId: issue.relativeId,
      patch: { [issue.field]: null },
      reason: 'Жарамсыз ата-ана сілтемесін тазарту',
    });
  }

  void graph;
  return dedupeRepairPatches(patches);
}

export function buildClearOrphanReferencePatches(allRelatives: Relative[]): GraphRepairPatch[] {
  const patches = [
    ...buildClearBrokenParentLinkPatches(allRelatives),
    ...buildClearBrokenSpouseReferencePatches(allRelatives),
  ];

  return dedupeRepairPatches(patches);
}

function buildClearBrokenSpouseReferencePatches(allRelatives: Relative[]): GraphRepairPatch[] {
  const patches: GraphRepairPatch[] = [];

  for (const issue of findBrokenSpouseLinks(allRelatives)) {
    if (issue.code !== 'broken_link' || issue.field !== 'spouseId' || !issue.relativeId) {
      continue;
    }

    patches.push({
      personId: issue.relativeId,
      patch: { spouseId: null },
      reason: 'Жарамсыз жұбай сілтемесін тазарту',
    });
  }

  return patches;
}

export function buildShezhireRepairPlan(allRelatives: Relative[]): ShezhireRepairPlan {
  const graph = buildGraph(allRelatives);

  return {
    clearBrokenParents: buildClearBrokenParentLinkPatches(allRelatives),
    syncSpouses: buildSpouseReciprocalPatches(graph),
    clearOrphanReferences: buildClearOrphanReferencePatches(allRelatives),
  };
}

export function runShezhireHealthCheck(allRelatives: Relative[]): ShezhireHealthCheckReport {
  const graph = buildGraph(allRelatives);
  const integrity = validateGraphIntegrity(graph);
  const repairPlan = buildShezhireRepairPlan(allRelatives);

  const brokenParentLinks = findBrokenParentLinks(allRelatives);
  const brokenSpouseLinks = findBrokenSpouseLinks(allRelatives);
  const circularRelations = findCircularParentChains(allRelatives);
  const invalidChildParentLinks = findInvalidChildParentLinks(allRelatives);
  const duplicatePeople = findDuplicatePeople(allRelatives);
  const orphanRelatives = findOrphanRelatives(allRelatives);

  const hasBlockingIssues =
    integrity.errorCount > 0 ||
    invalidChildParentLinks.length > 0 ||
    circularRelations.length > 0;

  const hasRepairableIssues =
    repairPlan.clearBrokenParents.length > 0 ||
    repairPlan.syncSpouses.length > 0 ||
    repairPlan.clearOrphanReferences.length > 0;

  return {
    brokenParentLinks,
    brokenSpouseLinks,
    duplicatePeople,
    circularRelations,
    invalidChildParentLinks,
    orphanRelatives,
    integrityIssues: integrity.issues,
    repairPlan,
    hasBlockingIssues,
    hasRepairableIssues,
  };
}

export function assessSafeDelete(
  relativeId: string,
  allRelatives: Relative[],
): SafeDeleteAssessment {
  const subject = allRelatives.find((relative) => relativeLinkIdsMatch(relative.id, relativeId));

  if (!subject) {
    return {
      relativeId,
      canDelete: false,
      blockMessage: 'Туыс табылмады',
      referencingRelatives: [],
      clearReferencePatches: [],
    };
  }

  const references = getRelativeReferences(relativeId, allRelatives);

  if (references.hasReferences) {
    return {
      relativeId,
      canDelete: false,
      blockMessage: GRAPH_INTEGRITY_COPY.deleteBlocked,
      referencingRelatives: references.referencingRelatives,
      clearReferencePatches: references.clearReferencePatches,
    };
  }

  return {
    relativeId,
    canDelete: true,
    referencingRelatives: [],
    clearReferencePatches: [],
  };
}

export function collectRepairPatches(
  plan: ShezhireRepairPlan,
  kinds: ShezhireRepairKind[],
): GraphRepairPatch[] {
  const patches: GraphRepairPatch[] = [];

  if (kinds.includes('clear_broken_parents')) {
    patches.push(...plan.clearBrokenParents);
  }

  if (kinds.includes('sync_spouses')) {
    patches.push(...plan.syncSpouses);
  }

  if (kinds.includes('clear_orphan_references')) {
    patches.push(...plan.clearOrphanReferences);
  }

  return dedupeRepairPatches(patches);
}

export function formatReferencingRelativeNames(referencers: Relative[]): string {
  return referencers.map((relative) => getRelativeDisplayName(relative)).join(', ');
}

function dedupeHealthItems(items: GraphIntegrityHealthItem[]): GraphIntegrityHealthItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.relativeId}:${item.code}:${item.field ?? ''}:${item.relatedId ?? ''}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function dedupeRepairPatches(patches: GraphRepairPatch[]): GraphRepairPatch[] {
  const merged = new Map<string, GraphRepairPatch>();

  for (const patch of patches) {
    const existing = merged.get(patch.personId);
    if (!existing) {
      merged.set(patch.personId, { ...patch, patch: { ...patch.patch } });
      continue;
    }

    merged.set(patch.personId, {
      ...existing,
      patch: { ...existing.patch, ...patch.patch },
      reason: patch.reason,
    });
  }

  return [...merged.values()];
}
