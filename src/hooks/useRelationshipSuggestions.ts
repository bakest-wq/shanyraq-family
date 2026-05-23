import { useCallback, useEffect, useMemo, useState } from 'react';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { useRelatives } from '@/hooks/useRelatives';
import { useToast } from '@/hooks/useToast';
import {
  analyzeRelationshipSuggestions,
  applyRelationshipSuggestion,
  dismissSuggestionId,
  loadDismissedSuggestionIds,
} from '@/utils/relationship-suggestions';
import type { AnalyzeSuggestionsContext, RelationshipSuggestion } from '@/utils/relationship-suggestions/types';

type UseRelationshipSuggestionsOptions = AnalyzeSuggestionsContext & {
  limit?: number;
  enabled?: boolean;
};

export function useRelationshipSuggestions(options: UseRelationshipSuggestionsOptions = {}) {
  const { familyId } = useFamilyContext();
  const { relatives, refetch } = useRelatives();
  const { showToast } = useToast();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loadingDismissed, setLoadingDismissed] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const {
    limit = 6,
    enabled = true,
    subjectId,
    draftFatherId,
    draftMotherId,
    draftSpouseId,
  } = options;

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

    return analyzeRelationshipSuggestions(relatives, {
      subjectId,
      draftFatherId,
      draftMotherId,
      draftSpouseId,
    })
      .filter((suggestion) => !dismissedIds.has(suggestion.id))
      .slice(0, limit);
  }, [
    dismissedIds,
    draftFatherId,
    draftMotherId,
    draftSpouseId,
    enabled,
    limit,
    loadingDismissed,
    relatives,
    subjectId,
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
            title: 'Байланыстар сақталды 🌿',
            message: 'Связь успешно добавлена в шежіре',
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
