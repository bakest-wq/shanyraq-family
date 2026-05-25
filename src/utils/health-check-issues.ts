import type { Relative } from '@/types/relative';
import { HEALTH_CHECK_COPY } from '@/constants/health-check-content';
import type { GraphIntegrityHealthItem, ShezhireHealthCheckReport } from '@/services/graph-integrity.service';
import { findRelativeById } from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';

export type HealthCheckIssueKind =
  | 'missing_parents'
  | 'broken_link'
  | 'duplicate'
  | 'spouse_mismatch'
  | 'circular_relation';

export type HealthCheckIssueAction =
  | { type: 'connect_parents'; relativeId: string }
  | { type: 'edit_relative'; relativeId: string }
  | { type: 'clear_broken_parent'; relativeId: string; field: 'fatherId' | 'motherId' }
  | { type: 'sync_spouse'; relativeId: string }
  | { type: 'review_duplicate'; relativeId: string };

export type HealthCheckIssue = {
  id: string;
  kind: HealthCheckIssueKind;
  personName: string;
  explanation: string;
  actionLabel: string;
  action: HealthCheckIssueAction;
};

export type HealthCheckIssueSections = {
  brokenLinks: HealthCheckIssue[];
  duplicateCandidates: HealthCheckIssue[];
  missingParents: HealthCheckIssue[];
  spouseMismatch: HealthCheckIssue[];
  circularRelations: HealthCheckIssue[];
};

function personName(relatives: Relative[], personId: string): string {
  const person = findRelativeById(relatives, personId);
  return person ? getRelativeDisplayName(person) : 'Туыс';
}

function issueKey(kind: HealthCheckIssueKind, id: string): string {
  return `${kind}:${id}`;
}

function brokenParentLinkIssue(
  item: GraphIntegrityHealthItem,
  relatives: Relative[],
): HealthCheckIssue | null {
  if (!item.relativeId || !item.field) {
    return null;
  }

  if (item.field !== 'fatherId' && item.field !== 'motherId') {
    return null;
  }

  return {
    id: issueKey('broken_link', `${item.relativeId}:${item.field}`),
    kind: 'broken_link',
    personName: personName(relatives, item.relativeId),
    explanation: HEALTH_CHECK_COPY.explain.parentNotFound,
    actionLabel: HEALTH_CHECK_COPY.actions.fixParentLink,
    action: {
      type: 'clear_broken_parent',
      relativeId: item.relativeId,
      field: item.field,
    },
  };
}

function missingParentsIssue(relative: Relative): HealthCheckIssue {
  return {
    id: issueKey('missing_parents', relative.id),
    kind: 'missing_parents',
    personName: getRelativeDisplayName(relative),
    explanation: HEALTH_CHECK_COPY.explain.parentsNotSet,
    actionLabel: HEALTH_CHECK_COPY.actions.addParents,
    action: { type: 'connect_parents', relativeId: relative.id },
  };
}

function editRelativeIssue(
  kind: HealthCheckIssueKind,
  item: GraphIntegrityHealthItem,
  relatives: Relative[],
  explanation: string,
): HealthCheckIssue | null {
  if (!item.relativeId) {
    return null;
  }

  return {
    id: issueKey(kind, `${item.relativeId}:${item.field ?? item.code}`),
    kind,
    personName: personName(relatives, item.relativeId),
    explanation,
    actionLabel: HEALTH_CHECK_COPY.actions.reviewLink,
    action: { type: 'edit_relative', relativeId: item.relativeId },
  };
}

function brokenSpouseLinkIssue(
  item: GraphIntegrityHealthItem,
  relatives: Relative[],
): HealthCheckIssue | null {
  if (!item.relativeId) {
    return null;
  }

  return {
    id: issueKey('broken_link', `${item.relativeId}:spouse`),
    kind: 'broken_link',
    personName: personName(relatives, item.relativeId),
    explanation: HEALTH_CHECK_COPY.explain.spouseNotFound,
    actionLabel: HEALTH_CHECK_COPY.actions.fixSpouse,
    action: { type: 'edit_relative', relativeId: item.relativeId },
  };
}

function spouseMismatchIssue(
  item: GraphIntegrityHealthItem,
  relatives: Relative[],
  canSync: boolean,
): HealthCheckIssue | null {
  if (!item.relativeId) {
    return null;
  }

  return {
    id: issueKey('spouse_mismatch', item.relativeId),
    kind: 'spouse_mismatch',
    personName: personName(relatives, item.relativeId),
    explanation: HEALTH_CHECK_COPY.explain.spouseMismatch,
    actionLabel: canSync
      ? HEALTH_CHECK_COPY.actions.syncSpouse
      : HEALTH_CHECK_COPY.actions.fixSpouse,
    action: canSync
      ? { type: 'sync_spouse', relativeId: item.relativeId }
      : { type: 'edit_relative', relativeId: item.relativeId },
  };
}

