import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { TimelineEvent, getTimelineEventTypeOption } from '@/types/timeline';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type TimelineEventCardProps = {
  event: TimelineEvent;
};

function formatEventDate(event: TimelineEvent): string | null {
  if (event.day && event.month) {
    return `${String(event.day).padStart(2, '0')}.${String(event.month).padStart(2, '0')}`;
  }

  if (event.month) {
    return `${String(event.month).padStart(2, '0')} ай`;
  }

  return null;
}

export function TimelineEventCard({ event }: TimelineEventCardProps) {
  const typeOption = getTimelineEventTypeOption(event.type);
  const dateLabel = formatEventDate(event);

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeIcon}>{typeOption.icon}</Text>
          <Text style={styles.typeLabel}>
            {typeOption.labelKz} · {typeOption.labelRu}
          </Text>
        </View>
        {event.source === 'auto' ? (
          <Text style={styles.autoBadge}>Авто</Text>
        ) : null}
      </View>

      <Text style={styles.title}>{event.title}</Text>
      {event.titleRu !== event.title ? (
        <Text style={styles.titleRu}>{event.titleRu}</Text>
      ) : null}

      {dateLabel ? <Text style={styles.date}>{dateLabel}</Text> : null}

      {event.relativeNames.length > 0 ? (
        <Text style={styles.relatives} numberOfLines={2}>
          👤 {event.relativeNames.join(' · ')}
        </Text>
      ) : null}

      {event.description ? (
        <Text style={styles.description} numberOfLines={4}>
          {event.description}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.creamDark,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  typeIcon: {
    fontSize: 18,
  },
  typeLabel: {
    ...Typography.caption,
    color: Palette.greenMid,
    fontWeight: '700',
    flexShrink: 1,
  },
  autoBadge: {
    ...Typography.caption,
    color: Palette.textMuted,
    fontWeight: '700',
    backgroundColor: Palette.cream,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  title: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
    lineHeight: 22,
  },
  titleRu: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 20,
  },
  date: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
  },
  relatives: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  description: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    lineHeight: 20,
  },
});
