import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { TIMELINE_COPY } from '@/constants/timeline-content';
import { getKinshipCardLine } from '@/services/kinship.service';
import type { Relative } from '@/types/relative';
import { TimelineEvent, getTimelineEventTypeOption } from '@/types/timeline';
import { formatTimelineEventDate } from '@/utils/timeline-events';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type TimelineEventCardProps = {
  event: TimelineEvent;
  anchorPerson?: Relative | null;
  relatives?: Relative[];
  onPress?: (relativeId: string) => void;
};

export function TimelineEventCard({
  event,
  anchorPerson,
  relatives = [],
  onPress,
}: TimelineEventCardProps) {
  const typeOption = getTimelineEventTypeOption(event.type);
  const typeLabel = TIMELINE_COPY.types[event.type] ?? typeOption.label;
  const dateLabel = formatTimelineEventDate(event);
  const primaryRelativeId = event.relativeIds[0];

  const relativesLine = useMemo(() => {
    if (event.relativeNames.length === 0) {
      return null;
    }

    if (!anchorPerson || relatives.length === 0) {
      return event.relativeNames.join(' · ');
    }

    return event.relativeIds
      .map((relativeId, index) => {
        const name = event.relativeNames[index] ?? '';
        const person = relatives.find((relative) => relative.id === relativeId);
        if (!person || person.id === anchorPerson.id) {
          return name;
        }

        return `${name} · ${getKinshipCardLine(anchorPerson, person, relatives)}`;
      })
      .join(' · ');
  }, [anchorPerson, event.relativeIds, event.relativeNames, relatives]);

  const content = (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeIcon}>{typeOption.icon}</Text>
          <Text style={styles.typeLabel}>{typeLabel}</Text>
        </View>
        {dateLabel ? <Text style={styles.date}>{dateLabel}</Text> : null}
      </View>

      <Text style={styles.title}>{event.title}</Text>

      {relativesLine ? (
        <Text style={styles.relatives} numberOfLines={2}>
          {relativesLine}
        </Text>
      ) : null}

      {event.description ? (
        <Text style={styles.description} numberOfLines={3}>
          {event.description}
        </Text>
      ) : null}
    </Card>
  );

  if (!primaryRelativeId || !onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={() => onPress(primaryRelativeId)}
      style={({ pressed }) => [pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={event.title}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.creamDark,
    backgroundColor: Palette.white,
  },
  pressed: {
    opacity: 0.92,
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
    fontWeight: '800',
  },
  date: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
  },
  title: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
    lineHeight: 24,
  },
  relatives: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 20,
  },
  description: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    lineHeight: 22,
    backgroundColor: Palette.cream,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
