import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing, Typography } from '@/constants/theme';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  onBadgePress?: () => void;
};

export function AppHeader({ title, subtitle, badge, onBadgePress }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandMark}>
          <Text style={styles.brandIcon}>🏠</Text>
        </View>
        {badge ? (
          onBadgePress ? (
            <Pressable onPress={onBadgePress} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </Pressable>
          ) : (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )
        ) : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Palette.cream,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Palette.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcon: {
    fontSize: 22,
  },
  badge: {
    backgroundColor: Palette.goldLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
  },
  badgeText: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  title: {
    ...Typography.hero,
    color: Palette.greenDeep,
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
  },
});
