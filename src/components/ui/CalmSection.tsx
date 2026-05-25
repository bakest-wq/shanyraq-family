import { useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCalmUx } from '@/hooks/useCalmUx';

type CalmSectionProps = {
  title: string;
  hint?: string;
  children: ReactNode;
};

/** Section with soft spacing — no card chrome, minimal noise. */
export function CalmSection({ title, hint, children }: CalmSectionProps) {
  const { theme, calm } = useCalmUx();
  const styles = useMemo(() => createStyles(theme, calm), [calm, theme]);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function createStyles(
  theme: ReturnType<typeof useCalmUx>['theme'],
  calm: ReturnType<typeof useCalmUx>['calm'],
) {
  return StyleSheet.create({
    section: {
      gap: calm.softGap,
      paddingVertical: calm.touchPaddingVertical,
    },
    header: {
      gap: theme.spacing.xs,
    },
    title: {
      fontSize: theme.elderMode ? 24 : 22,
      lineHeight: theme.elderMode ? 32 : 30,
      color: theme.palette.greenDeep,
      fontWeight: '600',
    },
    hint: {
      ...theme.typography.bodySmall,
      color: theme.palette.textSecondary,
      fontWeight: '500',
      lineHeight: 24,
    },
  });
}
