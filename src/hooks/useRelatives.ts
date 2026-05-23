import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import { FAMILY_SPACE_COPY } from '@/constants/family-space-content';
import { useFamilyContext } from '@/providers/FamilyProvider';
import { useRelativesContext } from '@/providers/RelativesProvider';
import { relativesService } from '@/services/relatives.service';
import {
  assessSafeDelete,
  DeleteBlockedError,
} from '@/services/graph-integrity.service';
import { CreateRelativeInput, ConnectParentsInput, Relative } from '@/types/relative';
import { findRelativeByLinkId } from '@/utils/family-link-picker';
import { canEditFamilyData, canDeleteFamilyData } from '@/utils/family-permissions';

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
  const { invalidateRelatives, upsertRelative } = useRelativesContext();
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
        await invalidateRelatives({ silent: true });
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось сохранить родственника.';
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [familyId, invalidateRelatives, session?.role, upsertRelative],
  );

  return {
    createRelative,
    saving,
    error,
  };
}

export function useUpdateRelative(relativeId: string) {
  const { familyId, session } = useFamilyContext();
  const { upsertRelative, invalidateRelatives } = useRelativesContext();
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

        const updated = await relativesService.update(relativeId, input, familyId);
        if (updated) {
          upsertRelative(updated);
        }
        await invalidateRelatives({ silent: true });
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось обновить родственника.';
        setError(message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [familyId, invalidateRelatives, relativeId, session?.role, upsertRelative],
  );

  return {
    updateRelative,
    saving,
    error,
  };
}

export function useConnectParents(relativeId: string) {
  const { familyId, session } = useFamilyContext();
  const { invalidateRelatives, upsertRelative } = useRelativesContext();
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

        const updated = await relativesService.connectParents(relativeId, input, familyId);
        if (updated) {
          upsertRelative(updated);
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
    [familyId, invalidateRelatives, relativeId, session?.role, upsertRelative],
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
  const { invalidateRelatives } = useRelativesContext();
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

        await relativesService.delete(relativeId, familyId);
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
    [familyId, invalidateRelatives, session?.role],
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
        router.replace('/relatives');
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
