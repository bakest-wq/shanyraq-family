import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { RelativeFilter } from '@/utils/relatives-filters';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type FilterChip = {
  id: RelativeFilter;
  label: string;
};

type FilterChipsProps = {
  options: FilterChip[];
  value: RelativeFilter;
  onChange: (value: RelativeFilter) => void;
};

export function FilterChips({ options, value, onChange }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {options.map((option) => {
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
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {option.label}
            </Text>
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
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    backgroundColor: Palette.white,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  chipPressed: {
    opacity: 0.9,
  },
  chipText: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: Palette.white,
  },
});
