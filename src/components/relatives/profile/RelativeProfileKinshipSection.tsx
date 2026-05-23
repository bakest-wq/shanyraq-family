import { StyleSheet, Text, View } from 'react-native';

import { HelperHintBanner } from '@/components/ui/HelperHintBanner';
import { RelativeProfileSection } from '@/components/relatives/profile/RelativeProfileSection';
import { Relative } from '@/types/relative';
import { explainKinshipToMe } from '@/utils/kinship/explainKinship';
import { formatKinshipCardLine } from '@/utils/kinship/labels.kz';
import { Palette, Spacing, Typography } from '@/constants/theme';

type RelativeProfileKinshipSectionProps = {
  anchorPerson: Relative | null;
  relative: Relative;
  relatives: Relative[];
};

export function RelativeProfileKinshipSection({
  anchorPerson,
  relative,
  relatives,
}: RelativeProfileKinshipSectionProps) {
  if (!anchorPerson) {
    return null;
  }

  const explanation = explainKinshipToMe(anchorPerson, relative, relatives);
  const cardLine = formatKinshipCardLine(explanation.result);

  return (
    <RelativeProfileSection
      title="Маған кім болады?"
      subtitle="Орталық тұлғаға қатысты есептелген байланыс">
      <View style={styles.card}>
        <Text style={styles.label}>{explanation.title}</Text>
        <Text style={styles.cardLine}>{cardLine}</Text>
        {explanation.result.label.subtitle ? (
          <Text style={styles.subtitle}>{explanation.result.label.subtitle}</Text>
        ) : null}
        <Text style={styles.summary}>{explanation.summary}</Text>
        {explanation.pathText ? (
          <Text style={styles.path}>{explanation.pathText}</Text>
        ) : null}
      </View>
      {explanation.hint ? (
        <HelperHintBanner icon="ℹ️" text={explanation.hint} tone="cream" />
      ) : null}
    </RelativeProfileSection>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
    backgroundColor: Palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.creamDark,
    padding: Spacing.md,
  },
  label: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  cardLine: {
    ...Typography.bodySmall,
    color: Palette.gold,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  summary: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    lineHeight: 22,
  },
  path: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 20,
  },
});
