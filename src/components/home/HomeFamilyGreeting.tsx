import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useElderMode';
import { buildHomeGreeting } from '@/utils/home-greeting';

type HomeFamilyGreetingProps = {
  familyName: string;
  userName?: string | null;
  elderMode?: boolean;
};

export function HomeFamilyGreeting({
  familyName,
  userName,
  elderMode = false,
}: HomeFamilyGreetingProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme, elderMode), [elderMode, theme]);
  const greeting = useMemo(
    () => buildHomeGreeting({ familyName, userName }),
    [familyName, userName],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.salam}>{greeting.salam}</Text>
      <Text style={styles.time}>{greeting.timeGreeting}</Text>
      <Text style={styles.headline}>{greeting.headline}</Text>
      <Text style={styles.subline}>{greeting.subline}</Text>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, elderMode: boolean) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
    },
    salam: {
      fontSize: elderMode ? 18 : 16,
      lineHeight: elderMode ? 26 : 24,
      color: theme.palette.gold,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    time: {
      fontSize: elderMode ? 34 : 30,
      lineHeight: elderMode ? 42 : 38,
      color: theme.palette.greenDeep,
      fontWeight: '600',
    },
    headline: {
      ...theme.typography.body,
      color: theme.palette.textPrimary,
      fontWeight: '500',
      lineHeight: 28,
    },
    subline: {
      ...theme.typography.bodySmall,
      color: theme.palette.textSecondary,
      fontWeight: '500',
      lineHeight: 24,
    },
  });
}
