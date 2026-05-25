import { StyleSheet, Text, View } from 'react-native';

import { ONBOARDING_HINTS } from '@/constants/family-ux-content';
import { EMPTY_STATE_COPY } from '@/constants/empty-state-content';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type OnboardingHintsCardProps = {
  title?: string;
  subtitle?: string;
};

export function OnboardingHintsCard({
  title = EMPTY_STATE_COPY.onboarding.title,
  subtitle = EMPTY_STATE_COPY.onboarding.subtitle,
}: OnboardingHintsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.list}>
        {ONBOARDING_HINTS.map((hint, index) => (
          <View key={hint.text} style={styles.row}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <View style={styles.rowIconWrap}>
              <Text style={styles.rowIcon}>{hint.icon}</Text>
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{hint.text}</Text>
              <Text style={styles.rowSub}>{hint.subtext}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  list: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Palette.cream,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    backgroundColor: Palette.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    ...Typography.caption,
    color: Palette.white,
    fontWeight: '800',
    fontSize: 11,
  },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.goldLight,
  },
  rowIcon: {
    fontSize: 18,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  rowSub: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 18,
  },
});
