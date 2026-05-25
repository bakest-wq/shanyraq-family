import { StyleSheet, Text, View } from 'react-native';

import { EMPTY_STATE_COPY } from '@/constants/empty-state-content';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

import { RelativeProfileSection } from './RelativeProfileSection';

type RelativeProfileNotesSectionProps = {
  notes?: string;
};

export function RelativeProfileNotesSection({ notes }: RelativeProfileNotesSectionProps) {
  const trimmedNotes = notes?.trim();

  return (
    <RelativeProfileSection title="Ескертпе · Заметки" subtitle="Отбасыға арналған естелік">
      {trimmedNotes ? (
        <View style={styles.noteCard}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.noteText}>{trimmedNotes}</Text>
        </View>
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>{EMPTY_STATE_COPY.notes.title}</Text>
          <Text style={styles.emptyText}>{EMPTY_STATE_COPY.notes.hint}</Text>
        </View>
      )}
    </RelativeProfileSection>
  );
}

const styles = StyleSheet.create({
  noteCard: {
    backgroundColor: Palette.cream,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.creamDark,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  quoteMark: {
    ...Typography.hero,
    color: Palette.goldLight,
    lineHeight: 28,
    fontWeight: '700',
  },
  noteText: {
    ...Typography.body,
    color: Palette.textPrimary,
    lineHeight: 28,
    fontWeight: '500',
  },
  emptyWrap: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
