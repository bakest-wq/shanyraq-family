import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { useRelationshipSuggestions } from '@/hooks/useRelationshipSuggestions';
import type { AnalyzeSuggestionsContext } from '@/utils/relationship-suggestions';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type SuggestedLinksSectionProps = AnalyzeSuggestionsContext & {
  limit?: number;
  compact?: boolean;
};

export function SuggestedLinksSection({
  limit = 5,
  compact = false,
  ...context
}: SuggestedLinksSectionProps) {
  const { suggestions, acceptingId, acceptSuggestion, dismissSuggestion, loading } =
    useRelationshipSuggestions({
      ...context,
      limit,
    });

  if (loading || suggestions.length === 0) {
    return null;
  }

  return (
    <Card goldBorder style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>🌿</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>Ұсынылған байланыстар</Text>
          <Text style={styles.subtitle}>Suggested links · автоматты ұсыныстар</Text>
        </View>
      </View>

      <View style={styles.list}>
        {suggestions.map((suggestion) => {
          const isNote = suggestion.kind === 'note_shared_parents';
          const busy = acceptingId === suggestion.id;

          return (
            <View key={suggestion.id} style={[styles.item, compact && styles.itemCompact]}>
              <Text style={styles.message}>{suggestion.messageKz}</Text>
              {!compact ? (
                <Text style={styles.messageRu}>{suggestion.messageRu}</Text>
              ) : null}

              <View style={styles.actions}>
                {!isNote ? (
                  <Pressable
                    onPress={() => void acceptSuggestion(suggestion)}
                    disabled={busy}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.acceptButton,
                      (pressed || busy) && styles.actionPressed,
                    ]}>
                    <Text style={styles.acceptText}>
                      {busy ? 'Сақталуда...' : 'Қабылдау · Accept'}
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  onPress={() => void dismissSuggestion(suggestion)}
                  disabled={busy}
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.dismissButton,
                    pressed && styles.actionPressed,
                  ]}>
                  <Text style={styles.dismissText}>Бас тарту · Dismiss</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  list: {
    gap: Spacing.sm,
  },
  item: {
    backgroundColor: Palette.white,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  itemCompact: {
    padding: Spacing.sm,
  },
  message: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
    lineHeight: 22,
  },
  messageRu: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionButton: {
    minHeight: 44,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  acceptButton: {
    backgroundColor: Palette.greenDeep,
  },
  dismissButton: {
    backgroundColor: Palette.cream,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
  },
  actionPressed: {
    opacity: 0.9,
  },
  acceptText: {
    ...Typography.caption,
    color: Palette.white,
    fontWeight: '700',
  },
  dismissText: {
    ...Typography.caption,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
});
