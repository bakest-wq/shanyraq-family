import { StyleSheet, Text, View, Pressable } from 'react-native';

import { EDIT_HISTORY_COPY } from '@/constants/edit-history-content';
import type { EditEvent } from '@/types/edit-history';
import { formatEditTimestamp } from '@/utils/edit-history-snapshot';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type EditHistoryItemProps = {
  event: EditEvent;
  canRestore: boolean;
  onRestore?: (eventId: string) => void;
};

function actionBadgeLabel(event: EditEvent): string {
  switch (event.action) {
    case 'create':
      return EDIT_HISTORY_COPY.actionCreate;
    case 'update':
      return EDIT_HISTORY_COPY.actionUpdate;
    case 'delete':
      return EDIT_HISTORY_COPY.actionDelete;
    case 'restore':
      return EDIT_HISTORY_COPY.actionRestore;
  }
}

function entityBadgeLabel(event: EditEvent): string {
  return event.entityType === 'relative'
    ? EDIT_HISTORY_COPY.relativeLabel
    : EDIT_HISTORY_COPY.memoryLabel;
}

export function EditHistoryItem({ event, canRestore, onRestore }: EditHistoryItemProps) {
  const showRestore = canRestore && onRestore;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badges}>
          <Text style={styles.entityBadge}>{entityBadgeLabel(event)}</Text>
          <Text style={styles.actionBadge}>{actionBadgeLabel(event)}</Text>
        </View>
        <Text style={styles.time}>{formatEditTimestamp(event.at)}</Text>
      </View>

      <Text style={styles.entityLabel}>{event.entityLabel}</Text>
      <Text style={styles.summary}>{event.summary}</Text>

      <Text style={styles.actor}>
        {EDIT_HISTORY_COPY.actorLine(event.actor.displayName)}
      </Text>

      {showRestore ? (
        <Pressable onPress={() => onRestore(event.id)} hitSlop={8} style={styles.restoreLink}>
          <Text style={styles.restoreText}>{EDIT_HISTORY_COPY.restore}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#ECE6DA',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    flex: 1,
  },
  entityBadge: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
    backgroundColor: '#F4FAF6',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  actionBadge: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
    backgroundColor: Palette.cream,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  time: {
    ...Typography.caption,
    color: Palette.textMuted,
    maxWidth: 120,
    textAlign: 'right',
  },
  entityLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '800',
  },
  summary: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 20,
  },
  actor: {
    ...Typography.caption,
    color: Palette.greenMid,
    fontWeight: '600',
  },
  restoreLink: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  restoreText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
});
