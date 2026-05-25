import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useElderMode';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  light?: boolean;
};

export function SectionTitle({ title, subtitle, light = false }: SectionTitleProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, light && styles.titleLight]}>{title}</Text>
      {subtitle && !theme.elderMode ? (
        <Text style={[styles.subtitle, light && styles.subtitleLight]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.xs,
    },
    title: {
      ...theme.typography.subtitle,
      color: theme.palette.textPrimary,
      fontWeight: '800',
    },
    titleLight: {
      color: theme.palette.cream,
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: theme.palette.textSecondary,
    },
    subtitleLight: {
      color: theme.palette.goldLight,
    },
  });
}
