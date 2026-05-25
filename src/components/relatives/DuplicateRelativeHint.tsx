import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DUPLICATE_RELATIVE_COPY } from '@/constants/duplicate-relative-content';
import type { DuplicateRelativeMatch } from '@/services/duplicate-relative.types';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type DuplicateRelativeHintProps = {
  matches: DuplicateRelativeMatch[];
};

/** Calm duplicate hint — never auto-merges, only guides the user. */
export function DuplicateRelativeHint({ matches }: DuplicateRelativeHintProps) {
  const router = useRouter();
  const topMatch = matches[0];

  if (!topMatch) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{DUPLICATE_RELATIVE_COPY.hintTitle}</Text>
      <Text style={styles.subtitle}>{DUPLICATE_RELATIVE_COPY.hintSubtitle(topMatch.displayName)}</Text>

      {matches.slice(0, 2).map((match) => (
        <Pressable
          key={match.relativeId}
          onPress={() =>
            router.push({
              pathname: '/relative/[id]',
              params: { id: match.relativeId },
            })
          }
          hitSlop={8}
          style={styles.matchRow}>
          <View style={styles.matchText}>
            <Text style={styles.matchName}>{match.displayName}</Text>
            <Text style={styles.matchReason}>{match.reason}</Text>
          </View>
          <Text style={styles.matchLink}>{DUPLICATE_RELATIVE_COPY.viewExisting}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  title: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '800',
    lineHeight: 22,
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 18,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  matchText: {
    flex: 1,
    gap: 2,
  },
  matchName: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  matchReason: {
    ...Typography.caption,
    color: Palette.textMuted,
  },
  matchLink: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
});
