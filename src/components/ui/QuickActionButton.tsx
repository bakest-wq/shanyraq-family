import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/motion/AnimatedPressable';
import { useAppTheme } from '@/hooks/useElderMode';
import { Radius, Shadow } from '@/constants/theme';

type QuickActionButtonProps = {
  label: string;
  sublabel?: string;
  icon: string;
  onPress?: () => void;
  variant?: 'default' | 'gold' | 'green';
};

export function QuickActionButton({
  label,
  sublabel,
  icon,
  onPress,
  variant = 'default',
}: QuickActionButtonProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const iconWrapStyle =
    variant === 'gold'
      ? styles.iconWrapGold
      : variant === 'green'
        ? styles.iconWrapGreen
        : styles.iconWrapDefault;

  return (
    <AnimatedPressable
      onPress={onPress}
      style={styles.button}
      accessibilityRole="button">
      <View style={[styles.iconWrap, iconWrapStyle]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        {sublabel && !theme.elderMode ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
    </AnimatedPressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  const iconSize = theme.layout.quickActionIconSize;

  return StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.palette.white,
      borderRadius: Radius.lg,
      padding: theme.spacing.md,
      minHeight: theme.layout.quickActionMinHeight,
      borderWidth: theme.elderMode ? 2 : 1,
      borderColor: theme.palette.creamDark,
      ...Shadow.soft,
    },
    iconWrap: {
      width: iconSize,
      height: iconSize,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapDefault: {
      backgroundColor: theme.palette.creamDark,
    },
    iconWrapGold: {
      backgroundColor: theme.palette.goldLight,
    },
    iconWrapGreen: {
      backgroundColor: '#D8EDDF',
    },
    icon: {
      fontSize: theme.elderMode ? 28 : 24,
    },
    textWrap: {
      flex: 1,
      gap: 2,
    },
    label: {
      ...theme.typography.body,
      color: theme.palette.textPrimary,
      fontWeight: theme.elderMode ? '800' : '600',
    },
    sublabel: {
      ...theme.typography.caption,
      color: theme.palette.textSecondary,
    },
  });
}
