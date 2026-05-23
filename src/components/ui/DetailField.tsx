import { StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing, Typography } from '@/constants/theme';

type DetailFieldProps = {
  label: string;
  value: string;
  multiline?: boolean;
};

export function DetailField({ label, value, multiline = false }: DetailFieldProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, multiline && styles.multiline]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Palette.creamDark,
  },
  label: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  value: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '600',
  },
  multiline: {
    lineHeight: 26,
  },
});
