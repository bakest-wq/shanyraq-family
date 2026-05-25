import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { KinshipBadge } from '@/components/ui/KinshipBadge';
import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { useAppTheme } from '@/hooks/useElderMode';
import type { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius } from '@/constants/theme';

type RelativeProfileFamilyMemberCardProps = {
  relative: Relative;
  roleLabel: string;
  kinshipLine?: string | null;
  onPress: () => void;
};

export function RelativeProfileFamilyMemberCard({
  relative,
  roleLabel,
  kinshipLine,
  onPress,
}: RelativeProfileFamilyMemberCardProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const displayName = getRelativeDisplayName(relative);
  const avatarSize = theme.elderMode ? 56 : 48;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${roleLabel}: ${displayName}`}>
      <AvatarPlaceholder
        name={displayName}
        color={relative.avatarColor}
        photoUrl={relative.photoUrl}
        size={avatarSize}
        deceased={relative.isDeceased}
      />
      <View style={styles.textWrap}>
        <Text style={styles.roleLabel}>{roleLabel}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {displayName}
        </Text>
        {kinshipLine ? (
          <KinshipBadge label={kinshipLine} style={styles.kinshipBadge} />
        ) : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      minHeight: theme.elderMode ? 76 : 68,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: Radius.md,
      backgroundColor: Palette.cream,
      borderWidth: 1,
      borderColor: '#EDE6DA',
    },
    pressed: {
      opacity: 0.92,
      backgroundColor: '#F5F0E8',
    },
    textWrap: {
      flex: 1,
      gap: 2,
      minWidth: 0,
    },
    roleLabel: {
      ...theme.typography.caption,
      color: theme.palette.gold,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    name: {
      ...theme.typography.body,
      color: theme.palette.textPrimary,
      fontWeight: '800',
    },
    kinshipBadge: {
      alignSelf: 'flex-start',
      marginTop: 2,
    },
    chevron: {
      ...theme.typography.body,
      color: theme.palette.gold,
      fontWeight: '400',
      fontSize: theme.elderMode ? 28 : 24,
      lineHeight: theme.elderMode ? 32 : 28,
    },
  });
}
