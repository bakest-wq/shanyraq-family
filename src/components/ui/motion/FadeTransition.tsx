import { useEffect, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Motion } from '@/constants/motion';
import { useMotionPreference } from '@/hooks/useMotionPreference';

type FadeTransitionProps = {
  transitionKey: string | number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  fromOpacity?: number;
  durationMs?: number;
};

/** Soft cross-fade when `transitionKey` changes — tree focus, tabs, data states. */
export function FadeTransition({
  transitionKey,
  children,
  style,
  fromOpacity = Motion.fade.switchFrom,
  durationMs = Motion.duration.slow,
}: FadeTransitionProps) {
  const { reduced, duration } = useMotionPreference();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      opacity.value = 1;
      return;
    }

    opacity.value = fromOpacity;
    opacity.value = withTiming(1, {
      duration: duration(durationMs),
      easing: Motion.easing.outCubic,
    });
  }, [duration, durationMs, fromOpacity, opacity, reduced, transitionKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (reduced) {
    return <View style={style}>{children}</View>;
  }

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
