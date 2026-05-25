import type { Relative } from '@/types/relative';
import { brokenLinkMessage, kk, FAMILY_LANGUAGE } from '@/content/family-language';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import type { FamilyGraph } from '@/utils/family-graph/graph';
import { linksFromRelative, normalizeFamilyLinkSnapshot } from '@/utils/family-graph/normalize';
import type {
  FamilyLinkField,
  FamilyLinkSnapshot,
  GraphIntegrityIssue,
  GraphIntegrityReport,
} from '@/utils/family-graph/types';

const MSG = {
  selfLink: kk(FAMILY_LANGUAGE.health.selfLink),
  ancestorCycle: kk(FAMILY_LANGUAGE.health.ancestorCycle),
  brokenLink: kk(FAMILY_LANGUAGE.health.brokenLinkGeneric),
  spouseMismatch: kk(FAMILY_LANGUAGE.health.spouseMismatch),
  sameParents: kk(FAMILY_LANGUAGE.health.sameParents),
  parentSpouseConflict: kk(FAMILY_LANGUAGE.health.parentSpouseConflict),
  genderFather: kk(FAMILY_LANGUAGE.health.genderFather),
  genderMother: kk(FAMILY_LANGUAGE.health.genderMother),
} as const;

function pushIssue(
  issues: GraphIntegrityIssue[],
  issue: GraphIntegrityIssue,
): void {
  issues.push(issue);
}

function inspectSelfLinks(relative: Relative, issues: GraphIntegrityIssue[]): void {
  const links = linksFromRelative(relative);

  if (links.fatherId && relativeLinkIdsMatch(links.fatherId, relative.id)) {
    pushIssue(issues, {
      code: 'self_link',
      severity: 'error',
      relativeId: relative.id,
      field: 'fatherId',
      relatedId: relative.id,
      message: MSG.selfLink,
    });
  }

  if (links.motherId && relativeLinkIdsMatch(links.motherId, relative.id)) {
    pushIssue(issues, {
      code: 'self_link',
      severity: 'error',
      relativeId: relative.id,
      field: 'motherId',
      relatedId: relative.id,
      message: MSG.selfLink,
    });
  }

  if (links.spouseId && relativeLinkIdsMatch(links.spouseId, relative.id)) {
    pushIssue(issues, {
      code: 'self_link',
      severity: 'error',
      relativeId: relative.id,
      field: 'spouseId',
      relatedId: relative.id,
      message: MSG.selfLink,
    });
  }
}

function inspectBrokenLinks(graph: FamilyGraph, relative: Relative, issues: GraphIntegrityIssue[]): void {
  const fields: Array<[FamilyLinkField, string | null | undefined]> = [
    ['fatherId', relative.fatherId],
    ['motherId', relative.motherId],
    ['spouseId', relative.spouseId],
  ];

  for (const [field, linkId] of fields) {
    if (!linkId) {
      continue;
    }

    if (!graph.getById(linkId)) {
      pushIssue(issues, {
        code: 'broken_link',
        severity: 'error',
        relativeId: relative.id,
        field,
        relatedId: linkId,
        message: brokenLinkMessage(field),
      });
    }
  }
}

function inspectParentPair(relative: Relative, issues: GraphIntegrityIssue[]): void {
  const links = linksFromRelative(relative);

  if (
    links.fatherId &&
    links.motherId &&
    relativeLinkIdsMatch(links.fatherId, links.motherId)
  ) {
    pushIssue(issues, {
      code: 'same_parent_pair',
      severity: 'error',
      relativeId: relative.id,
      field: 'motherId',
      relatedId: links.fatherId,
      message: MSG.sameParents,
    });
  }
}

function inspectParentSpouseConflict(relative: Relative, issues: GraphIntegrityIssue[]): void {
  const links = linksFromRelative(relative);

  if (links.spouseId) {
    if (
      relativeLinkIdsMatch(links.spouseId, links.fatherId) ||
      relativeLinkIdsMatch(links.spouseId, links.motherId)
    ) {
      pushIssue(issues, {
        code: 'parent_spouse_conflict',
        severity: 'error',
        relativeId: relative.id,
        field: 'spouseId',
        relatedId: links.spouseId,
        message: MSG.parentSpouseConflict,
      });
    }
  }
}

