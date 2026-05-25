import { StyleSheet, Text, View } from 'react-native';

import { SHEZHIRE_JURT } from '@/constants/family-ux-content';
import { CALM_UX } from '@/constants/calm-ux';
import { AnimatedPressable } from '@/components/ui/motion/AnimatedPressable';
import type { JurtKind } from '@/utils/jurt-grouping';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

const JURT_OPTIONS: Array<{ id: JurtKind; label: string }> = [
  { id: 'oz', label: SHEZHIRE_JURT.tabs.oz },
  { id: 'nagashy', label: SHEZHIRE_JURT.tabs.nagashy },
  { id: 'kayin', label: SHEZHIRE_JURT.tabs.kayin },
];

type JurtViewTabsProps = {
  value: JurtKind;
  counts?: Partial<Record<JurtKind, number>>;
  contextText?: string;
  onChange: (value: JurtKind) => void;
};

export function JurtViewTabs({ value, counts, contextText, onChange }: JurtViewTabsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.wrap}>
        {JURT_OPTIONS.map((option) => {
          const selected = value === option.id;
          const count = counts?.[option.id] ?? 0;

          return (
            <AnimatedPressable
              key={option.id}
              onPress={() => onChange(option.id)}
              style={[styles.tab, selected && styles.tabSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}>
              <Text style={[styles.tabText, selected && styles.tabTextSelected]} numberOfLines={2}>
                {option.label}
              </Text>
              {count > 0 ? (
                <Text style={[styles.count, selected && styles.countSelected]}>{count}</Text>
              ) : null}
            </AnimatedPressable>
          );
        })}
      </View>
      {contextText ? <Text style={styles.contextHeader}>{contextText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  wrap: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  contextHeader: {
    ...Typography.caption,
    color: Palette.textMuted,
    lineHeight: 21,
    paddingHorizontal: Spacing.sm,
    opacity: CALM_UX.polish.mutedTextOpacity,
  },
  tab: {
    flex: 1,
    minHeight: CALM_UX.polish.comfortableTouch + 8,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: CALM_UX.polish.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
    gap: 3,
  },
  tabSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.goldLight,
  },
  tabText: {
    ...Typography.caption,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  tabTextSelected: {
    color: Palette.white,
    fontWeight: '700',
  },
  count: {
    ...Typography.caption,
    color: Palette.textMuted,
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 13,
    opacity: 0.65,
  },
  countSelected: {
    color: '#C8DDD0',
    opacity: 0.8,
  },
});
