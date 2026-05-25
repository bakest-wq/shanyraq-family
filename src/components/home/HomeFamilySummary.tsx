import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useElderMode';
import type { HomeFamilySummary } from '@/utils/home-dashboard';

type HomeFamilySummaryProps = {
  summary: HomeFamilySummary;
};

export function HomeFamilySummary({ summary }: HomeFamilySummaryProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.line}>{summary.line}</Text>
      <Text style={styles.detail}>{summary.detail}</Text>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.palette.white,
      borderWidth: 1,
      borderColor: theme.palette.creamDark,
    },
    line: {
      ...theme.typography.bodySmall,
      color: theme.palette.textPrimary,
      fontWeight: '600',
      lineHeight: 24,
    },
    detail: {
      ...theme.typography.caption,
      color: theme.palette.textSecondary,
      lineHeight: 20,
    },
  });
}
