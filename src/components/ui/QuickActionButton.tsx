import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button">
      <View style={[styles.iconWrap, variantStyles[variant].iconWrap]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
    </Pressable>
  );
}

const variantStyles = {
  default: { iconWrap: { backgroundColor: Palette.creamDark } },
  gold: { iconWrap: { backgroundColor: Palette.goldLight } },
  green: { iconWrap: { backgroundColor: '#D8EDDF' } },
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    minHeight: 72,
    ...Shadow.soft,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...Typography.body,
    color: Palette.textPrimary,
  },
  sublabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
});
