import { useCallback, useEffect, useMemo, useState } from 'react';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { useRelatives } from '@/hooks/useRelatives';
import { useToast } from '@/hooks/useToast';
import {
  analyzeRelationshipSuggestions,
  applyRelationshipSuggestion,
  dismissSuggestionId,
  filterVisibleSuggestions,
  loadDismissedSuggestionIds,
} from '@/utils/relationship-suggestions';
import type { AnalyzeSuggestionsContext, RelationshipSuggestion } from '@/utils/relationship-suggestions/types';

type UseRelationshipSuggestionsOptions = AnalyzeSuggestionsContext & {
  limit?: number;
  enabled?: boolean;
  highConfidenceOnly?: boolean;
};

export function useRelationshipSuggestions(options: UseRelationshipSuggestionsOptions = {}) {
  const { familyId } = useFamilyContext();
  const { relatives, refetch } = useRelatives();
  const { showToast } = useToast();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loadingDismissed, setLoadingDismissed] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const {
    limit = 2,
    enabled = true,
    highConfidenceOnly = true,
    subjectId,
    draftFatherId,
    draftMotherId,
    draftSpouseId,
  } = options;

  const context = useMemo(
    () => ({
      subjectId,
      draftFatherId,
      draftMotherId,
      draftSpouseId,
    }),
    [draftFatherId, draftMotherId, draftSpouseId, subjectId],
  );

  useEffect(() => {
    if (!familyId) {
      setDismissedIds(new Set());
      setLoadingDismissed(false);
      return;
    }

    setLoadingDismissed(true);
    void loadDismissedSuggestionIds(familyId).then((ids) => {
      setDismissedIds(ids);
      setLoadingDismissed(false);
    });
  }, [familyId]);

  const suggestions = useMemo(() => {
    if (!enabled || loadingDismissed) {
      return [];
    }

    const analyzed = analyzeRelationshipSuggestions(relatives, context).filter(
      (suggestion) => !dismissedIds.has(suggestion.id),
    );

    if (highConfidenceOnly) {
      return filterVisibleSuggestions(analyzed, context, limit);
    }

    return analyzed
      .filter((suggestion) => suggestion.kind !== 'note_shared_parents')
      .slice(0, limit);
  }, [
    context,
    dismissedIds,
    enabled,
    highConfidenceOnly,
    limit,
    loadingDismissed,
    relatives,
  ]);

  const dismissSuggestion = useCallback(
    async (suggestion: RelationshipSuggestion) => {
      if (!familyId) {
        return;
      }

      await dismissSuggestionId(familyId, suggestion.id);
      setDismissedIds((current) => new Set([...current, suggestion.id]));
    },
    [familyId],
  );

  const acceptSuggestion = useCallback(
    async (suggestion: RelationshipSuggestion) => {
      if (!familyId || acceptingId) {
        return;
      }

      setAcceptingId(suggestion.id);

      try {
        if (suggestion.kind !== 'note_shared_parents') {
          await applyRelationshipSuggestion(suggestion, familyId);
          await refetch({ silent: true });
          showToast({
            type: 'success',
            title: 'Байланыс сақталды 🌿',
            message: suggestion.promptKz,
          });
        }

        await dismissSuggestionId(familyId, suggestion.id);
        setDismissedIds((current) => new Set([...current, suggestion.id]));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Байланысты сақтау сәтсіз аяқталды';
        showToast({
          type: 'error',
          title: 'Қате · Ошибка',
          message,
        });
      } finally {
        setAcceptingId(null);
      }
    },
    [acceptingId, familyId, refetch, showToast],
  );

  return {
    suggestions,
    acceptingId,
    dismissSuggestion,
    acceptSuggestion,
    loading: loadingDismissed,
  };
}
