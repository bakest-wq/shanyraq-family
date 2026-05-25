import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import { FAMILY_SPACE_COPY } from '@/constants/family-space-content';
import { useFamilyContext } from '@/providers/FamilyProvider';
import { useRelativesContext } from '@/providers/RelativesProvider';
import { editHistoryService } from '@/services/edit-history.service';
import { recordGraphVersionAfterMutation } from '@/hooks/useGraphVersions';
import { relativesService, RelationshipSafetyBlockedError } from '@/services/relatives.service';
import {
  assessSafeDelete,
  DeleteBlockedError,
} from '@/services/graph-integrity.service';
import { CreateRelativeInput, ConnectParentsInput, Relative } from '@/types/relative';
import { resolveEditActor } from '@/utils/edit-actor';
import { findRelativeByLinkId } from '@/utils/family-link-picker';
import { canEditFamilyData, canDeleteFamilyData } from '@/utils/family-permissions';
import { getRelationshipSaveErrorMessage } from '@/utils/relationship-safety-validation';

export function useRelatives() {
  const context = useRelativesContext();
  const getRelativeById = useCallback(
    (relativeId: string) => findRelativeByLinkId(context.relatives, relativeId),
    [context.relatives],
  );

  return {
    ...context,
    getRelativeById,
  };
}

export function useRelative(relativeId: string) {
  const { relatives, loading, error, refetch } = useRelativesContext();

  const relative = useMemo(
    () => findRelativeByLinkId(relatives, relativeId),
    [relatives, relativeId],
  );

  useFocusEffect(
    useCallback(() => {
      void refetch({ silent: true });
    }, [refetch]),
  );

  return { relative, loading, error, refetch };
}

/** Silently refresh relatives when a tab screen gains focus (e.g. after closing Add Relative). */
export function useRefreshRelativesOnFocus() {
  const { invalidateRelatives } = useRelativesContext();

  useFocusEffect(
    useCallback(() => {
      void invalidateRelatives({ silent: true });
    }, [invalidateRelatives]),
  );
}

