import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { BirthdayCalendarCard } from '@/components/calendar/BirthdayCalendarCard';
import { BirthdaySection } from '@/components/calendar/BirthdaySection';
import { AppHeader } from '@/components/ui/AppHeader';
import { PresetEmptyState } from '@/components/ui/EmptyState';
import { EMPTY_STATE_PRESETS } from '@/constants/family-ux-content';
import { ErrorState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { MonthSection } from '@/components/ui/MonthSection';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { BIRTHDAY_SECTIONS, BIRTHDAY_UX } from '@/constants/birthday-content';
import { useRelatives } from '@/hooks/useRelatives';
import { buildBirthdaySections, hasBirthdayData } from '@/utils/birthday-calendar';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function CalendarScreen() {
  const router = useRouter();
  const { relatives, loading, error, refetch } = useRelatives();
  const [refreshing, setRefreshing] = useState(false);
  const [includeDeceased, setIncludeDeceased] = useState(false);
  const [allExpanded, setAllExpanded] = useState(false);

  const sections = useMemo(
    () =>
      buildBirthdaySections(relatives, {
        includeDeceased,
      }),
    [relatives, includeDeceased],
  );

  const hasBirthdays = hasBirthdayData(relatives, includeDeceased);
  const hasUpcomingFocus =
    sections.today.length > 0 || sections.upcoming.length > 0 || sections.thisMonth.length > 0;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch({ silent: true });
    setRefreshing(false);
  }, [refetch]);

  return (
    <ScreenShell
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
      header={
        <AppHeader
          title="Туған күндер"
          subtitle="Жақын мерекелер · отбасы"
          badge={String(new Date().getFullYear())}
        />
      }
      contentStyle={styles.content}>
      {loading ? (
        <LoadingState message="Күнтізбе жүктелуде..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : !hasBirthdays ? (
        <View style={styles.emptyWrap}>
          <PresetEmptyState
            preset={EMPTY_STATE_PRESETS.birthdays}
            onAction={() => router.push('/add-relative')}
          />
        </View>
      ) : (
        <>
          <View style={styles.toolbar}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <Text style={styles.toggleLabel}>{BIRTHDAY_UX.showDeceased}</Text>
                <Text style={styles.toggleHint}>{BIRTHDAY_UX.showDeceasedHint}</Text>
              </View>
              <Switch
                value={includeDeceased}
                onValueChange={setIncludeDeceased}
                trackColor={{ false: Palette.creamDark, true: Palette.greenSoft }}
                thumbColor={includeDeceased ? Palette.greenDeep : Palette.white}
              />
            </View>

            <PrimaryButton
              label={BIRTHDAY_UX.remindersLink}
              sublabel={BIRTHDAY_UX.remindersHint}
              variant="green"
              onPress={() => router.push('/notification-settings')}
            />
          </View>

          <BirthdaySection
            icon={BIRTHDAY_SECTIONS.today.icon}
            title={BIRTHDAY_SECTIONS.today.title}
            subtitle={BIRTHDAY_SECTIONS.today.subtitle}
            count={sections.today.length}
            emptyMessage={BIRTHDAY_UX.emptyToday}>
            {sections.today.map((entry) => (
              <BirthdayCalendarCard key={`today-${entry.relative.id}`} entry={entry} featured />
            ))}
          </BirthdaySection>

          <BirthdaySection
            icon={BIRTHDAY_SECTIONS.upcoming.icon}
            title={BIRTHDAY_SECTIONS.upcoming.title}
            subtitle={BIRTHDAY_SECTIONS.upcoming.subtitle}
            count={sections.upcoming.length}
            emptyMessage={BIRTHDAY_UX.emptyUpcoming}>
            {sections.upcoming.map((entry) => (
              <BirthdayCalendarCard key={`upcoming-${entry.relative.id}`} entry={entry} featured />
            ))}
          </BirthdaySection>

          {hasUpcomingFocus ? (
            <BirthdaySection
              icon={BIRTHDAY_SECTIONS.thisMonth.icon}
              title={BIRTHDAY_SECTIONS.thisMonth.title}
              subtitle={BIRTHDAY_SECTIONS.thisMonth.subtitle}
              count={sections.thisMonth.length}
              emptyMessage={BIRTHDAY_UX.emptyThisMonth}>
              {sections.thisMonth.map((entry) => (
                <BirthdayCalendarCard
                  key={`month-${entry.relative.id}`}
                  entry={entry}
                  compact
                />
              ))}
            </BirthdaySection>
          ) : null}

          {sections.all.length > 0 ? (
            <BirthdaySection
              icon={BIRTHDAY_SECTIONS.all.icon}
              title={BIRTHDAY_SECTIONS.all.title}
              subtitle={BIRTHDAY_SECTIONS.all.subtitle}
              count={sections.all.length}
              collapsible
              expanded={allExpanded}
              onToggle={() => setAllExpanded((value) => !value)}>
              <View style={styles.monthList}>
                {sections.monthGroups.map((group) => (
                  <MonthSection key={group.monthIndex} monthLabel={group.monthLabel}>
                    {group.entries.map((entry) => (
                      <BirthdayCalendarCard
                        key={entry.relative.id}
                        entry={entry}
                        compact
                      />
                    ))}
                  </MonthSection>
                ))}
              </View>
            </BirthdaySection>
          ) : null}

          <PrimaryButton
            label="Туысты қосу"
            sublabel="Жаңа туған күн"
            variant="gold"
            onPress={() => router.push('/add-relative')}
          />
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.xl,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  toolbar: {
    gap: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    backgroundColor: Palette.white,
    borderRadius: 16,
    padding: Spacing.md,
  },
  toggleText: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '600',
  },
  toggleHint: {
    ...Typography.caption,
    color: Palette.textMuted,
  },
  monthList: {
    gap: Spacing.lg,
  },
});
