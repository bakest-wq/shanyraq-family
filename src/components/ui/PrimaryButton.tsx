import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type PrimaryButtonProps = {
  label: string;
  sublabel?: string;
  onPress?: () => void;
  variant?: 'gold' | 'green' | 'danger';
  fullWidth?: boolean;
};

export function PrimaryButton({
  label,
  sublabel,
  onPress,
  variant = 'gold',
  fullWidth = true,
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'gold' ? styles.gold : variant === 'danger' ? styles.danger : styles.green,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button">
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: 72,
  },
  gold: {
    backgroundColor: Palette.gold,
  },
  green: {
    backgroundColor: Palette.greenDeep,
  },
  danger: {
    backgroundColor: Palette.danger,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    ...Typography.subtitle,
    color: Palette.white,
    textAlign: 'center',
  },
  labelGold: {
    color: Palette.greenDeep,
  },
  labelDanger: {
    color: Palette.white,
  },
  sublabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  sublabelGold: {
    color: Palette.textSecondary,
  },
});
