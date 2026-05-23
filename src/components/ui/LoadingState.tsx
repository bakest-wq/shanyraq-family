import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing, Typography } from '@/constants/theme';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Жүктелуде · Загрузка...' }: LoadingStateProps) {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={Palette.greenDeep} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  message: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
});
