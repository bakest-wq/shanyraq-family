import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BirthdayCalendarCard } from '@/components/calendar/BirthdayCalendarCard';
import { ReminderSettingsPanel } from '@/components/calendar/ReminderSettingsPanel';
import { AppHeader } from '@/components/ui/AppHeader';
import { PresetEmptyState } from '@/components/ui/EmptyState';
import { EMPTY_STATE_PRESETS } from '@/constants/family-ux-content';
import { ErrorState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { MonthSection } from '@/components/ui/MonthSection';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useReminderSettings } from '@/hooks/useReminderSettings';
import { useRelatives } from '@/hooks/useRelatives';
import { DEFAULT_BIRTHDAY_REMINDER_SETTINGS } from '@/types/reminders';
import {
  buildBirthdayEntries,
  getUpcomingBirthdayEntries,
  groupBirthdaysByMonth,
  hasBirthdayData,
} from '@/utils/birthday-calendar';
import { Spacing } from '@/constants/theme';

export default function CalendarScreen() {
  const router = useRouter();
  const { relatives, loading, error, refetch } = useRelatives();
  const { settings, updateSetting } = useReminderSettings();
  const [refreshing, setRefreshing] = useState(false);
  const birthdayEntries = useMemo(() => buildBirthdayEntries(relatives), [relatives]);

  const upcomingEntries = useMemo(
    () => getUpcomingBirthdayEntries(birthdayEntries),
    [birthdayEntries],
  );

  const monthGroups = useMemo(() => groupBirthdaysByMonth(birthdayEntries), [birthdayEntries]);

  const hasBirthdays = hasBirthdayData(relatives);
  const reminderSettings = settings ?? DEFAULT_BIRTHDAY_REMINDER_SETTINGS;

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
          title="Күнтізбе"
          subtitle="Умный календарь · Туған күндер"
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
          <ReminderSettingsPanel settings={reminderSettings} onToggle={updateSetting} />

          <PrimaryButton
            label="Все настройки уведомлений"
            sublabel="Дұға · звук · тест"
            variant="green"
            onPress={() => router.push('/notification-settings')}
          />

          {upcomingEntries.length > 0 ? (
            <View style={styles.section}>
              <SectionTitle
                title="Жақын туған күндер"
                subtitle="Ближайшие дни рождения · сначала самые скорые"
              />
              <View style={styles.list}>
                {upcomingEntries.map((entry) => (
                  <BirthdayCalendarCard key={`upcoming-${entry.relative.id}`} entry={entry} />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionTitle
              title="Айлар бойынша"
              subtitle="По месяцам · все дни рождения"
            />
            <View style={styles.monthList}>
              {monthGroups.map((group) => (
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
          </View>

          <PrimaryButton
            label="Добавить родственника"
            sublabel="Жаңа туған күн · New birthday"
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
    gap: Spacing.lg,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  section: {
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.md,
  },
  monthList: {
    gap: Spacing.lg,
  },
});
