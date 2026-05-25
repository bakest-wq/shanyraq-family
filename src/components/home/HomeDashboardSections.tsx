import { useRouter } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { COGNITIVE_LOAD_COPY } from '@/constants/cognitive-load-content';
import { HOME_COPY } from '@/constants/home-content';
import { useAppTheme } from '@/hooks/useElderMode';
import { useMyKinshipCardLine } from '@/hooks/useKinshipLabel';
import type { BirthdayEntry } from '@/utils/birthday-calendar';
import {
  formatHomeBirthdayLine,
  type HomeMemoryHighlight,
  type HomeReminder,
} from '@/utils/home-dashboard';
import { getAgeTurningLabelKz } from '@/utils/dates';

type HomeSectionShellProps = {
  title: string;
  hint?: string;
  children: ReactNode;
  footer?: ReactNode;
};

function HomeSectionShell({ title, hint, children, footer }: HomeSectionShellProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createShellStyles(theme), [theme]);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {children}
      {footer}
    </View>
  );
}

function HomeTextLink({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createShellStyles(theme), [theme]);

  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => [pressed && styles.pressed]}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

function HomeBirthdayRow({
  entry,
  elderMode = false,
}: {
  entry: BirthdayEntry;
  elderMode?: boolean;
}) {
  const theme = useAppTheme();
  const styles = useMemo(() => createRowStyles(theme, elderMode), [elderMode, theme]);
  const kinship = useMyKinshipCardLine(entry.relative);
  const ageLabel = getAgeTurningLabelKz(entry.relative);
  const isToday = entry.daysUntil === 0;

  return (
    <View style={[styles.row, isToday && styles.rowToday]}>
      <AvatarPlaceholder
        name={entry.relative.fullName}
        color={entry.relative.avatarColor}
        photoUrl={entry.relative.photoUrl}
        size={elderMode ? 56 : 48}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{entry.relative.fullName}</Text>
        {!elderMode ? (
          <Text style={styles.meta}>{[kinship, ageLabel].filter(Boolean).join(' · ') || ' '}</Text>
        ) : null}
      </View>
      <Text style={[styles.badge, isToday && styles.badgeToday]}>{formatHomeBirthdayLine(entry)}</Text>
    </View>
  );
}

type HomeBirthdaysSectionProps = {
  entries: BirthdayEntry[];
  elderMode?: boolean;
};

export function HomeBirthdaysSection({ entries, elderMode = false }: HomeBirthdaysSectionProps) {
  const router = useRouter();
  const theme = useAppTheme();
  const shellStyles = useMemo(() => createShellStyles(theme), [theme]);
  const listGap = elderMode ? theme.spacing.md : theme.spacing.sm;

  return (
    <HomeSectionShell
      title={HOME_COPY.birthdaysTitle}
      hint={HOME_COPY.birthdaysHint}
      footer={
        !elderMode && entries.length > 0 ? (
          <HomeTextLink
            label={`${HOME_COPY.birthdaysSeeAll} →`}
            onPress={() => router.push('/calendar')}
          />
        ) : null
      }>
      {entries.length > 0 ? (
        <View style={{ gap: listGap }}>
          {entries.map((entry) => (
            <HomeBirthdayRow key={entry.relative.id} entry={entry} elderMode={elderMode} />
          ))}
        </View>
      ) : (
        <Text style={shellStyles.empty}>{HOME_COPY.birthdaysEmpty}</Text>
      )}
    </HomeSectionShell>
  );
}

type HomeRecentMemoriesSectionProps = {
  memories: HomeMemoryHighlight[];
};

