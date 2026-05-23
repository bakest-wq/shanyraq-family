export {
  analyzeRelationshipSuggestions,
  getRelativeRelationshipBadges,
} from '@/utils/relationship-suggestions/analyze';
export { applyRelationshipSuggestion } from '@/utils/relationship-suggestions/apply';
export {
  clearDismissedSuggestions,
  dismissSuggestionId,
  loadDismissedSuggestionIds,
} from '@/utils/relationship-suggestions/dismissed-storage';
export type {
  AnalyzeSuggestionsContext,
  RelationshipBadge,
  RelationshipSuggestion,
  RelationshipSuggestionAction,
  SuggestionKind,
} from '@/utils/relationship-suggestions/types';
