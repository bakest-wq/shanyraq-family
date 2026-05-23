import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Relative } from '@/types/relative';
import {
  buildRelationshipExplanation,
  formatRelationshipPath,
} from '@/utils/relationship-engine';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type RelationshipExplanationCardProps = {
  personA: Relative | null;
  personB: Relative | null;
  relatives: Relative[];
};

export function RelationshipExplanationCard({
  personA,
  personB,
  relatives,
}: RelationshipExplanationCardProps) {
  if (!personA || !personB) {
    return null;
  }

  const explanation = buildRelationshipExplanation(personA, personB, relatives);

  return (
    <Card goldBorder style={styles.card}>
      <Text style={styles.title}>Туыстық байланыс · Relationship explanation</Text>
      <View style={styles.quoteWrap}>
        <Text style={styles.leaf}>🌿</Text>
        <Text
          style={[
            styles.kazakhText,
            !explanation.resolved && styles.unresolvedText,
          ]}>
          {explanation.kazakh}
        </Text>
        <Text style={styles.russianText}>{explanation.russian}</Text>
      </View>

      {explanation.hint ? (
        <Text style={styles.hint}>{formatRelationshipPath(explanation.hint)}</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  title: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
  },
  quoteWrap: {
    backgroundColor: Palette.cream,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  leaf: {
    fontSize: 22,
  },
  kazakhText: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
  },
  russianText: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  unresolvedText: {
    color: Palette.textSecondary,
  },
  hint: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
