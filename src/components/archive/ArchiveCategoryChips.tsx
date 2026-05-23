import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { ArchiveCategoryFilter } from '@/types/archive';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type CategoryOption = {
  id: ArchiveCategoryFilter;
  label: string;
};

type ArchiveCategoryChipsProps = {
  options: CategoryOption[];
  value: ArchiveCategoryFilter;
  onChange: (value: ArchiveCategoryFilter) => void;
};

export function ArchiveCategoryChips({ options, value, onChange }: ArchiveCategoryChipsProps) {
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
