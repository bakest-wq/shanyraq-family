import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Relative } from '@/types/relative';
import {
  calculateAge,
  formatBirthdayKzRu,
  getAgeLabel,
  getUpcomingBirthdayLabel,
} from '@/utils/dates';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

import { AvatarPlaceholder } from './RelativeCard';

type RelativeListCardProps = {
  relative: Relative;
};

export function RelativeListCard({ relative }: RelativeListCardProps) {
  const router = useRouter();
  const age = calculateAge(relative.birthday);
  const upcomingLabel =
    !relative.isDeceased ? getUpcomingBirthdayLabel(relative.birthday) : null;

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

  const handleDetails = () => {
    router.push({
      pathname: '/relative/[id]',
      params: { id: relative.id },
    });
  };

  return (
    <View style={[styles.card, relative.isDeceased && styles.cardDeceased]}>
      <View style={styles.topRow}>
        <AvatarPlaceholder
          name={relative.fullName}
          color={relative.avatarColor}
          size={72}
          deceased={relative.isDeceased}
        />
        <View style={styles.info}>
          <Text style={styles.relationship}>{relative.relationship}</Text>
          <Text style={styles.name}>{relative.fullName}</Text>
          <Text style={styles.birthday}>{formatBirthdayKzRu(relative.birthday)}</Text>
          {age !== null ? <Text style={styles.age}>{getAgeLabel(age)}</Text> : null}
        </View>
      </View>

      {upcomingLabel ? (
        <View style={styles.badgeRow}>
          <View style={styles.birthdayBadge}>
            <Text style={styles.birthdayBadgeText}>🎂 {upcomingLabel}</Text>
          </View>
        </View>
      ) : null}

      {relative.isDeceased ? (
        <View style={styles.deceasedBadge}>
          <Text style={styles.deceasedBadgeText}>🕊️ Марқұм</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={handleCall}
          style={({ pressed }) => [styles.actionButton, styles.callButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Позвонить ${relative.fullName}`}>
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionLabel}>Позвонить</Text>
        </Pressable>
        <Pressable
          onPress={handleWhatsApp}
          style={({ pressed }) => [
            styles.actionButton,
            styles.whatsappButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`WhatsApp ${relative.fullName}`}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionLabel}>WhatsApp</Text>
        </Pressable>
        <Pressable
          onPress={handleDetails}
          style={({ pressed }) => [
            styles.actionButton,
            styles.detailsButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Подробнее ${relative.fullName}`}>
          <Text style={styles.actionIcon}>ℹ️</Text>
          <Text style={[styles.actionLabel, styles.detailsLabel]}>Подробнее</Text>
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
    borderColor: Palette.goldLight,
    ...Shadow.card,
  },
  cardDeceased: {
    borderColor: Palette.creamDark,
    opacity: 0.95,
  },
  topRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  relationship: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  name: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
  },
  birthday: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
  },
  age: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
  },
  birthdayBadge: {
    backgroundColor: '#FFF9EB',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.goldLight,
  },
  birthdayBadgeText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  deceasedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.creamDark,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  deceasedBadgeText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: Spacing.xs,
  },
  callButton: {
    backgroundColor: Palette.greenDeep,
  },
  whatsappButton: {
    backgroundColor: Palette.whatsapp,
  },
  detailsButton: {
    backgroundColor: Palette.creamDark,
    borderWidth: 1,
    borderColor: Palette.goldLight,
  },
  pressed: {
    opacity: 0.88,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionLabel: {
    ...Typography.caption,
    color: Palette.white,
    fontWeight: '700',
    textAlign: 'center',
  },
  detailsLabel: {
    color: Palette.greenDeep,
  },
});
