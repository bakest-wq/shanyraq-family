import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import type { FamilyGraph } from '@/utils/family-graph/graph';
import type { SafeDeletePlan } from '@/utils/family-graph/types';

export function planSafeDelete(graph: FamilyGraph, relativeId: string): SafeDeletePlan {
  const relative = graph.getById(relativeId);

  if (!relative) {
    return {
      relativeId,
      canDelete: false,
      blockingIssues: [
        {
          code: 'broken_link',
          severity: 'error',
          relativeId,
          message: 'Туыс табылмады',
        },
      ],
      impact: {
        childrenLosingParentLink: [],
        spouseToClear: null,
        descendantCount: 0,
      },
      preDeletePatches: [],
    };
  }

  const childrenLosingParentLink = graph.getChildren(relative);
  const spouse = graph.getEffectiveSpouse(relative);
  const preDeletePatches: SafeDeletePlan['preDeletePatches'] = [];

  if (spouse && relativeLinkIdsMatch(spouse.spouseId, relative.id)) {
    preDeletePatches.push({
      personId: spouse.id,
      patch: { spouseId: null },
    });
  }

  return {
    relativeId,
    canDelete: true,
    blockingIssues: [],
    impact: {
      childrenLosingParentLink,
      spouseToClear: spouse,
      descendantCount: graph.getDescendantIds(relative.id).size,
    },
    preDeletePatches,
  };
}

export function summarizeDeleteImpact(plan: SafeDeletePlan): string {
  const parts: string[] = [];

  if (plan.impact.spouseToClear) {
    parts.push('жұбай байланысы жойылады');
  }

  if (plan.impact.childrenLosingParentLink.length > 0) {
    parts.push('балалардың ата-ана байланысы босатылады');
  }

  if (plan.impact.descendantCount > 0) {
    parts.push(`${plan.impact.descendantCount} ұрпақ шежіреде қалады`);
  }

  if (parts.length === 0) {
    return 'Бұл туыс шежіреге әсер етпей жойылады';
  }

  return `Жойғанда: ${parts.join(', ')}`;
}

export function collectRelativesAffectedByDelete(
  graph: FamilyGraph,
  relativeId: string,
): Relative[] {
  const plan = planSafeDelete(graph, relativeId);
  const affected = new Map<string, Relative>();

  for (const child of plan.impact.childrenLosingParentLink) {
    affected.set(child.id, child);
  }

  if (plan.impact.spouseToClear) {
    affected.set(plan.impact.spouseToClear.id, plan.impact.spouseToClear);
  }

  const subject = graph.getById(relativeId);
  if (subject) {
    affected.set(subject.id, subject);
  }

  return [...affected.values()];
}
