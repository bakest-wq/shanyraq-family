import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Palette, Spacing, Typography } from '@/constants/theme';

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

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  accent: {
    width: 4,
    height: 28,
    borderRadius: 999,
    backgroundColor: Palette.gold,
    marginTop: 2,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
});