export function useCreateRelative() {
  const { familyId, session } = useFamilyContext();
  const { invalidateRelatives, upsertRelative, relatives } = useRelativesContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRelative = useCallback(
    async (
      input: CreateRelativeInput,
      options?: { allowMemberSelfAdd?: boolean },
    ): Promise<Relative | null> => {
      setSaving(true);
      setError(null);

      try {
        if (!familyId) {
          throw new Error('Сначала создайте или выберите семью.');
        }

        if (!canEditFamilyData(session?.role) && !options?.allowMemberSelfAdd) {
          throw new Error(FAMILY_SPACE_COPY.suggestEditInstead);
        }

        const created = await relativesService.create(input, familyId);
        upsertRelative(created);
        const editEvent = await editHistoryService.logRelativeCreate(
          familyId,
          resolveEditActor(session),
          created,
        );
        await recordGraphVersionAfterMutation({
          familyId,
          actor: resolveEditActor(session),
          beforeRelatives: relatives,
          summary: 'Жаңа туыс қосылды',
          editEventId: editEvent.id,
        });
        await invalidateRelatives({ silent: true });
        return created;
      } catch (err) {
        const message = getRelationshipSaveErrorMessage(err);
        setError(message);
        if (err instanceof RelationshipSafetyBlockedError) {
          throw err;
        }
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [familyId, invalidateRelatives, relatives, session?.role, upsertRelative],
  );

  return {
    createRelative,
    saving,
    error,
  };
}

export function useUpdateRelative(relativeId: string) {
  const { familyId, session } = useFamilyContext();
  const { upsertRelative, invalidateRelatives, relatives } = useRelativesContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRelative = useCallback(
    async (input: CreateRelativeInput): Promise<Relative | null> => {
      setSaving(true);
      setError(null);

      try {
        if (!familyId) {
          throw new Error('Сначала создайте или выберите семью.');
        }

        if (!canEditFamilyData(session?.role)) {
          throw new Error(FAMILY_SPACE_COPY.suggestEditInstead);
        }

        const beforeRelative = await relativesService.getById(relativeId, familyId);
        const updated = await relativesService.update(relativeId, input, familyId);
        if (updated) {
          upsertRelative(updated);
        }

        if (beforeRelative && updated) {
          const editEvent = await editHistoryService.logRelativeUpdate(
            familyId,
            resolveEditActor(session),
            beforeRelative,
            updated,
          );
          await recordGraphVersionAfterMutation({
            familyId,
            actor: resolveEditActor(session),
            beforeRelatives: relatives,
            editEventId: editEvent.id,
          });
        }

        await invalidateRelatives({ silent: true });
        console.log('SAVE SUCCESS');
        console.log('KINSHIP RECALCULATED');
        return updated;
      } catch (err) {
        const message = getRelationshipSaveErrorMessage(err);
        setError(message);
        if (err instanceof RelationshipSafetyBlockedError) {
          throw err;
        }
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [familyId, invalidateRelatives, relativeId, relatives, session?.role, upsertRelative],
  );

  return {
    updateRelative,
    saving,
    error,
  };
}

export function useConnectParents(relativeId: string) {
  const { familyId, session } = useFamilyContext();
  const { invalidateRelatives, upsertRelative, relatives } = useRelativesContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectParents = useCallback(
    async (input: ConnectParentsInput): Promise<Relative | null> => {
      setSaving(true);
      setError(null);

      try {
        if (!familyId) {
          throw new Error('Сначала создайте или выберите семью.');
        }

        if (!canEditFamilyData(session?.role)) {
          throw new Error(FAMILY_SPACE_COPY.suggestEditInstead);
        }

        const beforeRelative = await relativesService.getById(relativeId, familyId);
        const updated = await relativesService.connectParents(relativeId, input, familyId);
        if (updated) {
          upsertRelative(updated);
        }

        if (beforeRelative && updated) {
          const editEvent = await editHistoryService.logRelativeUpdate(
            familyId,
            resolveEditActor(session),
            beforeRelative,
            updated,
          );
          await recordGraphVersionAfterMutation({
            familyId,
            actor: resolveEditActor(session),
            beforeRelatives: relatives,
            editEventId: editEvent.id,
          });
        }

        await invalidateRelatives({ silent: true });
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось связать родственников.';
        setError(message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [familyId, invalidateRelatives, relativeId, relatives, session?.role, upsertRelative],
  );

  return {
    connectParents,
    saving,
    error,
  };
}

export function useDeleteRelative() {
  const router = useRouter();
  const { familyId, session } = useFamilyContext();
  const { invalidateRelatives, relatives } = useRelativesContext();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRelative = useCallback(
    async (relativeId: string): Promise<boolean> => {
      setDeleting(true);
      setError(null);

      try {
        if (!familyId) {
          throw new Error('Сначала создайте или выберите семью.');
        }

        if (!canDeleteFamilyData(session?.role)) {
          throw new Error(FAMILY_SPACE_COPY.suggestDeleteInstead);
        }

        const beforeRelative = await relativesService.getById(relativeId, familyId);
        await relativesService.delete(relativeId, familyId);

        if (beforeRelative) {
          const editEvent = await editHistoryService.logRelativeDelete(
            familyId,
            resolveEditActor(session),
            beforeRelative,
          );
          await recordGraphVersionAfterMutation({
            familyId,
            actor: resolveEditActor(session),
            beforeRelatives: relatives,
            summary: 'Туыс жойылды',
            editEventId: editEvent.id,
          });
        }

        await invalidateRelatives({ silent: true });
        return true;
      } catch (err) {
        if (err instanceof DeleteBlockedError) {
          setError(err.message);
          return false;
        }

        const message = err instanceof Error ? err.message : 'Не удалось удалить родственника.';
        setError(message);
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [familyId, invalidateRelatives, relatives, session?.role],
  );

  const clearRelativeReferences = useCallback(
    async (relativeId: string): Promise<number> => {
      if (!familyId) {
        return 0;
      }

      if (!canEditFamilyData(session?.role)) {
        throw new Error(FAMILY_SPACE_COPY.suggestEditInstead);
      }

      const applied = await relativesService.clearRelativeReferences(relativeId, familyId);
      await invalidateRelatives({ silent: true });
      return applied;
    },
    [familyId, invalidateRelatives, session?.role],
  );

  const deleteRelativeAndLeave = useCallback(
    async (relativeId: string) => {
      const success = await deleteRelative(relativeId);
      if (success) {
        router.replace('/(tabs)/relatives');
      }
      return success;
    },
    [deleteRelative, router],
  );

  return {
    deleteRelative,
    deleteRelativeAndLeave,
    clearRelativeReferences,
    assessSafeDelete: (relativeId: string, familyRelatives: Relative[]) =>
      assessSafeDelete(relativeId, familyRelatives),
    deleting,
    error,
  };
}