function duplicateIssue(
  leftId: string,
  rightId: string,
  relatives: Relative[],
): HealthCheckIssue {
  const left = personName(relatives, leftId);
  const right = personName(relatives, rightId);

  return {
    id: issueKey('duplicate', `${leftId}:${rightId}`),
    kind: 'duplicate',
    personName: `${left} · ${right}`,
    explanation: HEALTH_CHECK_COPY.explain.duplicateProfile,
    actionLabel: HEALTH_CHECK_COPY.actions.reviewDuplicate,
    action: { type: 'review_duplicate', relativeId: leftId },
  };
}

function explainBrokenLink(code: string): string {
  switch (code) {
    case 'self_link':
      return HEALTH_CHECK_COPY.explain.selfLink;
    case 'parent_spouse_conflict':
      return HEALTH_CHECK_COPY.explain.parentSpouseConflict;
    case 'same_parent_pair':
      return HEALTH_CHECK_COPY.explain.sameParents;
    case 'invalid_child_parent':
      return HEALTH_CHECK_COPY.explain.invalidSiblingParent;
    default:
      return HEALTH_CHECK_COPY.explain.parentLinkNeedsReview;
  }
}

export function buildHealthCheckIssueSections(
  report: ShezhireHealthCheckReport,
  relatives: Relative[],
  unplacedRelatives: Relative[],
): HealthCheckIssueSections {
  const brokenLinks: HealthCheckIssue[] = [];
  const duplicateCandidates: HealthCheckIssue[] = [];
  const missingParents: HealthCheckIssue[] = [];
  const spouseMismatch: HealthCheckIssue[] = [];
  const circularRelations: HealthCheckIssue[] = [];
  const seen = new Set<string>();
  const missingParentPersonIds = new Set<string>();

  const spouseSyncIds = new Set(
    report.repairPlan.syncSpouses.map((patch) => patch.personId),
  );

  const push = (issue: HealthCheckIssue) => {
    if (seen.has(issue.id)) {
      return;
    }

    seen.add(issue.id);

    switch (issue.kind) {
      case 'missing_parents':
        missingParents.push(issue);
        missingParentPersonIds.add(issue.action.relativeId);
        break;
      case 'broken_link':
        brokenLinks.push(issue);
        break;
      case 'duplicate':
        duplicateCandidates.push(issue);
        break;
      case 'spouse_mismatch':
        spouseMismatch.push(issue);
        break;
      case 'circular_relation':
        circularRelations.push(issue);
        break;
    }
  };

  for (const item of report.brokenParentLinks) {
    const issue = brokenParentLinkIssue(item, relatives);
    if (issue) {
      push(issue);
    }
  }

  for (const relative of unplacedRelatives) {
    if (!relative.fatherId && !relative.motherId) {
      push(missingParentsIssue(relative));
    }
  }

  for (const item of report.invalidChildParentLinks) {
    const issue = editRelativeIssue(
      'broken_link',
      item,
      relatives,
      explainBrokenLink(item.code),
    );
    if (issue) {
      push(issue);
    }
  }

  for (const item of report.circularRelations) {
    const issue = editRelativeIssue(
      'circular_relation',
      item,
      relatives,
      HEALTH_CHECK_COPY.explain.circularRelation,
    );
    if (issue) {
      push(issue);
    }
  }

  for (const item of report.integrityIssues) {
    if (item.code === 'ancestor_cycle') {
      continue;
    }

    if (
      item.code !== 'self_link' &&
      item.code !== 'parent_spouse_conflict' &&
      item.code !== 'same_parent_pair'
    ) {
      continue;
    }

    const issue = editRelativeIssue(
      'broken_link',
      {
        code: item.code,
        severity: item.severity,
        relativeId: item.relativeId,
        relatedId: item.relatedId,
        field: item.field,
        message: item.message,
      },
      relatives,
      explainBrokenLink(item.code),
    );

    if (issue) {
      push(issue);
    }
  }

  for (const item of report.brokenSpouseLinks) {
    if (item.code === 'spouse_mismatch') {
      const canSync = Boolean(item.relativeId && spouseSyncIds.has(item.relativeId));
      const issue = spouseMismatchIssue(item, relatives, canSync);
      if (issue) {
        push(issue);
      }
      continue;
    }

    const issue = brokenSpouseLinkIssue(item, relatives);
    if (issue) {
      push(issue);
    }
  }

  for (const pair of report.duplicatePeople) {
    push(duplicateIssue(pair.leftId, pair.rightId, relatives));
  }

  return {
    brokenLinks,
    duplicateCandidates,
    missingParents,
    spouseMismatch,
    circularRelations,
  };
}

export function countHealthCheckIssues(sections: HealthCheckIssueSections): number {
  return (
    sections.brokenLinks.length +
    sections.duplicateCandidates.length +
    sections.missingParents.length +
    sections.spouseMismatch.length +
    sections.circularRelations.length
  );
}

export function countRepairableIssues(report: ShezhireHealthCheckReport): number {
  const plan = report.repairPlan;
  return (
    plan.clearBrokenParents.length +
    plan.syncSpouses.length +
    plan.clearOrphanReferences.length
  );
}
