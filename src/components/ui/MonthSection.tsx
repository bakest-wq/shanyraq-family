import { StyleSheet, Text, View } from 'react-native';

import { Relative } from '@/types/relative';
import { formatBirthdayKzRu, formatDaysUntil } from '@/utils/dates';
import { Palette, Spacing, Typography } from '@/constants/theme';

import { AvatarPlaceholder } from './RelativeCard';

type BirthdayRowProps = {
  relative: Relative;
  daysUntil: number;
  highlight?: boolean;
};

export function BirthdayRow({ relative, daysUntil, highlight = false }: BirthdayRowProps) {
  return (
    <View style={[styles.row, highlight && styles.highlight]}>
      <AvatarPlaceholder name={relative.fullName} color={relative.avatarColor} size={48} />
      <View style={styles.info}>
        <Text style={styles.name}>{relative.fullName}</Text>
        <Text style={styles.role}>
          {relative.relationship} · {formatBirthdayKzRu(relative.birthday)}
        </Text>
      </View>
      <Text style={[styles.days, highlight && styles.daysHighlight]}>{formatDaysUntil(daysUntil)}</Text>
    </View>
  );
}

type MonthSectionProps = {
  monthLabel: string;
  children: React.ReactNode;
};

export function MonthSection({ monthLabel, children }: MonthSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.goldLine} />
        <Text style={styles.month}>{monthLabel}</Text>
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
    height: 24,
    borderRadius: 2,
    backgroundColor: Palette.gold,
  },
  month: {
    ...Typography.subtitle,
    color: Palette.greenDeep,
  },
  list: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Palette.white,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.creamDark,
  },
  highlight: {
    borderColor: Palette.gold,
    borderWidth: 1.5,
    backgroundColor: '#FFF9EB',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  role: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  days: {
    ...Typography.caption,
    color: Palette.greenMid,
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: 110,
  },
  daysHighlight: {
    color: Palette.gold,
  },
});
