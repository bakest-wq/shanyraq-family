import { type ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Motion } from '@/constants/motion';
import { useMotionPreference } from '@/hooks/useMotionPreference';

type AnimatedPressableProps = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode | ((state: { pressed: boolean }) => ReactNode);
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  enableScale?: boolean;
};

/** Subtle press feedback — slight fade and scale, never bouncy. */
export function AnimatedPressable({
  children,
  style,
  enableScale = true,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedPressableProps) {
  const { reduced, pressOpacity, pressScale } = useMotionPreference();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    if (reduced) {
      return { opacity: 1, transform: [{ scale: 1 }] };
    }

    const t = pressed.value;
    return {
      opacity: 1 - t * (1 - pressOpacity),
      transform: [{ scale: enableScale ? 1 - t * (1 - pressScale) : 1 }],
    };
  });

  if (reduced) {
    return (
      <Pressable style={style} disabled={disabled} {...props}>
        {children}
      </Pressable>
    );
  }

  return (
    <Pressable
      disabled={disabled}
      onPressIn={(event) => {
        pressed.value = withTiming(1, { duration: Motion.press.inDuration });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = withTiming(0, { duration: Motion.press.outDuration });
        onPressOut?.(event);
      }}
      {...props}>
      {(state) => {
        const resolvedStyle = typeof style === 'function' ? style(state) : style;

        return (
          <Animated.View style={[resolvedStyle, animatedStyle]}>
            {typeof children === 'function' ? children(state) : children}
          </Animated.View>
        );
      }}
    </Pressable>
  );
}
