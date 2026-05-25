import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { RELATIVE_PROFILE_COPY } from '@/constants/relative-profile-content';
import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type RelativeProfilePersonRowProps = {
  relative: Relative | null;
  caption?: string;
  onPress?: (relativeId: string) => void;
  isLast?: boolean;
};

export function RelativeProfilePersonRow({
  relative,
  caption,
  onPress,
  isLast = false,
}: RelativeProfilePersonRowProps) {
  if (!relative) {
    return (
      <View style={[styles.row, styles.rowEmpty, isLast && styles.rowLast]}>
        <View style={styles.emptyAvatar}>
          <Text style={styles.emptyDash}>—</Text>
        </View>
        <View style={styles.textWrap}>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
          <Text style={styles.emptyText}>{RELATIVE_PROFILE_COPY.empty.person}</Text>
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
        isLast && styles.rowLast,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={displayName}>
      <AvatarPlaceholder
        name={displayName}
        color={relative.avatarColor}
        photoUrl={relative.photoUrl}
        size={48}
      />
      <View style={styles.textWrap}>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        <Text style={styles.name} numberOfLines={2}>
          {displayName}
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
    minHeight: 64,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Palette.creamDark,
  },
  rowEmpty: {
    opacity: 0.92,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  emptyAvatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Palette.cream,
    borderWidth: 1,
    borderColor: Palette.creamDark,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDash: {
    ...Typography.body,
    color: Palette.textMuted,
    fontWeight: '700',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  caption: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  name: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  emptyText: {
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
