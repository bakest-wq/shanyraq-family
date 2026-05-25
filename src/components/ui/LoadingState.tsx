import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Motion } from '@/constants/motion';
import { useAppTheme } from '@/hooks/useElderMode';
import { useMotionPreference } from '@/hooks/useMotionPreference';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Жүктелуде...' }: LoadingStateProps) {
  const theme = useAppTheme();
  const { reduced, duration } = useMotionPreference();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const enterMs = duration(Motion.loading.enterDuration);

  const content = (
    <View style={styles.container} accessibilityRole="progressbar">
      <View style={styles.indicatorWrap}>
        <ActivityIndicator size="large" color={theme.palette.greenDeep} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );

  if (reduced) {
    return content;
  }

  return (
    <Animated.View entering={FadeIn.duration(enterMs).easing(Motion.easing.outCubic)}>
      {content}
    </Animated.View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    indicatorWrap: {
      opacity: 0.92,
    },
    message: {
      ...theme.typography.body,
      color: theme.palette.textSecondary,
      textAlign: 'center',
      fontWeight: theme.elderMode ? '700' : '500',
    },
  });
}
