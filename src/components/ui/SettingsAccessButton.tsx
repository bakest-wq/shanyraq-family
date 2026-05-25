import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { SETTINGS_ACCESS_COPY } from '@/constants/settings-access-content';
import { useAppTheme } from '@/hooks/useElderMode';
import { openAppSettings } from '@/utils/settings-navigation';

const MIN_TOUCH_SIZE = 44;

type SettingsAccessButtonProps = {
  style?: ViewStyle;
  /** Visual variant for floating overlay. */
  variant?: 'header' | 'floating';
};

export function SettingsAccessButton({
  style,
  variant = 'header',
}: SettingsAccessButtonProps) {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme, variant), [theme, variant]);
  const touchSize = Math.max(theme.layout.touchTarget, MIN_TOUCH_SIZE);

  return (
    <Pressable
      onPress={() => openAppSettings(router)}
      style={({ pressed }) => [
        styles.button,
        { width: touchSize, height: touchSize, borderRadius: touchSize / 2 },
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={SETTINGS_ACCESS_COPY.buttonLabel.kk}
      accessibilityHint={SETTINGS_ACCESS_COPY.buttonHint.kk}
      hitSlop={8}>
      <Text style={styles.icon}>⚙️</Text>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, variant: 'header' | 'floating') {
  const isFloating = variant === 'floating';

  return StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      backgroundColor: isFloating ? theme.palette.greenDeep : theme.palette.white,
      borderWidth: theme.elderMode || isFloating ? 2 : 1,
      borderColor: isFloating ? theme.palette.gold : theme.palette.goldLight,
      ...(isFloating
        ? {
            shadowColor: theme.palette.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.22,
            shadowRadius: 10,
            elevation: 8,
          }
        : {}),
    },
    pressed: {
      opacity: 0.88,
    },
    icon: {
      fontSize: isFloating ? 26 : theme.elderMode ? 24 : 20,
      lineHeight: isFloating ? 30 : theme.elderMode ? 28 : 24,
    },
  });
}
