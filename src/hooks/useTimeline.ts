import { useCallback, useMemo } from 'react';

import { useRelatives } from '@/hooks/useRelatives';
import { groupTimelineEventsByYear, mergeTimelineEvents } from '@/utils/timeline-events';

export function useTimeline() {
  const { relatives, loading, error, refetch } = useRelatives();

  const events = useMemo(() => mergeTimelineEvents(relatives), [relatives]);
  const sections = useMemo(() => groupTimelineEventsByYear(events), [events]);

  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      await refetch(options);
    },
    [refetch],
  );

  return {
    events,
    sections,
    loading,
    error,
    isEmpty: !loading && events.length === 0,
    refetch: refresh,
  };
}
