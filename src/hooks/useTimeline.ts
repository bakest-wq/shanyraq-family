import { useCallback, useMemo, useState } from 'react';

import { useTimelineContext } from '@/providers/TimelineProvider';
import { useRelatives } from '@/hooks/useRelatives';
import { CreateTimelineEventInput } from '@/types/timeline';
import { groupTimelineEventsByYear, mergeTimelineEvents } from '@/utils/timeline-events';

export function useTimeline() {
  const { relatives, refetch: refetchRelatives } = useRelatives();
  const { manualEvents, loading, error, refetch: refetchManual } = useTimelineContext();

  const events = useMemo(
    () => mergeTimelineEvents(relatives, manualEvents),
    [manualEvents, relatives],
  );

  const sections = useMemo(() => groupTimelineEventsByYear(events), [events]);

  const refetch = useCallback(
    async (options?: { silent?: boolean }) => {
      await Promise.all([refetchManual(options), refetchRelatives(options)]);
    },
    [refetchManual, refetchRelatives],
  );

  return {
    events,
    sections,
    manualEvents,
    loading,
    error,
    isEmpty: !loading && events.length === 0,
    refetch,
  };
}

export function useAddTimelineEvent() {
  const { addEvent } = useTimelineContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveEvent = useCallback(
    async (input: CreateTimelineEventInput) => {
      setSaving(true);
      setError(null);

      try {
        const created = await addEvent(input);
        if (!created) {
          setError('Оқиға сақталмады.');
        }
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Оқиға сақталмады.';
        setError(message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [addEvent],
  );

  return { saveEvent, saving, error };
}
