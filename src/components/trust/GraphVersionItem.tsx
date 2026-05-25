import { StyleSheet, Text, View, Pressable } from 'react-native';

import { GRAPH_VERSION_COPY } from '@/constants/graph-version-content';
import type { GraphVersionEntry } from '@/types/graph-version';
import { formatEditTimestamp } from '@/utils/edit-history-snapshot';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type GraphVersionItemProps = {
  entry: GraphVersionEntry;
  canRestore: boolean;
  compact?: boolean;
  onRestore?: (versionId: string) => void;
};

function kindLabel(kind: GraphVersionEntry['kind']): string {
  switch (kind) {
    case 'restore':
      return GRAPH_VERSION_COPY.kindRestore;
    case 'change':
    default:
      return GRAPH_VERSION_COPY.kindChange;
  }
}

export function GraphVersionItem({
  entry,
  canRestore,
  compact = false,
  onRestore,
}: GraphVersionItemProps) {
  const showRestore = canRestore && onRestore && entry.kind === 'change';

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.headerRow}>
        <Text style={styles.kindBadge}>{kindLabel(entry.kind)}</Text>
        <Text style={styles.time}>{formatEditTimestamp(entry.at)}</Text>
      </View>

      <Text style={styles.summary} numberOfLines={compact ? 2 : undefined}>
        {entry.summary}
      </Text>

      <Text style={styles.meta}>
        {GRAPH_VERSION_COPY.relativeCount(entry.relativeCount)} · {entry.actor.displayName}
      </Text>

      {showRestore ? (
        <Pressable onPress={() => onRestore(entry.id)} hitSlop={8} style={styles.restoreLink}>
          <Text style={styles.restoreText}>{GRAPH_VERSION_COPY.restore}</Text>
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
  cardCompact: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  kindBadge: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
    backgroundColor: '#F4FAF6',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  time: {
    ...Typography.caption,
    color: Palette.textMuted,
    flexShrink: 1,
    textAlign: 'right',
  },
  summary: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '600',
    lineHeight: 20,
  },
  meta: {
    ...Typography.caption,
    color: Palette.textSecondary,
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
