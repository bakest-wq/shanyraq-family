import { StyleSheet, Text, View } from 'react-native';

import { RelativeProfileSection } from '@/components/relatives/profile/RelativeProfileSection';
import { RELATIVE_PROFILE_COPY } from '@/constants/relative-profile-content';
import { Relative } from '@/types/relative';
import { getKinshipExplanation } from '@/services/kinship.service';
import { Palette, Spacing, Typography } from '@/constants/theme';

type RelativeProfileKinshipSectionProps = {
  anchorPerson: Relative | null;
  relative: Relative;
  relatives: Relative[];
  kinshipLabel?: string | null;
};

export function RelativeProfileKinshipSection({
  anchorPerson,
  relative,
  relatives,
  kinshipLabel,
}: RelativeProfileKinshipSectionProps) {
  if (!anchorPerson || anchorPerson.id === relative.id) {
    return null;
  }

  const explanation = getKinshipExplanation(anchorPerson, relative, relatives);
  const label = kinshipLabel ?? explanation.title;

  if (label === explanation.summary) {
    return null;
  }

  return (
    <RelativeProfileSection title={RELATIVE_PROFILE_COPY.sections.kinship}>
      <View style={styles.card}>
        <Text style={styles.summary}>{explanation.summary}</Text>
      </View>
    </RelativeProfileSection>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.creamDark,
    padding: Spacing.md,
  },
  summary: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    lineHeight: 24,
    textAlign: 'center',
  },
});
