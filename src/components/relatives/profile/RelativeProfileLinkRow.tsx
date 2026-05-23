import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type RelativeProfileLinkRowProps = {
  label: string;
  relative: Relative | null;
  emptyLabel: string;
  onPress?: (relativeId: string) => void;
  isLast?: boolean;
};

export function RelativeProfileLinkRow({
  label,
  relative,
  emptyLabel,
  onPress,
  isLast = false,
}: RelativeProfileLinkRowProps) {
  if (!relative) {
    return (
      <View style={[styles.row, styles.rowEmpty, isLast && styles.rowLast]}>
        <View style={styles.emptyIconWrap}>
          <Text style={styles.emptyIcon}>—</Text>
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.emptyValue}>{emptyLabel}</Text>
        </View>
      </View>
    );
  }

  const displayName = getRelativeDisplayName(relative);

  return (
    <Pressable
      onPress={() => onPress?.(relative.id)}
      style={({ pressed }) => [
        styles.row,
        styles.rowInteractive,
        isLast && styles.rowLast,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${displayName}`}>
      <AvatarPlaceholder
        name={displayName}
        color={relative.avatarColor}
        photoUrl={relative.photoUrl}
        size={52}
      />
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {displayName}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {relative.relationship}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 76,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Palette.creamDark,
  },
  rowInteractive: {
    paddingRight: Spacing.xs,
  },
  rowEmpty: {
    opacity: 0.92,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Palette.cream,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    ...Typography.body,
    color: Palette.textMuted,
    fontWeight: '700',
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
  name: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  meta: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  emptyValue: {
    ...Typography.bodySmall,
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
});
