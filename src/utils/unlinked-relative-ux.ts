import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getEffectiveSpouse } from '@/utils/relationship-engine';
import {
  isParentRelationship,
  isSpouseRelationship,
} from '@/utils/relationship-presets';

export type UnlinkedRelativeActionId = 'link_spouse' | 'link_parents' | 'focus_tree';

export type UnlinkedRelativeAction = {
  id: UnlinkedRelativeActionId;
  label: string;
};

export type UnlinkedRelativeInsight = {
  reasons: string[];
  actions: UnlinkedRelativeAction[];
};

function isParentOfSomeone(relative: Relative, relatives: Relative[]): boolean {
  return relatives.some(
    (candidate) =>
      relativeLinkIdsMatch(candidate.fatherId, relative.id) ||
      relativeLinkIdsMatch(candidate.motherId, relative.id),
  );
}

function shouldSuggestSpouseLink(relative: Relative, relatives: Relative[]): boolean {
  if (getEffectiveSpouse(relative, relatives)) {
    return false;
  }

  return (
    isParentOfSomeone(relative, relatives) ||
    isSpouseRelationship(relative.relationship) ||
    isParentRelationship(relative.relationship)
  );
}

export function analyzeUnlinkedRelative(
  relative: Relative,
  relatives: Relative[],
): UnlinkedRelativeInsight {
  const reasons: string[] = [];
  const actions: UnlinkedRelativeAction[] = [];

  const hasParents = Boolean(relative.fatherId || relative.motherId);
  const hasSpouse = Boolean(getEffectiveSpouse(relative, relatives));

  if (!hasParents) {
    reasons.push('Ата-анасы байланыстырылмаған');
    actions.push({
      id: 'link_parents',
      label: 'Ата-анасын таңдау',
    });
  }

  if (shouldSuggestSpouseLink(relative, relatives)) {
    reasons.push('Жұбайы көрсетілмеген');
    actions.push({
      id: 'link_spouse',
      label: 'Жұбайын байланыстыру',
    });
  }

  if (reasons.length === 0) {
    reasons.push('Шежіредегі орны анықталмаған');
  }

  actions.push({
    id: 'focus_tree',
    label: 'Шежіреге қосу',
  });

  const seen = new Set<UnlinkedRelativeActionId>();

  return {
    reasons,
    actions: actions.filter((action) => {
      if (seen.has(action.id)) {
        return false;
      }

      seen.add(action.id);
      return true;
    }),
  };
}

export function formatUnlinkedRelativeReasons(reasons: string[]): string {
  return reasons.join(' · ');
}
