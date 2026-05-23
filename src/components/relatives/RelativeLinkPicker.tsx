import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type RelativeLinkPickerProps = {
  label: string;
  sublabel: string;
  selectedId: string | null | undefined;
  candidates: Relative[];
  onSelect: (id: string | null) => void;
};

export function RelativeLinkPicker({
  label,
  sublabel,
  selectedId,
  candidates,
  onSelect,
}: RelativeLinkPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sublabel}>{sublabel}</Text>
      <Pressable onPress={() => onSelect(null)} style={styles.noneChip}>
        <Text style={[styles.noneText, selectedId == null && styles.noneTextSelected]}>
          Не выбрано
        </Text>
      </Pressable>
      <View style={styles.grid}>
        {candidates.map((candidate) => {
          const selected = selectedId === candidate.id;
          return (
            <Pressable
              key={candidate.id}
              onPress={() => onSelect(candidate.id)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}>
              <Text style={[styles.chipName, selected && styles.chipNameSelected]} numberOfLines={2}>
                {getRelativeDisplayName(candidate)}
              </Text>
              <Text style={[styles.chipRole, selected && styles.chipRoleSelected]}>
                {candidate.relationship}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  sublabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  noneChip: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  noneText: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  noneTextSelected: {
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    minWidth: '47%',
    flexGrow: 1,
    backgroundColor: Palette.cream,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    padding: Spacing.sm,
    gap: 2,
    minHeight: 56,
  },
  chipSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  chipPressed: {
    opacity: 0.9,
  },
  chipName: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  chipNameSelected: {
    color: Palette.white,
  },
  chipRole: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  chipRoleSelected: {
    color: Palette.goldLight,
  },
});
