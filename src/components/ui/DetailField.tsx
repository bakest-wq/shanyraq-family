import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useElderMode';

type DetailFieldProps = {
  label: string;
  value: string;
  multiline?: boolean;
};

export function DetailField({ label, value, multiline = false }: DetailFieldProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, multiline && styles.multiline]}>{value}</Text>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    row: {
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: theme.elderMode ? 2 : 1,
      borderBottomColor: theme.palette.creamDark,
    },
    label: {
      ...theme.typography.caption,
      color: theme.palette.textSecondary,
      fontWeight: '700',
    },
    value: {
      ...theme.typography.body,
      color: theme.palette.textPrimary,
      fontWeight: '700',
    },
    multiline: {
      lineHeight: 28,
    },
  });
}
