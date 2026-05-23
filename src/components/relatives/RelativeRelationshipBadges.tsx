import { StyleSheet, Text, View } from 'react-native';

import { Relative } from '@/types/relative';
import { getRelativeRelationshipBadges } from '@/utils/relationship-suggestions';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type RelativeRelationshipBadgesProps = {
  relative: Relative;
  relatives: Relative[];
};

export function RelativeRelationshipBadges({
  relative,
  relatives,
}: RelativeRelationshipBadgesProps) {
  const badges = getRelativeRelationshipBadges(relative, relatives);

  if (badges.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {badges.map((badge) => (
        <View
          key={badge.id}
          style={[
            styles.badge,
            badge.tone === 'gold' && styles.badgeGold,
            badge.tone === 'green' && styles.badgeGreen,
            badge.tone === 'cream' && styles.badgeCream,
          ]}>
          <Text
            style={[
              styles.badgeText,
              badge.tone === 'gold' && styles.badgeTextGold,
              badge.tone === 'green' && styles.badgeTextGreen,
            ]}>
            {badge.labelKz} · {badge.labelRu}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badgeGold: {
    backgroundColor: '#F4EFE4',
    borderColor: Palette.goldLight,
  },
  badgeGreen: {
    backgroundColor: '#E8F5EE',
    borderColor: Palette.greenMid,
  },
  badgeCream: {
    backgroundColor: Palette.cream,
    borderColor: Palette.creamDark,
  },
  badgeText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
  },
  badgeTextGold: {
    color: Palette.gold,
  },
  badgeTextGreen: {
    color: Palette.greenDeep,
  },
});
