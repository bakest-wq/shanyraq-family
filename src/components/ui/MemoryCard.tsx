import { StyleSheet, Text, View } from 'react-native';

import { MemoryArchive } from '@/data/mockData';
import { Relative } from '@/types/relative';
import { BirthdayPartsInput } from '@/utils/birthday-parts';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

import { AvatarPlaceholder } from './RelativeCard';

type DeceasedCardProps = {
  relative: Relative;
};

function formatLifeYears(relative: BirthdayPartsInput): string {
  if (relative.birthdayYear) {
    return String(relative.birthdayYear);
  }

  if (relative.birthday?.trim()) {
    return relative.birthday.slice(0, 4);
  }

  return '?';
}

export function DeceasedCard({ relative }: DeceasedCardProps) {
  return (
    <View style={styles.deceasedCard}>
      <View style={styles.row}>
        <AvatarPlaceholder
          name={relative.fullName}
          color={relative.avatarColor}
          photoUrl={relative.photoUrl}
          size={56}
          deceased
        />
        <View style={styles.info}>
        <Text style={styles.role}>{relative.relationship}</Text>
          <Text style={styles.name}>{relative.fullName}</Text>
          {relative.deathYear ? (
            <Text style={styles.years}>
              {formatLifeYears(relative)} — {relative.deathYear}
            </Text>
          ) : null}
        </View>
      </View>
      {relative.duaText ? <Text style={styles.dua}>{relative.duaText}</Text> : null}
    </View>
  );
}

type MemoryArchiveCardProps = {
  archive: MemoryArchive;
};

export function MemoryArchiveCard({ archive }: MemoryArchiveCardProps) {
  return (
    <View style={styles.archiveCard}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{archive.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{archive.title}</Text>
        <Text style={styles.subtitle}>{archive.subtitle}</Text>
      </View>
      <Text style={styles.year}>{archive.year}</Text>
    </View>
  );
}

type DuaBannerProps = {
  text: string;
};

export function DuaBanner({ text }: DuaBannerProps) {
  return (
    <View style={styles.duaBanner}>
      <Text style={styles.duaIcon}>🤲</Text>
      <Text style={styles.duaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  deceasedCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.creamDark,
    ...Shadow.soft,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  role: {
    ...Typography.caption,
    color: Palette.textMuted,
    fontWeight: '600',
  },
  name: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  years: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  dua: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  archiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadow.soft,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Palette.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  title: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  year: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
  },
  duaBanner: {
    backgroundColor: Palette.greenDeep,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  duaIcon: {
    fontSize: 28,
  },
  duaText: {
    ...Typography.body,
    color: Palette.cream,
    textAlign: 'center',
    lineHeight: 26,
  },
});
