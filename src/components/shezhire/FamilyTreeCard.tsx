import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { Relative } from '@/types/relative';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type FamilyTreeCardProps = {
  relative?: Relative;
  onPress?: () => void;
  onConnect?: () => void;
  compact?: boolean;
  placeholder?: boolean;
  placeholderLabel?: string;
};

export function FamilyTreeCard({
  relative,
  onPress,
  onConnect,
  compact = false,
  placeholder = false,
  placeholderLabel = '—',
}: FamilyTreeCardProps) {
  if (placeholder || !relative) {
    return (
      <View style={[styles.card, styles.placeholder, compact && styles.compact]}>
        <Text style={styles.placeholderText}>{placeholderLabel}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, compact && styles.compact]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.inner, pressed && onPress && styles.pressed]}>
        <AvatarPlaceholder
          name={relative.fullName}
          color={relative.avatarColor}
          size={compact ? 48 : 56}
          deceased={relative.isDeceased}
        />
        <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={2}>
          {relative.fullName}
        </Text>
        <Text style={styles.relationship}>{relative.relationship}</Text>
      </Pressable>
      {onConnect ? (
        <Pressable onPress={onConnect} style={styles.connectButton}>
          <Text style={styles.connectText}>Связать</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
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
  inner: {
    alignItems: 'center',
    gap: Spacing.xs,
    width: '100%',
  },
  compact: {
    minWidth: 120,
    padding: Spacing.sm,
  },
  placeholder: {
    borderStyle: 'dashed',
    borderColor: Palette.creamDark,
    backgroundColor: Palette.cream,
    justifyContent: 'center',
    minHeight: 120,
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
    fontSize: 14,
  },
  relationship: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
    textAlign: 'center',
  },
  connectButton: {
    marginTop: Spacing.xs,
    backgroundColor: Palette.greenDeep,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  connectText: {
    ...Typography.caption,
    color: Palette.white,
    fontWeight: '700',
  },
});
