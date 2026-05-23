import { Relative } from '@/types/relative';
import { findRelativeByLinkId, relativeLinkIdsMatch } from '@/utils/family-link-picker';

import type { AnalyzeSuggestionsContext, RelationshipSuggestion } from './types';

export function getById(relatives: Relative[], id?: string | null): Relative | null {
  return findRelativeByLinkId(relatives, id);
}

export function getEffectiveSpouse(relative: Relative, relatives: Relative[]): Relative | null {
  if (relative.spouseId) {
    const forward = getById(relatives, relative.spouseId);
    if (forward) {
      return forward;
    }
  }

  return (
    relatives.find((candidate) => relativeLinkIdsMatch(candidate.spouseId, relative.id)) ??
    null
  );
}

export function areSpousesLinked(a: Relative, b: Relative): boolean {
  return relativeLinkIdsMatch(a.spouseId, b.id) || relativeLinkIdsMatch(b.spouseId, a.id);
}

export function isFemale(relative: Relative): boolean {
  return relative.gender === 'female';
}

export function isMale(relative: Relative): boolean {
  return relative.gender === 'male';
}

export function suggestionPairKey(idA: string, idB: string): string {
  return [idA, idB].sort().join(':');
}

export function isHighConfidenceSuggestion(
  suggestion: RelationshipSuggestion,
  context?: AnalyzeSuggestionsContext,
): boolean {
  if (suggestion.kind === 'note_shared_parents') {
    return false;
  }

  if (suggestion.priority <= 2) {
    return true;
  }

  if (suggestion.kind === 'link_spouse_reciprocal') {
    return true;
  }

  if (suggestion.kind === 'link_child_to_parent' && context?.subjectId) {
    return suggestion.relatedIds.includes(context.subjectId);
  }

  return false;
}

export function filterVisibleSuggestions(
  suggestions: RelationshipSuggestion[],
  context?: AnalyzeSuggestionsContext,
  limit = 2,
): RelationshipSuggestion[] {
  return suggestions
    .filter((suggestion) => isHighConfidenceSuggestion(suggestion, context))
    .slice(0, limit);
}
