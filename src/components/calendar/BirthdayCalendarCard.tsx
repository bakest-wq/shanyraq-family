import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { BIRTHDAY_UX } from '@/constants/birthday-content';
import { useMyKinshipCardLine } from '@/hooks/useKinshipLabel';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import {
  getMilestoneAge,
  getSmartReminderHint,
  type BirthdayEntry,
} from '@/utils/birthday-calendar';
import { formatBirthdayCountdownKz, getAgeTurningLabelKz } from '@/utils/dates';
import { openRelativeWhatsApp } from '@/utils/whatsapp-contact';

type BirthdayCalendarCardProps = {
  entry: BirthdayEntry;
  featured?: boolean;
  compact?: boolean;
};

export function BirthdayCalendarCard({
  entry,
  featured = false,
  compact = false,
}: BirthdayCalendarCardProps) {
  const router = useRouter();
  const { relative, daysUntil } = entry;
  const kinshipLabel = useMyKinshipCardLine(relative);
  const countdownLabel = formatBirthdayCountdownKz(daysUntil);
  const ageTurningLabel = getAgeTurningLabelKz(relative);
  const milestoneAge = getMilestoneAge(entry);
  const smartHint = getSmartReminderHint(daysUntil);
  const showActions = featured && !compact;
  const isToday = daysUntil === 0;
  const isSoon = daysUntil >= 1 && daysUntil <= 7;

  const handleWhatsApp = () => {
    openRelativeWhatsApp({
      phone: relative.phone,
      name: relative.fullName,
    });
  };

  const handleAiGreeting = () => {
    router.push({
      pathname: '/congratulations/[id]',
      params: { id: relative.id },
    });
  };

  return (
    <View
      style={[
        styles.card,
        isToday && styles.cardToday,
        isSoon && !isToday && styles.cardSoon,
        compact && styles.cardCompact,
      ]}>
      <View style={styles.topRow}>
        <AvatarPlaceholder
          name={relative.fullName}
          color={relative.avatarColor}
          photoUrl={relative.photoUrl}
          size={compact ? 48 : 56}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{relative.fullName}</Text>
          {kinshipLabel ? <Text style={styles.kinship}>{kinshipLabel}</Text> : null}
          {ageTurningLabel ? <Text style={styles.ageTurning}>{ageTurningLabel}</Text> : null}
          {milestoneAge !== null ? (
            <Text style={styles.milestone}>{BIRTHDAY_UX.milestoneLabel(milestoneAge)}</Text>
          ) : null}
          {smartHint ? (
            <Text style={[styles.smartHint, isToday && styles.smartHintToday]}>
              {smartHint === 'today' ? BIRTHDAY_UX.smartReminderToday : BIRTHDAY_UX.smartReminderSoon}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.countdownBadge,
            isToday && styles.countdownBadgeToday,
            isSoon && !isToday && styles.countdownBadgeSoon,
          ]}>
          <Text
            style={[
              styles.countdownText,
              isToday && styles.countdownTextToday,
              isSoon && !isToday && styles.countdownTextSoon,
            ]}>
            {countdownLabel}
          </Text>
        </View>
      </View>

      {showActions ? (
        <View style={styles.actions}>
          <Pressable
            onPress={handleWhatsApp}
            style={({ pressed }) => [
              styles.actionButton,
              styles.whatsapp,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button">
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionLabel}>WhatsApp</Text>
          </Pressable>
          <Pressable
            onPress={handleAiGreeting}
            style={({ pressed }) => [styles.actionButton, styles.ai, pressed && styles.pressed]}
            accessibilityRole="button">
            <Text style={styles.actionIcon}>✨</Text>
            <Text style={[styles.actionLabel, styles.aiLabel]}>Құттықтау</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardToday: {
    backgroundColor: '#FFFBF5',
  },
  cardSoon: {
    backgroundColor: '#FAFCF9',
  },
  cardCompact: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  kinship: {
    ...Typography.caption,
    color: Palette.greenMid,
    fontWeight: '600',
  },
  ageTurning: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
  },
  milestone: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
  },
  smartHint: {
    ...Typography.caption,
    color: Palette.textMuted,
    fontStyle: 'italic',
  },
  smartHintToday: {
    color: Palette.greenDeep,
    fontWeight: '600',
    fontStyle: 'normal',
  },
  countdownBadge: {
    backgroundColor: Palette.creamDark,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    maxWidth: 108,
  },
  countdownBadgeToday: {
    backgroundColor: '#FFF3D6',
  },
  countdownBadgeSoon: {
    backgroundColor: '#EEF5F0',
  },
  countdownText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
  },
  countdownTextToday: {
    color: Palette.gold,
  },
  countdownTextSoon: {
    color: Palette.greenMid,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: Spacing.xs,
  },
  whatsapp: {
    backgroundColor: Palette.whatsapp,
  },
  ai: {
    backgroundColor: Palette.creamDark,
  },
  pressed: {
    opacity: 0.88,
  },
  actionIcon: {
    fontSize: 14,
  },
  actionLabel: {
    ...Typography.caption,
    color: Palette.white,
    fontWeight: '700',
    textAlign: 'center',
  },
  aiLabel: {
    color: Palette.greenDeep,
  },
});
