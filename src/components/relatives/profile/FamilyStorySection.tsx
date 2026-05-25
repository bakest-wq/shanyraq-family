import { StyleSheet, Text, View } from 'react-native';

import { RelativeProfileSection } from '@/components/relatives/profile/RelativeProfileSection';
import { FAMILY_STORY_COPY } from '@/constants/family-story-content';
import type { FamilyStorySnapshot } from '@/services/family-story/family-story.types';
import { Palette, Spacing, Typography } from '@/constants/theme';

type FamilyStorySectionProps = {
  story: FamilyStorySnapshot;
};

/** Quiet narrative block — only rendered inside profile disclosure when lines exist. */
export function FamilyStorySection({ story }: FamilyStorySectionProps) {
  const lines = [story.fromRoot, story.forChildren].filter(Boolean) as string[];

  if (lines.length === 0) {
    return null;
  }

  return (
    <RelativeProfileSection
      title={FAMILY_STORY_COPY.sectionTitle}
      subtitle={FAMILY_STORY_COPY.sectionSubtitle}>
      <View style={styles.lines}>
        {lines.map((line) => (
          <Text
            key={line}
            style={[
              styles.line,
              story.tone === 'memorial' ? styles.memorialLine : styles.warmLine,
            ]}>
            {line}
          </Text>
        ))}
      </View>
    </RelativeProfileSection>
  );
}

const styles = StyleSheet.create({
  lines: {
    gap: Spacing.sm,
  },
  line: {
    ...Typography.body,
    lineHeight: 24,
  },
  warmLine: {
    color: Palette.textPrimary,
  },
  memorialLine: {
    color: Palette.textSecondary,
    fontStyle: 'italic',
  },
});
