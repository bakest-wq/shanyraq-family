import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TimelineEventType, TimelineEventTypeOption } from '@/types/timeline';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type TimelineEventTypeChipsProps = {
  options: TimelineEventTypeOption[];
  value: TimelineEventType;
  onChange: (value: TimelineEventType) => void;
};

export function TimelineEventTypeChips({
  options,
  value,
  onChange,
}: TimelineEventTypeChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {options.map((option) => {
        const selected = option.id === value;

        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}>
            <Text style={styles.chipIcon}>{option.icon}</Text>
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {option.labelKz}
            </Text>
            <Text style={[styles.chipSub, selected && styles.chipSubSelected]}>
              {option.labelRu}
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
    minWidth: 108,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  chipSelected: {
    borderColor: Palette.gold,
    backgroundColor: '#FFF9EB',
  },
  chipPressed: {
    opacity: 0.92,
  },
  chipIcon: {
    fontSize: 18,
  },
  chipText: {
    ...Typography.caption,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: Palette.greenDeep,
  },
  chipSub: {
    ...Typography.caption,
    color: Palette.textMuted,
    fontSize: 11,
  },
  chipSubSelected: {
    color: Palette.textSecondary,
  },
});
