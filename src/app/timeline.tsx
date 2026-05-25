import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TimelineEventCard } from '@/components/timeline/TimelineEventCard';
import { YearSection } from '@/components/timeline/YearSection';
import { AppHeader } from '@/components/ui/AppHeader';
import { PresetEmptyState, ErrorState } from '@/components/ui/EmptyState';
import { EMPTY_STATE_PRESETS } from '@/constants/family-ux-content';
import { TIMELINE_COPY } from '@/constants/timeline-content';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useTimeline } from '@/hooks/useTimeline';
import { useKinshipAnchor } from '@/hooks/useKinshipAnchor';
import { useRelatives } from '@/hooks/useRelatives';
import { useSafeGoBack } from '@/hooks/useSafeGoBack';
import { APP_ROUTES } from '@/utils/safe-navigation';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function TimelineScreen() {
  const router = useRouter();
  const goBack = useSafeGoBack(APP_ROUTES.management);
  const { sections, loading, error, isEmpty, refetch, events } = useTimeline();
  const { relatives } = useRelatives();
  const anchorPerson = useKinshipAnchor();
  const [refreshing, setRefreshing] = useState(false);

  const momentsLabel = useMemo(() => {
    if (events.length === 0) {
      return null;
    }

    return `${events.length} ${TIMELINE_COPY.momentsLabel}`;
  }, [events.length]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch({ silent: true });
    setRefreshing(false);
  };

  const openRelativeProfile = (relativeId: string) => {
    router.push({
      pathname: '/relative/[id]',
      params: { id: relativeId },
    });
  };

  return (
    <ScreenShell
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
      header={
        <>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backText}>← Артқа</Text>
          </Pressable>
          <AppHeader
            title={TIMELINE_COPY.screenTitle}
            subtitle={TIMELINE_COPY.screenSubtitle}
            badge={momentsLabel ?? '📜'}
          />
        </>
      }
      contentStyle={styles.content}>
      {loading ? (
        <LoadingState message={TIMELINE_COPY.loading} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <PresetEmptyState
            preset={EMPTY_STATE_PRESETS.timeline}
            onAction={() => router.push('/add-relative')}
          />
          <PrimaryButton
            label={TIMELINE_COPY.emptyAction}
            variant="green"
            onPress={() => router.push('/add-relative')}
          />
        </View>
      ) : (
        <View style={styles.timeline}>
          <SectionTitle
            title={TIMELINE_COPY.sectionTitle}
            subtitle={TIMELINE_COPY.sectionSubtitle}
          />
          {sections.map((section) => (
            <YearSection key={section.label} yearLabel={section.label}>
              {section.events.map((event) => (
                <TimelineEventCard
                  key={event.id}
                  event={event}
                  anchorPerson={anchorPerson}
                  relatives={relatives}
                  onPress={openRelativeProfile}
                />
              ))}
            </YearSection>
          ))}
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  backText: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  emptyWrap: {
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  timeline: {
    gap: Spacing.xl,
  },
});
