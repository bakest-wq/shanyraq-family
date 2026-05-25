import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useElderMode';
import { CALM_UX } from '@/constants/calm-ux';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export type KinshipBadgeSize = 'default' | 'compact' | 'mini';
export type KinshipBadgeTone = 'muted' | 'softGreen';

type KinshipBadgeProps = {
  label: string;
  size?: KinshipBadgeSize;
  tone?: KinshipBadgeTone;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function KinshipBadge({
  label,
  size = 'default',
  tone = 'muted',
  onPress,
  style,
  accessibilityLabel,
}: KinshipBadgeProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const trimmed = label.trim();

  if (!trimmed) {
    return null;
  }

  const content = (
    <View
      style={[
        styles.badge,
        tone === 'softGreen' && styles.badgeSoftGreen,
        size === 'compact' && styles.badgeCompact,
        size === 'mini' && styles.badgeMini,
        style,
      ]}>
      <Text
        style={[
          styles.text,
          tone === 'softGreen' && styles.textSoftGreen,
          size === 'compact' && styles.textCompact,
          size === 'mini' && styles.textMini,
        ]}
        numberOfLines={2}>
        {trimmed}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? trimmed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  const elder = theme.elderMode;

  return StyleSheet.create({
    pressable: {
      alignSelf: 'center',
      maxWidth: '100%',
    },
    pressed: {
      opacity: 0.88,
    },
    badge: {
      alignSelf: 'center',
      maxWidth: '100%',
      backgroundColor: theme.palette.creamDark,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: CALM_UX.polish.cardBorder,
      paddingHorizontal: elder ? Spacing.sm + 2 : Spacing.sm,
      paddingVertical: elder ? 4 : 2,
    },
    badgeSoftGreen: {
      backgroundColor: '#EEF4F0',
      borderColor: '#D4E4DC',
    },
    badgeCompact: {
      paddingHorizontal: Spacing.xs + 2,
      paddingVertical: 2,
    },
    badgeMini: {
      paddingHorizontal: Spacing.xs,
      paddingVertical: 1,
    },
    text: {
      fontSize: elder ? 13 : 12,
      lineHeight: elder ? 18 : 16,
      fontWeight: '600',
      color: theme.palette.textSecondary,
      textAlign: 'center',
      letterSpacing: 0.05,
    },
    textSoftGreen: {
      color: Palette.greenMid,
    },
    textCompact: {
      fontSize: elder ? 12 : 11,
      lineHeight: elder ? 16 : 14,
    },
    textMini: {
      fontSize: elder ? 11 : 10,
      lineHeight: elder ? 14 : 13,
    },
  });
}

/** Larger centered badge for relationship lookup results. */
export function KinshipResultBadge({ label }: { label: string }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createResultStyles(theme), [theme]);
  const trimmed = label.trim();

  if (!trimmed) {
    return null;
  }

  return (
    <View style={styles.badge}>
      <Text style={styles.text} numberOfLines={3}>
        {trimmed}
      </Text>
    </View>
  );
}

function createResultStyles(theme: ReturnType<typeof useAppTheme>) {
  const elder = theme.elderMode;

  return StyleSheet.create({
    badge: {
      alignSelf: 'center',
      maxWidth: '100%',
      backgroundColor: '#EEF4F0',
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: '#D4E4DC',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: elder ? Spacing.sm : Spacing.xs + 2,
    },
    text: {
      ...(elder ? Typography.bodySmall : Typography.caption),
      color: theme.palette.greenDeep,
      fontWeight: '700',
      textAlign: 'center',
    },
  });
}
