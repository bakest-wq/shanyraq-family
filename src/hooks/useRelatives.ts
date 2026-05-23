import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { useRelativesContext } from '@/providers/RelativesProvider';
import { relativesService } from '@/services/relatives.service';
import { CreateRelativeInput, ConnectParentsInput, Relative } from '@/types/relative';

export function useRelatives() {
  return useRelativesContext();
}

export function useRelative(relativeId: string) {
  const { relatives, loading, error, refetch } = useRelativesContext();

  const relative = useMemo(
    () => relatives.find((item) => item.id === relativeId) ?? null,
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
  const { refetch } = useRelativesContext();

  useFocusEffect(
    useCallback(() => {
      void refetch({ silent: true });
    }, [refetch]),
  );
}

export function useCreateRelative() {
  const { familyId } = useFamilyContext();
  const { refetch } = useRelativesContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRelative = useCallback(
    async (input: CreateRelativeInput): Promise<Relative | null> => {
      setSaving(true);
      setError(null);

      try {
        if (!familyId) {
          throw new Error('Сначала создайте или выберите семью.');
        }

        const created = await relativesService.create(input, familyId);
        await refetch();
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось сохранить родственника.';
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [familyId, refetch],
  );

  return {
    createRelative,
    saving,
    error,
  };
}

export function useUpdateRelative(relativeId: string) {
  const { familyId } = useFamilyContext();
  const { refetch } = useRelativesContext();
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

        const updated = await relativesService.update(relativeId, input, familyId);
        await refetch();
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось обновить родственника.';
        setError(message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [familyId, relativeId, refetch],
  );

  return {
    updateRelative,
    saving,
    error,
  };
}

export function useConnectParents(relativeId: string) {
  const { familyId } = useFamilyContext();
  const { refetch } = useRelativesContext();
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

        const updated = await relativesService.connectParents(relativeId, input, familyId);
        await refetch();
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось связать родственников.';
        setError(message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [familyId, relativeId, refetch],
  );

  return {
    connectParents,
    saving,
    error,
  };
}

export function useDeleteRelative() {
  const router = useRouter();
  const { familyId } = useFamilyContext();
  const { refetch } = useRelativesContext();
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

        await relativesService.delete(relativeId, familyId);
        await refetch();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось удалить родственника.';
        setError(message);
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [familyId, refetch],
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
    deleting,
    error,
  };
}
