import { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { HOME_COPY } from '@/constants/home-content';
import { Fonts } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useElderMode';

type HomeFamilyWisdomQuoteProps = {
  elderMode?: boolean;
};

export function HomeFamilyWisdomQuote({ elderMode = false }: HomeFamilyWisdomQuoteProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme, elderMode), [elderMode, theme]);

  return (
    <View style={styles.wrap} accessibilityRole="text">
      <Text style={styles.quote}>{HOME_COPY.wisdomQuote}</Text>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, elderMode: boolean) {
  const quoteColor = theme.palette.greenDeep;

  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xs,
      paddingBottom: theme.spacing.lg,
      marginTop: -theme.spacing.xs,
    },
    quote: {
      maxWidth: 320,
      fontSize: elderMode ? 17 : 15,
      lineHeight: elderMode ? 26 : 24,
      fontWeight: '400',
      fontStyle: 'italic',
      fontFamily: Platform.select({
        ios: Fonts?.serif ?? 'Georgia',
        android: 'serif',
        default: 'serif',
      }),
      color: quoteColor,
      opacity: 0.62,
      textAlign: 'center',
      letterSpacing: 0.15,
    },
  });
}
