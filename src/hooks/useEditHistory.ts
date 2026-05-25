import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { useFamilyPermissions } from '@/hooks/useFamilyPermissions';
import { editHistoryService } from '@/services/edit-history.service';
import type { EditEntityType, EditEvent } from '@/types/edit-history';
import { canRestoreEditEvent } from '@/utils/edit-history-restore';
import { resolveEditActor } from '@/utils/edit-actor';

type UseEditHistoryOptions = {
  entityId?: string;
  entityType?: EditEntityType;
  limit?: number;
};

export function useEditHistory(options: UseEditHistoryOptions = {}) {
  const { familyId, session } = useFamilyContext();
  const { canEdit } = useFamilyPermissions();
  const [events, setEvents] = useState<EditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!familyId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const list = await editHistoryService.list(familyId, {
        entityId: options.entityId,
        entityType: options.entityType,
        limit: options.limit,
      });
      setEvents(list);
    } finally {
      setLoading(false);
    }
  }, [familyId, options.entityId, options.entityType, options.limit]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const restoreEvent = useCallback(
    async (eventId: string) => {
      if (!familyId || !canEdit) {
        return null;
      }

      const actor = resolveEditActor(session);
      return editHistoryService.restoreEvent(familyId, eventId, actor);
    },
    [canEdit, familyId, session],
  );

  return {
    events,
    loading,
    refresh,
    restoreEvent,
    canRestore: canEdit,
    canRestoreEvent: canRestoreEditEvent,
  };
}

export function useLatestEdit(entityType: EditEntityType, entityId: string) {
  const { familyId } = useFamilyContext();
  const [latest, setLatest] = useState<EditEvent | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!familyId || !entityId) {
        setLatest(null);
        return;
      }

      void editHistoryService
        .getLatestForEntity(familyId, entityType, entityId)
        .then(setLatest);
    }, [entityId, entityType, familyId]),
  );

  return latest;
}
