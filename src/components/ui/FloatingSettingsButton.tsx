import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';

import { SettingsAccessButton } from '@/components/ui/SettingsAccessButton';
import { useAppTheme, useElderMode } from '@/hooks/useElderMode';

/** Elder-mode fallback — settings stay reachable when the tab bar hides Management. */
export function FloatingSettingsButton() {
  const { enabled: elderMode } = useElderMode();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const onSettingsScreen = pathname.includes('management');

  if (!elderMode || onSettingsScreen) {
    return null;
  }

  const bottomOffset = theme.layout.tabBarHeight + Math.max(insets.bottom, theme.spacing.sm);

  return (
    <View
      style={[styles.host, { bottom: bottomOffset, right: theme.spacing.lg }]}
      pointerEvents="box-none">
      <SettingsAccessButton variant="floating" />
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    host: {
      position: 'absolute',
      zIndex: 1000,
      elevation: 1000,
    },
  });
}