function inspectAncestorCycles(graph: FamilyGraph, relative: Relative, issues: GraphIntegrityIssue[]): void {
  if (!graph.hasAncestorCycle(relative.id)) {
    return;
  }

  pushIssue(issues, {
    code: 'ancestor_cycle',
    severity: 'error',
    relativeId: relative.id,
    message: MSG.ancestorCycle,
  });
}

function inspectSpouseReciprocity(graph: FamilyGraph, relative: Relative, issues: GraphIntegrityIssue[]): void {
  if (!relative.spouseId) {
    return;
  }

  const spouse = graph.getById(relative.spouseId);
  if (!spouse) {
    return;
  }

  if (!relativeLinkIdsMatch(spouse.spouseId, relative.id)) {
    pushIssue(issues, {
      code: 'spouse_mismatch',
      severity: 'warning',
      relativeId: relative.id,
      field: 'spouseId',
      relatedId: spouse.id,
      message: MSG.spouseMismatch,
    });
  }
}

function inspectGenderParentHints(graph: FamilyGraph, relative: Relative, issues: GraphIntegrityIssue[]): void {
  const father = graph.getFather(relative);
  const mother = graph.getMother(relative);

  if (father?.gender === 'female') {
    pushIssue(issues, {
      code: 'gender_parent_mismatch',
      severity: 'warning',
      relativeId: relative.id,
      field: 'fatherId',
      relatedId: father.id,
      message: MSG.genderFather,
    });
  }

  if (mother?.gender === 'male') {
    pushIssue(issues, {
      code: 'gender_parent_mismatch',
      severity: 'warning',
      relativeId: relative.id,
      field: 'motherId',
      relatedId: mother.id,
      message: MSG.genderMother,
    });
  }
}

export function validateGraphIntegrity(graph: FamilyGraph): GraphIntegrityReport {
  const issues: GraphIntegrityIssue[] = [];

  for (const relative of graph.relatives) {
    inspectSelfLinks(relative, issues);
    inspectBrokenLinks(graph, relative, issues);
    inspectParentPair(relative, issues);
    inspectParentSpouseConflict(relative, issues);
    inspectAncestorCycles(graph, relative, issues);
    inspectSpouseReciprocity(graph, relative, issues);
    inspectGenderParentHints(graph, relative, issues);
  }

  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length;

  return {
    issues,
    isValid: errorCount === 0,
    errorCount,
    warningCount,
  };
}

export function validateProposedLinks(
  graph: FamilyGraph,
  relativeId: string,
  proposed: FamilyLinkSnapshot,
): GraphIntegrityIssue[] {
  const subject = graph.getById(relativeId);
  if (!subject) {
    return [
      {
        code: 'broken_link',
        severity: 'error',
        relativeId,
        message: MSG.brokenLink,
      },
    ];
  }

  const patched = graph.withPatchedLinks(relativeId, proposed);
  const report = validateGraphIntegrity(patched);

  return report.issues.filter((issue) => relativeLinkIdsMatch(issue.relativeId, relativeId));
}

export function wouldPatchCreateCycle(
  graph: FamilyGraph,
  relativeId: string,
  proposed: FamilyLinkSnapshot,
): boolean {
  const normalized = normalizeFamilyLinkSnapshot(proposed);

  for (const parentId of [normalized.fatherId, normalized.motherId]) {
    if (!parentId) {
      continue;
    }

    if (graph.wouldCreateAncestorCycle(relativeId, parentId)) {
      return true;
    }
  }

  return false;
}

export function hasBlockingIntegrityErrors(report: GraphIntegrityReport): boolean {
  return report.errorCount > 0;
}

export function getIntegrityIssuesForRelative(
  report: GraphIntegrityReport,
  relativeId: string,
): GraphIntegrityIssue[] {
  return report.issues.filter((issue) => relativeLinkIdsMatch(issue.relativeId, relativeId));
}
