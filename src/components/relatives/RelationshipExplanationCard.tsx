import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { HelperHintBanner } from '@/components/ui/HelperHintBanner';
import { SECTION_HELPER_TEXT } from '@/constants/family-ux-content';
import { Relative } from '@/types/relative';
import { getKinshipExplanation } from '@/services/kinship.service';
import { resolveShezhireRootPerson } from '@/utils/shezhire-parent-lookup';
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

  const root = resolveShezhireRootPerson(personA, relatives) ?? personA;
  const explanation = getKinshipExplanation(root, personB, relatives);
  const resolved =
    explanation.result.type !== 'unknown' && explanation.result.resolved !== false;

  return (
    <Card goldBorder style={styles.card}>
      <Text style={styles.title}>{explanation.title}</Text>
      <View style={styles.quoteWrap}>
        <Text
          style={[
            styles.kazakhText,
            !resolved && styles.unresolvedText,
          ]}>
          {explanation.summary}
        </Text>
      </View>

      {explanation.hint ? (
        <Text style={styles.hint}>{explanation.hint}</Text>
      ) : null}

      <HelperHintBanner
        icon="🌿"
        text={SECTION_HELPER_TEXT.relationshipExplanation.text}
        tone="cream"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  title: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '800',
    textAlign: 'center',
  },
  quoteWrap: {
    backgroundColor: Palette.cream,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  kazakhText: {
    ...Typography.body,
    color: Palette.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
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
