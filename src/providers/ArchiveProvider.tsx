import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { archiveService } from '@/services/archive.service';
import { editHistoryService } from '@/services/edit-history.service';
import { CreateMemoryInput, FamilyMemory } from '@/types/archive';
import { resolveEditActor } from '@/utils/edit-actor';

type ArchiveContextValue = {
  memories: FamilyMemory[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  refetch: (options?: { silent?: boolean }) => Promise<void>;
  addMemory: (input: CreateMemoryInput) => Promise<FamilyMemory | null>;
  removeMemory: (memoryId: string) => Promise<boolean>;
};

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

export function ArchiveProvider({ children }: PropsWithChildren) {
  const { familyId, isReady: familyReady, session } = useFamilyContext();
  const [memories, setMemories] = useState<FamilyMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!familyReady) {
        return;
      }

      if (!familyId) {
        setMemories([]);
        setError(null);
        setLoading(false);
        return;
      }

      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await archiveService.getAll(familyId);
        setMemories(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось загрузить архив.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [familyId, familyReady],
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const addMemory = useCallback(
    async (input: CreateMemoryInput): Promise<FamilyMemory | null> => {
      if (!familyId) {
        return null;
      }

      try {
        const created = await archiveService.add(familyId, input);
        await editHistoryService.logMemoryCreate(
          familyId,
          resolveEditActor(session),
          created,
        );
        await refetch({ silent: true });
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось сохранить историю.';
        setError(message);
        return null;
      }
    },
    [familyId, refetch, session],
  );

  const removeMemory = useCallback(
    async (memoryId: string): Promise<boolean> => {
      if (!familyId) {
        return false;
      }

      try {
        const existing = await archiveService.getAll(familyId);
        const target = existing.find((memory) => memory.id === memoryId);

        await archiveService.remove(familyId, memoryId);

        if (target) {
          await editHistoryService.logMemoryDelete(
            familyId,
            resolveEditActor(session),
            target,
          );
        }

        await refetch({ silent: true });
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Естелікті жою мүмкін болмады.';
        setError(message);
        return false;
      }
    },
    [familyId, refetch, session],
  );

  const value = useMemo(
    () => ({
      memories,
      loading,
      error,
      isEmpty: !loading && !error && memories.length === 0,
      refetch,
      addMemory,
      removeMemory,
    }),
    [memories, loading, error, refetch, addMemory, removeMemory],
  );

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
}

export function useArchiveContext() {
  const context = useContext(ArchiveContext);

  if (!context) {
    throw new Error('useArchiveContext must be used within ArchiveProvider');
  }

  return context;
}
