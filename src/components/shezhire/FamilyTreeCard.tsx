import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

/** Show compact child cards when a unit has this many children or more. */
export const COMPACT_CHILDREN_THRESHOLD = 4;

export type TreeCardVisualTier = 'parent' | 'core' | 'peer' | 'child';

const TIER_STYLES: Record<TreeCardVisualTier, ViewStyle> = {
  parent: {
    backgroundColor: '#FAF8F3',
    borderColor: '#E8E0D0',
    opacity: 0.96,
  },
  core: {
    backgroundColor: Palette.white,
    borderColor: Palette.greenDeep,
    ...Shadow.card,
  },
  peer: {
    backgroundColor: Palette.white,
    borderColor: Palette.goldLight,
  },
  child: {
    backgroundColor: '#FCFBF8',
    borderColor: '#ECE6DA',
  },
};

function tierStyle(tier: TreeCardVisualTier): ViewStyle {
  return TIER_STYLES[tier];
}

type FamilyTreeCardProps = {
  relative?: Relative;
  onPress?: () => void;
  onLongPress?: () => void;
  onConnect?: () => void;
  compact?: boolean;
  mini?: boolean;
  gridItem?: boolean;
  highlighted?: boolean;
  visualTier?: TreeCardVisualTier;
  placeholder?: boolean;
  placeholderLabel?: string;
  hideRelationship?: boolean;
  /** Calculated kinship from current Shezhire root */
  kinshipLine?: string | null;
  /** Stored preset relationship label from profile */
  structuralRole?: string;
};

export function FamilyTreeCard({
  relative,
  onPress,
  onLongPress,
  onConnect,
  compact = false,
  mini = false,
  gridItem = false,
  highlighted = false,
  visualTier = 'peer',
  placeholder = false,
  placeholderLabel = '—',
  hideRelationship = false,
  kinshipLine = null,
  structuralRole,
}: FamilyTreeCardProps) {
  if (placeholder || !relative) {
    return (
      <View
        style={[
          styles.card,
          styles.placeholder,
          tierStyle(visualTier),
          compact && styles.compact,
          mini && styles.mini,
          gridItem && styles.gridItem,
        ]}>
        <Text style={styles.placeholderText}>{placeholderLabel}</Text>
      </View>
    );
  }

  const displayName = getRelativeDisplayName(relative);
  const tier = highlighted && visualTier !== 'core' ? 'core' : visualTier;
  const showKinship = Boolean(kinshipLine);
  const showStructural = Boolean(structuralRole) && structuralRole !== kinshipLine;
  const fallbackRelationship = !hideRelationship && !showKinship ? relative.relationship : null;
  const avatarSize =
    tier === 'core' ? 64 : tier === 'parent' ? 40 : tier === 'child' || mini ? 40 : compact ? 48 : 56;

  return (
    <View
      style={[
        styles.card,
        tierStyle(tier),
        compact && styles.compact,
        mini && styles.mini,
        gridItem && styles.gridItem,
        highlighted && styles.highlighted,
      ]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={!onPress && !onLongPress}
        style={({ pressed }) => [styles.inner, pressed && (onPress || onLongPress) && styles.pressed]}
        accessibilityRole={onPress || onLongPress ? 'button' : undefined}
        accessibilityLabel={displayName}>
        <AvatarPlaceholder
          name={displayName}
          color={relative.avatarColor}
          photoUrl={relative.photoUrl}
          size={avatarSize}
          deceased={relative.isDeceased}
        />
        <Text
          style={[
            styles.name,
            tier === 'core' && styles.nameCore,
            tier === 'parent' && styles.nameParent,
            tier === 'child' && styles.nameChild,
            compact && styles.nameCompact,
            mini && styles.nameMini,
          ]}
          numberOfLines={2}>
          {displayName}
        </Text>
        {!hideRelationship && showKinship ? (
          <Text
            style={[styles.relationship, mini && styles.relationshipMini]}
            numberOfLines={2}>
            {kinshipLine}
          </Text>
        ) : null}
        {fallbackRelationship ? (
          <Text
            style={[styles.relationship, mini && styles.relationshipMini]}
            numberOfLines={1}>
            {fallbackRelationship}
          </Text>
        ) : null}
        {showStructural ? (
          <Text style={[styles.structuralRole, mini && styles.structuralRoleMini]} numberOfLines={1}>
            {structuralRole}
          </Text>
        ) : null}
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
  highlighted: {
    borderColor: Palette.greenDeep,
    borderWidth: 2.5,
    backgroundColor: '#F4FAF6',
    ...Shadow.card,
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
    borderColor: '#E0D8C8',
    backgroundColor: '#FAF8F4',
    justifyContent: 'center',
    minHeight: 88,
  },
  placeholderText: {
    ...Typography.caption,
    color: Palette.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.xs,
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
  nameCore: {
    ...Typography.body,
    fontWeight: '800',
    color: Palette.greenDeep,
  },
  nameParent: {
    fontSize: 13,
    lineHeight: 18,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  nameChild: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
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
  structuralRole: {
    ...Typography.caption,
    color: Palette.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  structuralRoleMini: {
    fontSize: 10,
    lineHeight: 13,
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
