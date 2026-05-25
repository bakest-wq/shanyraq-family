import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { bilingual, FAMILY_LANGUAGE, kk } from '@/content/family-language';
import type { GuidedFamilyStep, GuidedLinkAction } from '@/services/guided-family-builder.service';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type GuidedLinkingAssistantProps = {
  step: GuidedFamilyStep;
  onPrimary: (action: GuidedLinkAction) => void;
  onSkip: (stepId: string) => void;
};

export function GuidedLinkingAssistant({ step, onPrimary, onSkip }: GuidedLinkingAssistantProps) {
  const isInfoOnly = step.kind === 'info' || step.primaryLabel === kk(FAMILY_LANGUAGE.guided.skip);

  return (
    <Card goldBorder style={styles.card}>
      <Text style={styles.title}>{kk(FAMILY_LANGUAGE.guided.cardTitle)}</Text>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.explanation}>{step.explanation}</Text>
      <Text style={styles.explanationRu}>{step.explanationRu}</Text>

      <View style={styles.actions}>
        {!isInfoOnly ? (
          <Pressable
            onPress={() => onPrimary(step.primaryAction)}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>{step.primaryLabel}</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => onSkip(step.id)}
          style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
          accessibilityRole="button">
          <Text style={styles.skipButtonText}>
            {isInfoOnly ? bilingual(FAMILY_LANGUAGE.guided.skip) : step.skipLabel}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
    backgroundColor: '#FAFCF7',
  },
  title: {
    ...Typography.caption,
    color: Palette.greenMid,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  stepTitle: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  explanation: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    lineHeight: 22,
  },
  explanationRu: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 20,
  },
  actions: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  primaryButtonText: {
    ...Typography.bodySmall,
    color: Palette.white,
    fontWeight: '700',
    textAlign: 'center',
  },
  skipButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  skipButtonText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
  },
});
