import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { FamilyMemory, getMemoryTypeLabel, getMemoryTypeOption } from '@/types/archive';
import { formatMemoryDateLabel } from '@/utils/memory-format';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type FamilyMemoryCardProps = {
  memory: FamilyMemory;
  compact?: boolean;
  onPress?: () => void;
};

function getAttachmentLabel(memory: FamilyMemory): { icon: string; label: string } {
  const typeOption = getMemoryTypeOption(memory.category);

  if (memory.hasPhoto || memory.category === 'photo') {
    return { icon: '🖼️', label: 'Фото · Photo' };
  }

  if (memory.hasVoice || memory.category === 'voice') {
    return { icon: '🎙️', label: 'Дауыс · Voice' };
  }

  if (memory.hasDocument || memory.category === 'document') {
    return { icon: '📄', label: 'Құжат · Document' };
  }

  return { icon: typeOption.icon, label: `${typeOption.labelKz} · ${typeOption.labelRu}` };
}

export function FamilyMemoryCard({ memory, compact = false, onPress }: FamilyMemoryCardProps) {
  const attachment = getAttachmentLabel(memory);
  const cardStyle = compact ? StyleSheet.flatten([styles.card, styles.cardCompact]) : styles.card;

  const content = (
    <>
      <View style={[styles.mediaWrap, compact && styles.mediaWrapCompact]}>
        <Text style={styles.mediaIcon}>{attachment.icon}</Text>
        <Text style={styles.mediaLabel}>{attachment.label}</Text>
      </View>

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

        <Text style={[styles.description, compact && styles.descriptionCompact]} numberOfLines={compact ? 2 : 4}>
          {memory.story}
        </Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        <Card goldBorder style={cardStyle}>
          {content}
        </Card>
      </Pressable>
    );
  }

  return (
    <Card goldBorder style={cardStyle}>
      {content}
    </Card>
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
  mediaWrap: {
    height: 148,
    borderRadius: Radius.md,
    backgroundColor: Palette.creamDark,
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  mediaWrapCompact: {
    height: 112,
  },
  mediaIcon: {
    fontSize: 34,
  },
  mediaLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
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
