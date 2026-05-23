import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import type { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import type { UnlinkedRelativeInsight } from '@/utils/unlinked-relative-ux';
import { formatUnlinkedRelativeReasons } from '@/utils/unlinked-relative-ux';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type UnlinkedRelativeCardProps = {
  relative: Relative;
  insight: UnlinkedRelativeInsight;
  kinshipLine?: string;
  onAction: (actionId: UnlinkedRelativeInsight['actions'][number]['id']) => void;
};

export function UnlinkedRelativeCard({
  relative,
  insight,
  kinshipLine,
  onAction,
}: UnlinkedRelativeCardProps) {
  const displayName = getRelativeDisplayName(relative);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AvatarPlaceholder
          name={displayName}
          color={relative.avatarColor}
          photoUrl={relative.photoUrl}
          size={52}
          deceased={relative.isDeceased}
        />
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={2}>
            {displayName}
          </Text>
          {kinshipLine ? (
            <Text style={styles.kinshipLine} numberOfLines={2}>
              {kinshipLine}
            </Text>
          ) : (
            <Text style={styles.role} numberOfLines={1}>
              {relative.relationship}
            </Text>
          )}
        </View>
      </View>

      <Text style={styles.reason}>{formatUnlinkedRelativeReasons(insight.reasons)}</Text>

      <View style={styles.actions}>
        {insight.actions.map((action) => (
          <Pressable
            key={action.id}
            onPress={() => onAction(action.id)}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
            accessibilityRole="button"
            accessibilityLabel={action.label}>
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#E8E0D0',
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '800',
  },
  kinshipLine: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
  },
  role: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  reason: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    lineHeight: 22,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionButton: {
    minHeight: 40,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Palette.greenDeep,
    backgroundColor: '#F4FAF6',
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPressed: {
    opacity: 0.9,
  },
  actionText: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
  },
});
