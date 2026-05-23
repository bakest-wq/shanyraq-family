import { StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing, Typography } from '@/constants/theme';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  light?: boolean;
};

export function SectionTitle({ title, subtitle, light = false }: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, light && styles.titleLight]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, light && styles.subtitleLight]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  title: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
  },
  titleLight: {
    color: Palette.cream,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
  },
  subtitleLight: {
    color: Palette.goldLight,
  },
});
