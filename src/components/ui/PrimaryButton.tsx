import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/motion/AnimatedPressable';
import { useAppTheme } from '@/hooks/useElderMode';
import { Radius } from '@/constants/theme';

type PrimaryButtonProps = {
  label: string;
  sublabel?: string;
  onPress?: () => void;
  variant?: 'gold' | 'green' | 'danger';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({
  label,
  sublabel,
  onPress,
  variant = 'gold',
  fullWidth = true,
  disabled = false,
}: PrimaryButtonProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === 'gold' ? styles.gold : variant === 'danger' ? styles.danger : styles.green,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}>
      <Text
        style={[
          styles.label,
          variant === 'gold' && styles.labelGold,
          variant === 'danger' && styles.labelDanger,
        ]}>
        {label}
      </Text>
      {sublabel ? (
        <Text style={[styles.sublabel, variant === 'gold' && styles.sublabelGold]}>{sublabel}</Text>
      ) : null}
    </AnimatedPressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    button: {
      borderRadius: Radius.xl,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      minHeight: theme.layout.buttonMinHeight,
      borderWidth: theme.elderMode ? 2 : 0,
      borderColor: theme.palette.greenDeep,
    },
    gold: {
      backgroundColor: theme.palette.gold,
    },
    green: {
      backgroundColor: theme.palette.greenDeep,
    },
    danger: {
      backgroundColor: theme.palette.danger,
    },
    fullWidth: {
      alignSelf: 'stretch',
    },
    disabled: {
      opacity: 0.55,
    },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    label: {
      ...theme.typography.subtitle,
      color: theme.palette.white,
      textAlign: 'center',
      fontWeight: '800',
    },
    labelGold: {
      color: theme.palette.greenDeep,
    },
    labelDanger: {
      color: theme.palette.white,
    },
    sublabel: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.9)',
      textAlign: 'center',
    },
    sublabelGold: {
      color: theme.palette.textSecondary,
    },
  });
}
