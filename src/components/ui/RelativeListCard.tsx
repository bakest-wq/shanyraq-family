import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Animated, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

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
  highlighted?: boolean;
};

export function RelativeListCard({ relative, highlighted = false }: RelativeListCardProps) {
  const router = useRouter();
  const highlightAnim = useRef(new Animated.Value(0)).current;
  const age = calculateAge(relative.birthday);
  const upcomingLabel =
    !relative.isDeceased ? getUpcomingBirthdayLabel(relative.birthday) : null;

  useEffect(() => {
    if (!highlighted) {
      highlightAnim.setValue(0);
      return;
    }

    highlightAnim.setValue(0);
    Animated.sequence([
      Animated.timing(highlightAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      }),
      Animated.timing(highlightAnim, {
        toValue: 0,
        duration: 2200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [highlightAnim, highlighted]);

  const borderColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Palette.goldLight, Palette.gold],
  });

  const backgroundColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Palette.white, '#FFF9EB'],
  });

  const shadowOpacity = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.22],
  });

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
    <Animated.View
      style={[
        styles.card,
        relative.isDeceased && styles.cardDeceased,
        highlighted && {
          borderColor,
          backgroundColor,
          shadowColor: Palette.gold,
          shadowOpacity,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        },
      ]}>
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
    </Animated.View>
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
