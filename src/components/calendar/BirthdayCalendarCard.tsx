import { useRouter } from 'expo-router';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { Relative } from '@/types/relative';
import { BirthdayEntry } from '@/utils/birthday-calendar';
import {
  formatBirthdayCountdownLabel,
  formatBirthdayKzRu,
  getAgeTurningLabel,
} from '@/utils/dates';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type BirthdayCalendarCardProps = {
  entry: BirthdayEntry;
  compact?: boolean;
};

export function BirthdayCalendarCard({ entry, compact = false }: BirthdayCalendarCardProps) {
  const router = useRouter();
  const { relative, daysUntil } = entry;
  const countdownLabel = formatBirthdayCountdownLabel(daysUntil);
  const ageTurningLabel = getAgeTurningLabel(relative);
  const isSoon = daysUntil <= 7;

  const handleCall = () => {
    if (!relative.phone) {
      Alert.alert('Телефон жоқ', 'Номер телефона не указан.');
      return;
    }
    Linking.openURL(`tel:${relative.phone}`);
  };

  const handleWhatsApp = () => {
    if (!relative.phone) {
      Alert.alert('Телефон жоқ', 'Номер телефона не указан.');
      return;
    }
    const digits = relative.phone.replace(/\D/g, '');
    Linking.openURL(
      `https://wa.me/${digits}?text=${encodeURIComponent(`Ассалаумағалейкум, ${relative.fullName}!`)}`,
    );
  };

  const handleAiGreeting = () => {
    router.push({
      pathname: '/congratulations/[id]',
      params: { id: relative.id },
    });
  };

  return (
    <View style={[styles.card, isSoon && styles.cardSoon, compact && styles.cardCompact]}>
      <View style={styles.topRow}>
        <AvatarPlaceholder
          name={relative.fullName}
          color={relative.avatarColor}
          photoUrl={relative.photoUrl}
          size={compact ? 56 : 64}
        />
        <View style={styles.info}>
          <Text style={styles.relationship}>{relative.relationship}</Text>
          <Text style={styles.name}>{relative.fullName}</Text>
          <Text style={styles.date}>{formatBirthdayKzRu(relative)}</Text>
          {ageTurningLabel ? <Text style={styles.ageTurning}>{ageTurningLabel}</Text> : null}
        </View>
        <View style={[styles.countdownBadge, isSoon && styles.countdownBadgeSoon]}>
          <Text style={[styles.countdownText, isSoon && styles.countdownTextSoon]}>
            {countdownLabel}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleCall}
          style={({ pressed }) => [styles.actionButton, styles.call, pressed && styles.pressed]}
          accessibilityRole="button">
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionLabel}>Позвонить</Text>
        </Pressable>
        <Pressable
          onPress={handleWhatsApp}
          style={({ pressed }) => [styles.actionButton, styles.whatsapp, pressed && styles.pressed]}
          accessibilityRole="button">
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionLabel}>WhatsApp</Text>
        </Pressable>
        <Pressable
          onPress={handleAiGreeting}
          style={({ pressed }) => [styles.actionButton, styles.ai, pressed && styles.pressed]}
          accessibilityRole="button">
          <Text style={styles.actionIcon}>✨</Text>
          <Text style={[styles.actionLabel, styles.aiLabel]}>AI поздравление</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    ...Shadow.soft,
  },
  cardSoon: {
    borderColor: Palette.gold,
    backgroundColor: '#FFFBF5',
  },
  cardCompact: {
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  relationship: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  date: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  ageTurning: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    fontWeight: '700',
  },
  countdownBadge: {
    backgroundColor: Palette.creamDark,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    maxWidth: 110,
  },
  countdownBadgeSoon: {
    backgroundColor: '#FFF9EB',
    borderWidth: 1,
    borderColor: Palette.goldLight,
  },
  countdownText: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
  },
  countdownTextSoon: {
    color: Palette.gold,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
  call: {
    backgroundColor: Palette.greenDeep,
  },
  whatsapp: {
    backgroundColor: Palette.whatsapp,
  },
  ai: {
    backgroundColor: Palette.creamDark,
    borderWidth: 1,
    borderColor: Palette.goldLight,
  },
  pressed: {
    opacity: 0.88,
  },
  actionIcon: {
    fontSize: 15,
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
