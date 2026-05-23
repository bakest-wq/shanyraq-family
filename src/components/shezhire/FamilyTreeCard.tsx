import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

/** Show compact child cards when a unit has this many children or more. */
export const COMPACT_CHILDREN_THRESHOLD = 4;

type FamilyTreeCardProps = {
  relative?: Relative;
  onPress?: () => void;
  onConnect?: () => void;
  compact?: boolean;
  mini?: boolean;
  gridItem?: boolean;
  placeholder?: boolean;
  placeholderLabel?: string;
};

export function FamilyTreeCard({
  relative,
  onPress,
  onConnect,
  compact = false,
  mini = false,
  gridItem = false,
  placeholder = false,
  placeholderLabel = '—',
}: FamilyTreeCardProps) {
  if (placeholder || !relative) {
    return (
      <View
        style={[
          styles.card,
          styles.placeholder,
          compact && styles.compact,
          mini && styles.mini,
          gridItem && styles.gridItem,
        ]}>
        <Text style={styles.placeholderText}>{placeholderLabel}</Text>
      </View>
    );
  }

  const displayName = getRelativeDisplayName(relative);
  const avatarSize = mini ? 40 : compact ? 48 : 56;

  return (
    <View
      style={[
        styles.card,
        compact && styles.compact,
        mini && styles.mini,
        gridItem && styles.gridItem,
      ]}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [styles.inner, pressed && onPress && styles.pressed]}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={displayName}>
        <AvatarPlaceholder
          name={displayName}
          color={relative.avatarColor}
          photoUrl={relative.photoUrl}
          size={avatarSize}
          deceased={relative.isDeceased}
        />
        <Text
          style={[styles.name, compact && styles.nameCompact, mini && styles.nameMini]}
          numberOfLines={2}>
          {displayName}
        </Text>
        <Text
          style={[styles.relationship, mini && styles.relationshipMini]}
          numberOfLines={1}>
          {relative.relationship}
        </Text>
      </Pressable>
      {onConnect ? (
        <Pressable
          onPress={onConnect}
          style={({ pressed }) => [styles.connectButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Связать ${displayName}`}>
          <Text style={styles.connectText}>Байлау · Связать</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 140,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadow.soft,
  },
  gridItem: {
    width: '48%',
    minWidth: 0,
    flexGrow: 1,
  },
  inner: {
    alignItems: 'center',
    gap: Spacing.xs,
    width: '100%',
    minHeight: 44,
  },
  compact: {
    minWidth: 0,
    padding: Spacing.sm,
  },
  mini: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.md,
  },
  placeholder: {
    borderStyle: 'dashed',
    borderColor: Palette.creamDark,
    backgroundColor: Palette.cream,
    justifyContent: 'center',
    minHeight: 100,
  },
  placeholderText: {
    ...Typography.caption,
    color: Palette.textMuted,
  },
  pressed: {
    opacity: 0.9,
  },
  name: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  nameCompact: {
    fontSize: 15,
    lineHeight: 20,
  },
  nameMini: {
    fontSize: 13,
    lineHeight: 18,
  },
  relationship: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
    textAlign: 'center',
  },
  relationshipMini: {
    fontSize: 11,
    lineHeight: 14,
  },
  connectButton: {
    marginTop: Spacing.xs,
    backgroundColor: Palette.greenDeep,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  connectText: {
    ...Typography.caption,
    color: Palette.white,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export function getCompactChildrenLayout(childCount: number): {
  compact: boolean;
  mini: boolean;
  gridItem: boolean;
} {
  const compact = childCount >= COMPACT_CHILDREN_THRESHOLD;
  const mini = childCount >= 6;

  return {
    compact,
    mini,
    gridItem: compact,
  };
}
