import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import type { SiblingParentInheritanceOffer } from '@/utils/sibling-parent-inheritance';
import { formatInheritedParentsSummary } from '@/utils/sibling-parent-inheritance';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type SiblingParentInheritanceCardProps = {
  offer: SiblingParentInheritanceOffer;
  onAccept: () => void;
  onChange: () => void;
  onSkip: () => void;
};

export function SiblingParentInheritanceCard({
  offer,
  onAccept,
  onChange,
  onSkip,
}: SiblingParentInheritanceCardProps) {
  return (
    <Card goldBorder style={styles.card}>
      <Text style={styles.title}>Ортақ ата-ананы қолдану?</Text>
      <Text style={styles.summary}>
        Бұл туыс сізбен бауыр болғандықтан, ата-анаңыз автоматты түрде ұсынылды.
      </Text>
      <View style={styles.parentsBox}>
        <Text style={styles.parentsLabel}>Ұсынылған ата-ана</Text>
        <Text style={styles.parentsValue}>{formatInheritedParentsSummary(offer)}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onAccept}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Қолдану · Use">
          <Text style={styles.primaryButtonText}>Қолдану · Use</Text>
        </Pressable>

        <Pressable
          onPress={onChange}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Өзгерту · Change">
          <Text style={styles.secondaryButtonText}>Өзгерту · Change</Text>
        </Pressable>

        <Pressable
          onPress={onSkip}
          style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Өткізу · Skip">
          <Text style={styles.ghostButtonText}>Өткізу · Skip</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
    backgroundColor: '#FFF9EB',
  },
  title: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '800',
    textAlign: 'center',
  },
  summary: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
  },
  parentsBox: {
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  parentsLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
  },
  parentsValue: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  actions: {
    gap: Spacing.sm,
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
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.greenDeep,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  secondaryButtonText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  ghostButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  ghostButtonText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
  },
});
