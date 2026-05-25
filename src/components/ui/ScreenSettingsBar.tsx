import { StyleSheet, View } from 'react-native';

import { SettingsAccessButton } from '@/components/ui/SettingsAccessButton';
import { useAppTheme } from '@/hooks/useElderMode';

/** Top-right settings slot for screens without AppHeader (e.g. home). */
export function ScreenSettingsBar() {
  const theme = useAppTheme();

  return (
    <View style={[styles.bar, { paddingHorizontal: theme.spacing.lg }]}>
      <View style={styles.spacer} />
      <SettingsAccessButton />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 4,
    paddingBottom: 4,
    zIndex: 10,
  },
  spacer: {
    flex: 1,
    minWidth: 0,
  },
});
