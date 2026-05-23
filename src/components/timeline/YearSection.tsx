import { StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing, Typography } from '@/constants/theme';

type YearSectionProps = {
  yearLabel: string;
  children: React.ReactNode;
};

export function YearSection({ yearLabel, children }: YearSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.goldLine} />
        <View style={styles.yearWrap}>
          <Text style={styles.year}>{yearLabel}</Text>
        </View>
      </View>
      <View style={styles.list}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  goldLine: {
    width: 4,
    height: 28,
    borderRadius: 2,
    backgroundColor: Palette.gold,
  },
  yearWrap: {
    flex: 1,
    backgroundColor: Palette.white,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.goldLight,
  },
  year: {
    ...Typography.subtitle,
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  list: {
    gap: Spacing.sm,
    paddingLeft: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: Palette.goldLight,
    marginLeft: 1,
  },
});
