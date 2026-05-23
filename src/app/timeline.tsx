import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TimelineEventCard } from '@/components/timeline/TimelineEventCard';
import { YearSection } from '@/components/timeline/YearSection';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useTimeline } from '@/hooks/useTimeline';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function TimelineScreen() {
  const router = useRouter();
  const { sections, loading, error, isEmpty, refetch, events } = useTimeline();
  const [refreshing, setRefreshing] = useState(false);

  const autoCount = useMemo(
    () => events.filter((event) => event.source === 'auto').length,
    [events],
  );
  const manualCount = useMemo(
    () => events.filter((event) => event.source === 'manual').length,
    [events],
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch({ silent: true });
    setRefreshing(false);
  };

  return (
    <ScreenShell
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
      header={
        <>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Артқа</Text>
          </Pressable>
          <AppHeader
            title="Отбасы хронологиясы"
            subtitle="Семейная хронология · Tuystar оқиғалары"
            badge="🕰️"
          />
        </>
      }
      contentStyle={styles.content}>
      {!loading && !error && !isEmpty ? (
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{events.length}</Text>
            <Text style={styles.statLabel}>Оқиға · Событий</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{autoCount}</Text>
            <Text style={styles.statLabel}>Авто · Auto</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{manualCount}</Text>
            <Text style={styles.statLabel}>Қолмен · Manual</Text>
          </View>
        </View>
      ) : null}

      {loading ? (
        <LoadingState message="Хронология жүктелуде..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="🌿"
            title="Отбасы тарихы осында жиналады 🌿"
            subtitle="Туған күн, үйлену, естеліктер — барлық маңызды сәттер"
            actionLabel="Оқиға қосу"
            onAction={() => router.push('/add-timeline-event')}
          />
        </View>
      ) : (
        <View style={styles.timeline}>
          <SectionTitle
            title="Жылдар бойынша"
            subtitle="По годам · newest first"
          />
          {sections.map((section) => (
            <YearSection key={section.label} yearLabel={section.label}>
              {section.events.map((event) => (
                <TimelineEventCard key={event.id} event={event} />
              ))}
            </YearSection>
          ))}
        </View>
      )}

      <QuickActionButton
        icon="➕"
        label="Оқиға қосу"
        sublabel="Көшу, оқу, естелік · Manual event"
        variant="gold"
        onPress={() => router.push('/add-timeline-event')}
      />

      <PrimaryButton
        label="Жаңа естелік"
        sublabel="Add family milestone · Локально сақталады"
        variant="green"
        onPress={() => router.push('/add-timeline-event')}
      />
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
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statChip: {
    flex: 1,
    backgroundColor: Palette.white,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: Palette.creamDark,
  },
  statValue: {
    ...Typography.subtitle,
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  statLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  emptyWrap: {
    paddingVertical: Spacing.lg,
  },
  timeline: {
    gap: Spacing.xl,
  },
});
