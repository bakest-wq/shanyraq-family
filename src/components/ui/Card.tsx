import { ReactNode, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useElderMode';
import { Radius, Shadow } from '@/constants/theme';

type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
  accent?: boolean;
  goldBorder?: boolean;
};

export function Card({ children, style, accent = false, goldBorder = false }: CardProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View
      style={[
        styles.card,
        accent && styles.accent,
        goldBorder && styles.goldBorder,
        style,
      ]}>
      {children}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.palette.white,
      borderRadius: Radius.lg,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      ...Shadow.card,
    },
    accent: {
      backgroundColor: theme.palette.greenDeep,
    },
    goldBorder: {
      borderWidth: theme.layout.cardBorderWidth,
      borderColor: theme.palette.goldLight,
    },
  });
}
