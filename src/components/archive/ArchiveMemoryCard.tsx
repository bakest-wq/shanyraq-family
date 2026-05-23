import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import {
  ARCHIVE_CATEGORY_ICONS,
  ArchiveCategoryId,
  FamilyMemory,
} from '@/types/archive';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type ArchiveMemoryCardProps = {
  memory: FamilyMemory;
  compact?: boolean;
  onPress?: () => void;
};

export function ArchiveMemoryCard({ memory, compact = false, onPress }: ArchiveMemoryCardProps) {
  const icon = ARCHIVE_CATEGORY_ICONS[memory.category];

  const content = (
    <>
      <View style={[styles.photoWrap, compact && styles.photoWrapCompact]}>
        {memory.hasPhoto ? (
          <>
            <Text style={styles.photoIcon}>🖼️</Text>
            <Text style={styles.photoLabel}>Фото</Text>
          </>
        ) : (
          <>
            <Text style={styles.photoIcon}>{icon}</Text>
            <Text style={styles.photoLabel}>Без фото</Text>
          </>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={2}>
            {memory.title}
          </Text>
          <Text style={styles.year}>{memory.year}</Text>
        </View>

        <Text style={styles.relativeName} numberOfLines={1}>
          👤 {memory.relativeName}
        </Text>

        <Text style={[styles.story, compact && styles.storyCompact]} numberOfLines={compact ? 2 : 4}>
          {memory.story}
        </Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        <Card goldBorder style={[styles.card, compact && styles.cardCompact]}>
          {content}
        </Card>
      </Pressable>
    );
  }

  return (
    <Card goldBorder style={[styles.card, compact && styles.cardCompact]}>
      {content}
    </Card>
  );
}

type ArchiveCategoryBadgeProps = {
  category: ArchiveCategoryId;
  label: string;
};

export function ArchiveCategoryBadge({ category, label }: ArchiveCategoryBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeIcon}>{ARCHIVE_CATEGORY_ICONS[category]}</Text>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
    overflow: 'hidden',
  },
  cardCompact: {
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.92,
  },
  photoWrap: {
    height: 160,
    borderRadius: Radius.md,
    backgroundColor: Palette.creamDark,
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  photoWrapCompact: {
    height: 120,
  },
  photoIcon: {
    fontSize: 36,
  },
  photoLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  body: {
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
    flex: 1,
  },
  titleCompact: {
    fontSize: 18,
    lineHeight: 24,
  },
  year: {
    ...Typography.bodySmall,
    color: Palette.gold,
    fontWeight: '700',
  },
  relativeName: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    fontWeight: '700',
  },
  story: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 24,
  },
  storyCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: Palette.cream,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Palette.goldLight,
  },
  badgeIcon: {
    fontSize: 14,
  },
  badgeText: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
});
