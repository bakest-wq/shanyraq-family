import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import {
  FamilyMemory,
  getMemoryTypeLabel,
  getMemoryTypeOption,
  memoryHasDisplayPhoto,
} from '@/types/archive';
import { formatMemoryDateLabel } from '@/utils/memory-format';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type FamilyMemoryCardProps = {
  memory: FamilyMemory;
  compact?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function FamilyMemoryCard({
  memory,
  compact = false,
  onPress,
  onLongPress,
}: FamilyMemoryCardProps) {
  const typeOption = getMemoryTypeOption(memory.category);
  const showPhoto = memoryHasDisplayPhoto(memory) && Boolean(memory.photoUri);
  const cardStyle = compact ? StyleSheet.flatten([styles.card, styles.cardCompact]) : styles.card;

  const media = showPhoto ? (
    <View style={[styles.photoWrap, compact && styles.photoWrapCompact]}>
      <Image source={{ uri: memory.photoUri }} style={styles.photo} resizeMode="cover" />
      <View style={styles.photoBadge}>
        <Text style={styles.photoBadgeText}>{typeOption.icon}</Text>
      </View>
    </View>
  ) : (
    <View style={[styles.placeholderWrap, compact && styles.placeholderWrapCompact]}>
      <Text style={styles.placeholderIcon}>{typeOption.icon}</Text>
      <Text style={styles.placeholderLabel}>{getMemoryTypeLabel(memory.category)}</Text>
    </View>
  );

  const content = (
    <>
      {media}

      <View style={styles.body}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{getMemoryTypeLabel(memory.category)}</Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={2}>
            {memory.title}
          </Text>
          <Text style={styles.date}>{formatMemoryDateLabel(memory)}</Text>
        </View>

        <Text style={styles.relativeName} numberOfLines={1}>
          👤 {memory.relativeName}
        </Text>

        {memory.story ? (
          <Text
            style={[styles.description, compact && styles.descriptionCompact]}
            numberOfLines={compact ? 2 : 4}>
            {memory.story}
          </Text>
        ) : null}
      </View>
    </>
  );

  const card = (
    <Card goldBorder style={cardStyle}>
      {content}
    </Card>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [pressed && styles.pressed]}>
        {card}
      </Pressable>
    );
  }

  return card;
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
    height: 180,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Palette.creamDark,
  },
  photoWrapCompact: {
    height: 132,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(27, 67, 50, 0.78)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  photoBadgeText: {
    fontSize: 16,
  },
  placeholderWrap: {
    height: 120,
    borderRadius: Radius.md,
    backgroundColor: Palette.creamDark,
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  placeholderWrapCompact: {
    height: 96,
  },
  placeholderIcon: {
    fontSize: 32,
  },
  placeholderLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  body: {
    gap: Spacing.sm,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.cream,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Palette.goldLight,
  },
  typeBadgeText: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
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
  date: {
    ...Typography.bodySmall,
    color: Palette.gold,
    fontWeight: '700',
  },
  relativeName: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    fontWeight: '700',
  },
  description: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 24,
  },
  descriptionCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
});
