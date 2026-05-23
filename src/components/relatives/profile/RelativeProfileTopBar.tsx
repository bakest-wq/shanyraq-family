import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing, Typography } from '@/constants/theme';

type RelativeProfileTopBarProps = {
  onBack: () => void;
  onEdit?: () => void;
  editDisabled?: boolean;
};

export function RelativeProfileTopBar({
  onBack,
  onEdit,
  editDisabled = false,
}: RelativeProfileTopBarProps) {
  return (
    <View style={styles.bar}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.sideButton, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Артқа · Назад">
        <Text style={styles.backText}>← Артқа</Text>
      </Pressable>

      <Text style={styles.title}>Профиль</Text>

      <Pressable
        onPress={editDisabled ? undefined : onEdit}
        style={({ pressed }) => [
          styles.sideButton,
          styles.editButton,
          editDisabled && styles.editDisabled,
          pressed && !editDisabled && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: editDisabled }}
        accessibilityLabel="Өңдеу · Edit">
        <Text style={[styles.editText, editDisabled && styles.editTextDisabled]}>Өңдеу · Edit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 56,
  },
  sideButton: {
    minHeight: 44,
    minWidth: 88,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  editButton: {
    alignItems: 'flex-end',
  },
  backText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  title: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  editText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'right',
  },
  editDisabled: {
    opacity: 0.45,
  },
  editTextDisabled: {
    color: Palette.textMuted,
  },
  pressed: {
    opacity: 0.85,
  },
});
