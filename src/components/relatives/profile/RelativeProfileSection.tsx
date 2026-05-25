import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/useElderMode';
import { Palette, Radius } from '@/constants/theme';

type RelativeProfileSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  goldBorder?: boolean;
};

export function RelativeProfileSection({
  title,
  subtitle,
  children,
  goldBorder = false,
}: RelativeProfileSectionProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Card goldBorder={goldBorder} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.accent} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </Card>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    card: {
      gap: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    accent: {
      width: 4,
      height: 28,
      borderRadius: Radius.full,
      backgroundColor: theme.palette.gold,
      marginTop: 2,
    },
    headerText: {
      flex: 1,
      gap: 2,
      minWidth: 0,
    },
    title: {
      ...theme.typography.subtitle,
      color: theme.palette.greenDeep,
      fontWeight: '800',
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.palette.textSecondary,
      lineHeight: 20,
    },
  });
}
