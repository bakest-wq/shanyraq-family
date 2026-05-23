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
import { timelineService } from '@/services/timeline.service';
import { CreateTimelineEventInput, ManualTimelineEvent } from '@/types/timeline';

type TimelineContextValue = {
  manualEvents: ManualTimelineEvent[];
  loading: boolean;
  error: string | null;
  refetch: (options?: { silent?: boolean }) => Promise<void>;
  addEvent: (input: CreateTimelineEventInput) => Promise<ManualTimelineEvent | null>;
};

const TimelineContext = createContext<TimelineContextValue | null>(null);

export function TimelineProvider({ children }: PropsWithChildren) {
  const { familyId, isReady: familyReady } = useFamilyContext();
  const [manualEvents, setManualEvents] = useState<ManualTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!familyReady) {
        return;
      }

      if (!familyId) {
        setManualEvents([]);
        setError(null);
        setLoading(false);
        return;
      }

      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await timelineService.getAll(familyId);
        setManualEvents(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Хронология жүктелмedi.';
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

  const addEvent = useCallback(
    async (input: CreateTimelineEventInput): Promise<ManualTimelineEvent | null> => {
      if (!familyId) {
        return null;
      }

      try {
        const created = await timelineService.add(familyId, input);
        await refetch({ silent: true });
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Оқиға сақталмады.';
        setError(message);
        return null;
      }
    },
    [familyId, refetch],
  );

  const value = useMemo(
    () => ({
      manualEvents,
      loading,
      error,
      refetch,
      addEvent,
    }),
    [manualEvents, loading, error, refetch, addEvent],
  );

  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
}

export function useTimelineContext() {
  const context = useContext(TimelineContext);

  if (!context) {
    throw new Error('useTimelineContext must be used within TimelineProvider');
  }

  return context;
}
