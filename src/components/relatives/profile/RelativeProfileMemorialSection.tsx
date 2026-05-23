import { StyleSheet, Text, View } from 'react-native';

import { Relative } from '@/types/relative';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

import { RelativeProfileSection } from './RelativeProfileSection';

type RelativeProfileMemorialSectionProps = {
  relative: Relative;
};

function formatLifeYears(relative: Relative): string {
  if (relative.birthdayYear) {
    return String(relative.birthdayYear);
  }

  if (relative.birthday?.trim()) {
    return relative.birthday.slice(0, 4);
  }

  return '?';
}

export function RelativeProfileMemorialSection({ relative }: RelativeProfileMemorialSectionProps) {
  const lifeSpan =
    relative.deathYear != null ? `${formatLifeYears(relative)} — ${relative.deathYear}` : null;

  return (
    <RelativeProfileSection
      title="Еске алу · Память"
      subtitle="Марқұм туралы"
      goldBorder>
      <View style={styles.memorialBanner}>
        <Text style={styles.memorialIcon}>🕊️</Text>
        <Text style={styles.memorialTitle}>Марқұм · Ушедший из жизни</Text>
        {lifeSpan ? <Text style={styles.memorialYears}>{lifeSpan}</Text> : null}
      </View>

      {relative.duaText?.trim() ? (
        <View style={styles.duaCard}>
          <Text style={styles.duaLabel}>Дұға · Памятная фраза</Text>
          <Text style={styles.duaText}>{relative.duaText.trim()}</Text>
        </View>
      ) : (
        <View style={styles.duaEmpty}>
          <Text style={styles.duaEmptyText}>Дұға мәтіні қосылмаған · Памятная фраза не добавлена</Text>
        </View>
      )}
    </RelativeProfileSection>
  );
}

const styles = StyleSheet.create({
  memorialBanner: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#F7F3EC',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.creamDark,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  memorialIcon: {
    fontSize: 32,
  },
  memorialTitle: {
    ...Typography.body,
    color: Palette.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
  },
  memorialYears: {
    ...Typography.subtitle,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
  },
  duaCard: {
    gap: Spacing.sm,
    backgroundColor: Palette.cream,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  duaLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  duaText: {
    ...Typography.body,
    color: Palette.textPrimary,
    lineHeight: 28,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  duaEmpty: {
    paddingVertical: Spacing.sm,
  },
  duaEmptyText: {
    ...Typography.bodySmall,
    color: Palette.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
});
