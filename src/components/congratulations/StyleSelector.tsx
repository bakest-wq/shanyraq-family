import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import {
  CONGRATULATIONS_STYLES,
  CongratulationsStyle,
} from '@/types/congratulations';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type StyleSelectorProps = {
  value: CongratulationsStyle;
  onChange: (style: CongratulationsStyle) => void;
};

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {CONGRATULATIONS_STYLES.map((option) => {
        const selected = value === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}>
            <Text style={styles.emoji}>{option.emoji}</Text>
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    minWidth: 132,
    minHeight: 72,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    ...Shadow.soft,
  },
  chipSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  chipPressed: {
    opacity: 0.9,
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    ...Typography.caption,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  labelSelected: {
    color: Palette.white,
  },
});