export function HomeRecentMemoriesSection({ memories }: HomeRecentMemoriesSectionProps) {
  const router = useRouter();
  const theme = useAppTheme();
  const rowStyles = useMemo(() => createRowStyles(theme, false), [theme]);
  const shellStyles = useMemo(() => createShellStyles(theme), [theme]);

  return (
    <HomeSectionShell
      title={HOME_COPY.memoriesTitle}
      hint={HOME_COPY.memoriesHint}
      footer={
        memories.length > 0 ? (
          <HomeTextLink
            label={`${HOME_COPY.memoriesSeeAll} →`}
            onPress={() => router.push('/family-memories')}
          />
        ) : null
      }>
      {memories.length > 0 ? (
        <View style={{ gap: 10 }}>
          {memories.map((memory) => (
            <Pressable
              key={memory.id}
              onPress={() => router.push('/family-memories')}
              style={({ pressed }) => [rowStyles.memoryRow, pressed && shellStyles.pressed]}>
              {memory.photoUri ? (
                <Image source={{ uri: memory.photoUri }} style={rowStyles.memoryPhoto} />
              ) : (
                <View style={rowStyles.memoryIconWrap}>
                  <Text style={rowStyles.memoryIcon}>{memory.icon}</Text>
                </View>
              )}
              <View style={rowStyles.info}>
                <Text style={rowStyles.name} numberOfLines={1}>
                  {memory.title}
                </Text>
                <Text style={rowStyles.meta} numberOfLines={1}>
                  {memory.subtitle}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <Pressable
          onPress={() => router.push('/add-memory')}
          style={({ pressed }) => [rowStyles.emptyMemory, pressed && shellStyles.pressed]}>
          <Text style={rowStyles.emptyMemoryIcon}>🌿</Text>
          <Text style={shellStyles.empty}>{HOME_COPY.memoriesEmpty}</Text>
        </Pressable>
      )}
    </HomeSectionShell>
  );
}

type HomeGentleRemindersSectionProps = {
  reminders: HomeReminder[];
};

export function HomeGentleRemindersSection({ reminders }: HomeGentleRemindersSectionProps) {
  const router = useRouter();
  const theme = useAppTheme();
  const rowStyles = useMemo(() => createRowStyles(theme, false), [theme]);
  const shellStyles = useMemo(() => createShellStyles(theme), [theme]);
  const [showAll, setShowAll] = useState(false);

  const visibleReminders = showAll ? reminders : reminders.slice(0, 1);
  const hiddenCount = reminders.length - visibleReminders.length;

  return (
    <HomeSectionShell title={HOME_COPY.remindersTitle} hint={HOME_COPY.remindersHint}>
      {reminders.length > 0 ? (
        <View style={{ gap: 8 }}>
          {visibleReminders.map((reminder) => (
            <Pressable
              key={reminder.id}
              onPress={() => router.push(reminder.route)}
              style={({ pressed }) => [rowStyles.reminderRow, pressed && shellStyles.pressed]}>
              <Text style={rowStyles.reminderIcon}>{reminder.icon}</Text>
              <Text style={rowStyles.reminderText}>{reminder.message}</Text>
            </Pressable>
          ))}
          {hiddenCount > 0 && !showAll ? (
            <HomeTextLink
              label={COGNITIVE_LOAD_COPY.moreReminders(hiddenCount)}
              onPress={() => setShowAll(true)}
            />
          ) : null}
        </View>
      ) : (
        <Text style={shellStyles.emptyQuiet}>{HOME_COPY.reminderEmpty}</Text>
      )}
    </HomeSectionShell>
  );
}

function createShellStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    section: {
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    header: {
      gap: theme.spacing.xs,
    },
    title: {
      fontSize: theme.elderMode ? 24 : 22,
      lineHeight: theme.elderMode ? 32 : 30,
      color: theme.palette.greenDeep,
      fontWeight: '600',
    },
    hint: {
      ...theme.typography.bodySmall,
      color: theme.palette.textSecondary,
      fontWeight: '500',
      lineHeight: 24,
    },
    link: {
      ...theme.typography.bodySmall,
      color: theme.palette.greenMid,
      fontWeight: '600',
      paddingTop: theme.spacing.xs,
    },
    empty: {
      ...theme.typography.bodySmall,
      color: theme.palette.textMuted,
      lineHeight: 24,
    },
    emptyQuiet: {
      ...theme.typography.bodySmall,
      color: theme.palette.textSecondary,
      lineHeight: 24,
      fontStyle: 'italic',
    },
    pressed: {
      opacity: 0.9,
    },
  });
}

function createRowStyles(theme: ReturnType<typeof useAppTheme>, elderMode: boolean) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.palette.white,
      borderWidth: 1,
      borderColor: theme.palette.creamDark,
    },
    rowToday: {
      borderColor: theme.palette.goldLight,
      backgroundColor: '#FFFCF6',
    },
    info: {
      flex: 1,
      gap: 2,
    },
    name: {
      ...theme.typography.bodySmall,
      color: theme.palette.textPrimary,
      fontWeight: '600',
    },
    meta: {
      ...theme.typography.caption,
      color: theme.palette.textSecondary,
      fontWeight: '500',
    },
    badge: {
      ...theme.typography.caption,
      color: theme.palette.greenMid,
      fontWeight: '600',
      textAlign: 'right',
      maxWidth: elderMode ? 120 : 100,
    },
    badgeToday: {
      color: theme.palette.gold,
      fontWeight: '700',
    },
    memoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.palette.white,
      borderWidth: 1,
      borderColor: theme.palette.creamDark,
    },
    memoryPhoto: {
      width: 52,
      height: 52,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.palette.creamDark,
    },
    memoryIconWrap: {
      width: 52,
      height: 52,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.palette.cream,
      alignItems: 'center',
      justifyContent: 'center',
    },
    memoryIcon: {
      fontSize: 24,
    },
    emptyMemory: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.palette.white,
      borderWidth: 1,
      borderColor: theme.palette.creamDark,
    },
    emptyMemoryIcon: {
      fontSize: 28,
    },
    reminderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.palette.white,
      borderWidth: 1,
      borderColor: theme.palette.creamDark,
    },
    reminderIcon: {
      fontSize: 20,
      lineHeight: 24,
      marginTop: 1,
    },
    reminderText: {
      flex: 1,
      ...theme.typography.bodySmall,
      color: theme.palette.textPrimary,
      fontWeight: '500',
      lineHeight: 24,
    },
  });
}
