import { useCallback, useState } from 'react';

import { useArchiveContext } from '@/providers/ArchiveProvider';
import { CreateMemoryInput } from '@/types/archive';

export function useArchive() {
  return useArchiveContext();
}

export function useAddMemory() {
  const { addMemory } = useArchiveContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveMemory = useCallback(
    async (input: CreateMemoryInput) => {
      setSaving(true);
      setError(null);

      try {
        const created = await addMemory(input);
        if (!created) {
          setError('Не удалось сохранить историю.');
        }
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось сохранить историю.';
        setError(message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [addMemory],
  );

  return { saveMemory, saving, error };
}
