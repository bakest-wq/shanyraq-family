import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { FamilyView } from '@/utils/family-view';

const FAMILY_VIEW_OPTIONS: Array<{ id: FamilyView; label: string }> = [
  { id: 'list', label: 'Тізім · Список' },
  { id: 'tree', label: 'Шежіре · Дерево' },
];

type FamilyViewTabsProps = {
  value: FamilyView;
  onChange: (value: FamilyView) => void;
};

export function FamilyViewTabs({ value, onChange }: FamilyViewTabsProps) {
  return (
    <View style={styles.wrap}>
      {FAMILY_VIEW_OPTIONS.map((option) => {
        const selected = value === option.id;

        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={({ pressed }) => [
              styles.tab,
              selected && styles.tabSelected,
              pressed && styles.tabPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}>
            <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.full,
    backgroundColor: Palette.white,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  tabSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  tabPressed: {
    opacity: 0.92,
  },
  tabText: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  tabTextSelected: {
    color: Palette.white,
  },
});
