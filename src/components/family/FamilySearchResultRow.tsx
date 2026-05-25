import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { KinshipBadge } from '@/components/ui/KinshipBadge';
import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { AnimatedPressable } from '@/components/ui/motion/AnimatedPressable';
import { CALM_UX } from '@/constants/calm-ux';
import { FAMILY_SEARCH_COPY } from '@/constants/family-search-content';
import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type FamilySearchResultRowProps = {
  relative: Relative;
  kinshipLabel?: string | null;
  highlighted?: boolean;
  onPress?: () => void;
};

export function FamilySearchResultRow({
  relative,
  kinshipLabel,
  highlighted = false,
  onPress,
}: FamilySearchResultRowProps) {
  const router = useRouter();
  const displayName = getRelativeDisplayName(relative);
  const nickname =
    relative.displayName?.trim() &&
    relative.displayName.trim().toLowerCase() !== displayName.trim().toLowerCase()
      ? relative.displayName.trim()
      : null;

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    router.push({
      pathname: '/relative/[id]',
      params: { id: relative.id },
    });
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.row,
        highlighted && styles.rowHighlighted,
        relative.isDeceased && styles.rowDeceased,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}. ${FAMILY_SEARCH_COPY.openProfile}`}>
      <AvatarPlaceholder
        name={displayName}
        color={relative.avatarColor}
        photoUrl={relative.photoUrl}
        size={52}
        deceased={relative.isDeceased}
      />

      <View style={styles.textWrap}>
        <Text style={styles.name} numberOfLines={2}>
          {displayName}
        </Text>
        {kinshipLabel ? <KinshipBadge label={kinshipLabel} style={styles.kinshipBadge} /> : null}
        {nickname ? <Text style={styles.nickname}>«{nickname}»</Text> : null}
      </View>

      <Text style={styles.chevron}>›</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: CALM_UX.polish.comfortableTouch + 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: CALM_UX.polish.cardBorder,
    ...Shadow.soft,
  },
  rowHighlighted: {
    borderColor: Palette.goldLight,
    backgroundColor: '#FFFCF6',
  },
  rowDeceased: {
    opacity: 0.9,
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  kinshipBadge: {
    alignSelf: 'flex-start',
  },
  name: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  nickname: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 22,
    color: Palette.gold,
    fontWeight: '400',
    lineHeight: 24,
    opacity: 0.75,
    paddingLeft: Spacing.xs,
  },
});
