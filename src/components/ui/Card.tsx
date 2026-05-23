import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Palette, Radius, Shadow, Spacing } from '@/constants/theme';

type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
  accent?: boolean;
  goldBorder?: boolean;
};

export function Card({ children, style, accent = false, goldBorder = false }: CardProps) {
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  accent: {
    backgroundColor: Palette.greenDeep,
  },
  goldBorder: {
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
  },
});
