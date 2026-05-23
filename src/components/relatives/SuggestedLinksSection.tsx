import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useRelationshipSuggestions } from '@/hooks/useRelationshipSuggestions';
import type { AnalyzeSuggestionsContext } from '@/utils/relationship-suggestions';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type SuggestedLinksSectionProps = AnalyzeSuggestionsContext & {
  limit?: number;
};

export function SuggestedLinksSection({
  limit = 2,
  ...context
}: SuggestedLinksSectionProps) {
  const { suggestions, acceptingId, acceptSuggestion, dismissSuggestion, loading } =
    useRelationshipSuggestions({
      ...context,
      limit,
      highConfidenceOnly: true,
    });

  if (loading || suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {suggestions.map((suggestion) => {
        const busy = acceptingId === suggestion.id;

        return (
          <View key={suggestion.id} style={styles.row}>
            <Text style={styles.context}>{suggestion.contextKz}</Text>
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => void acceptSuggestion(suggestion)}
                disabled={busy}
                style={({ pressed }) => [
                  styles.chip,
                  (pressed || busy) && styles.chipPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={suggestion.promptKz}>
                <Text style={styles.chipText}>{busy ? 'Сақталуда...' : suggestion.promptKz}</Text>
              </Pressable>

              <Pressable
                onPress={() => void dismissSuggestion(suggestion)}
                disabled={busy}
                style={({ pressed }) => [styles.dismissButton, pressed && styles.chipPressed]}
                accessibilityRole="button"
                accessibilityLabel="Жабу">
                <Text style={styles.dismissText}>×</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  row: {
    gap: 6,
    paddingVertical: Spacing.xs,
  },
  context: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  chip: {
    flex: 1,
    backgroundColor: Palette.cream,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipText: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
    lineHeight: 20,
  },
  dismissButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.creamDark,
  },
  dismissText: {
    fontSize: 20,
    lineHeight: 22,
    color: Palette.textMuted,
    fontWeight: '600',
  },
});
