import type { Relative } from '@/types/relative';
import { kk, FAMILY_LANGUAGE } from '@/content/family-language';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getEffectiveSpouse } from '@/utils/relationship-engine';
import { isReferencedAsParent } from '@/utils/shezhire-parent-lookup';
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
  const linkedAsParent = isReferencedAsParent(relative, relatives);

  if (!hasParents && !linkedAsParent) {
    reasons.push(kk(FAMILY_LANGUAGE.unlinked.parentMissing));
    actions.push({
      id: 'link_parents',
      label: kk(FAMILY_LANGUAGE.unlinked.actionLinkParents),
    });
  }

  if (shouldSuggestSpouseLink(relative, relatives)) {
    reasons.push(kk(FAMILY_LANGUAGE.unlinked.spouseMissing));
    actions.push({
      id: 'link_spouse',
      label: kk(FAMILY_LANGUAGE.unlinked.actionLinkSpouse),
    });
  }

  if (reasons.length === 0) {
    reasons.push(kk(FAMILY_LANGUAGE.unlinked.placeUnknown));
  }

  actions.push({
    id: 'focus_tree',
    label: kk(FAMILY_LANGUAGE.unlinked.actionFocusTree),
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
