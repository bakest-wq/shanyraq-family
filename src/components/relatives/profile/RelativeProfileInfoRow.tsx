import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type RelativeProfileInfoRowProps = {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
  empty?: boolean;
  isLast?: boolean;
};

export function RelativeProfileInfoRow({
  icon,
  label,
  value,
  onPress,
  empty = false,
  isLast = false,
}: RelativeProfileInfoRowProps) {
  const content = (
    <>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, empty && styles.valueEmpty]} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </>
  );

  if (onPress && !empty) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          styles.rowInteractive,
          isLast && styles.rowLast,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button">
        {content}
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  }

  return <View style={[styles.row, isLast && styles.rowLast]}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 72,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Palette.creamDark,
  },
  rowInteractive: {
    paddingRight: Spacing.xs,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Palette.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  value: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  valueEmpty: {
    color: Palette.textMuted,
    fontWeight: '600',
  },
  chevron: {
    ...Typography.title,
    color: Palette.gold,
    fontWeight: '400',
    lineHeight: 28,
  },
  pressed: {
    opacity: 0.9,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
});
