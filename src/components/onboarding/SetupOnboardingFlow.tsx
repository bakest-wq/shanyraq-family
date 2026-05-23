import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SETUP_ONBOARDING_NEXT_LABEL,
  SETUP_ONBOARDING_NEXT_SUBLABEL,
  SETUP_ONBOARDING_SKIP_LABEL,
  SETUP_ONBOARDING_STEPS,
  SetupOnboardingStep,
} from '@/constants/setup-onboarding-content';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useRelatives } from '@/hooks/useRelatives';
import { useSetupOnboarding } from '@/hooks/useSetupOnboarding';
import { familyViewHref } from '@/utils/family-view';
import { MaxContentWidth, Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type SetupOnboardingFlowProps = {
  onFinished?: () => void;
};

export function SetupOnboardingFlow({ onFinished }: SetupOnboardingFlowProps) {
  const router = useRouter();
  const { complete } = useSetupOnboarding();
  const { relatives } = useRelatives();
  const [stepIndex, setStepIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setStepIndex((current) => {
        if (current === 0) {
          return current;
        }

        const hasSelf = relatives.some((relative) => relative.relationship === 'Мен');

        if (!hasSelf) {
          return Math.max(current, 1);
        }

        if (relatives.length < 2) {
          return Math.max(current, 2);
        }

        return Math.max(current, 3);
      });
    }, [relatives]),
  );

  const step = SETUP_ONBOARDING_STEPS[stepIndex];
  const isWelcome = step.id === 'welcome';
  const isLastStep = stepIndex === SETUP_ONBOARDING_STEPS.length - 1;

  const finishOnboarding = useCallback(async () => {
    await complete();
    onFinished?.();
    router.replace('/(tabs)');
  }, [complete, onFinished, router]);

  const handleSkip = () => {
    void finishOnboarding();
  };

  const goToNextStep = () => {
    if (isLastStep) {
      void finishOnboarding();
      return;
    }

    setStepIndex((current) => Math.min(current + 1, SETUP_ONBOARDING_STEPS.length - 1));
  };

  const handlePrimaryAction = () => {
    if (isWelcome) {
      goToNextStep();
      return;
    }

    if (step.id === 'step1') {
      router.push({
        pathname: '/add-relative',
        params: { relationship: 'Мен', fromSetup: '1' },
      });
      return;
    }

    if (step.id === 'step2') {
      router.push({
        pathname: '/add-relative',
        params: { fromSetup: '2' },
      });
      return;
    }

    if (step.id === 'step3') {
      void finishOnboarding();
      router.replace(familyViewHref('tree'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          {step.progress ? (
            <View style={styles.progressWrap}>
              <Text style={styles.progressText}>
                {step.progress}/{step.progressTotal}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(step.progress / (step.progressTotal ?? 3)) * 100}%` },
                  ]}
                />
              </View>
            </View>
          ) : (
            <View style={styles.progressSpacer} />
          )}

          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={SETUP_ONBOARDING_SKIP_LABEL}>
            <Text style={styles.skipText}>{SETUP_ONBOARDING_SKIP_LABEL}</Text>
            <Text style={styles.skipSubtext}>Later · позже</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <StepIllustration step={step} />

          <View style={styles.copyBlock}>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.subtitle}>{step.subtitle}</Text>
            <Text style={styles.subtitleRu}>{step.subtitleRu}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label={step.actionLabel}
            sublabel={step.actionSublabel}
            variant="green"
            onPress={handlePrimaryAction}
          />

          {!isWelcome && !isLastStep ? (
            <Pressable
              onPress={goToNextStep}
              style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
              accessibilityRole="button">
              <Text style={styles.nextLabel}>{SETUP_ONBOARDING_NEXT_LABEL}</Text>
              <Text style={styles.nextSubLabel}>{SETUP_ONBOARDING_NEXT_SUBLABEL}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

type StepIllustrationProps = {
  step: SetupOnboardingStep;
};

function StepIllustration({ step }: StepIllustrationProps) {
  return (
    <View style={styles.illustrationWrap}>
      <View style={styles.shapeBack} />
      <View style={styles.shapeAccent} />
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{step.icon}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  progressWrap: {
    flex: 1,
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  progressSpacer: {
    flex: 1,
  },
  progressText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Palette.creamDark,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Palette.greenMid,
  },
  skipButton: {
    alignItems: 'flex-end',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  skipText: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    fontWeight: '700',
  },
  skipSubtext: {
    ...Typography.caption,
    color: Palette.textMuted,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  illustrationWrap: {
    alignSelf: 'center',
    width: 160,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeBack: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Palette.goldLight,
    backgroundColor: Palette.white,
    ...Shadow.soft,
  },
  shapeAccent: {
    position: 'absolute',
    top: 12,
    right: 18,
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    backgroundColor: Palette.goldLight,
    opacity: 0.7,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: Radius.full,
    backgroundColor: Palette.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
  },
  icon: {
    fontSize: 42,
  },
  copyBlock: {
    gap: Spacing.sm,
    alignItems: 'center',
  },
  title: {
    ...Typography.title,
    color: Palette.greenDeep,
    textAlign: 'center',
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  subtitleRu: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: Spacing.sm,
  },
  nextButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.goldLight,
  },
  nextLabel: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  nextSubLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  pressed: {
    opacity: 0.88,
  },
});
