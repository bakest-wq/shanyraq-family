import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Motion } from '@/constants/motion';
import { useMotionPreference } from '@/hooks/useMotionPreference';

type CollapsibleSectionProps = {
  expanded: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Gentle expand/collapse — opacity + layout, no bouncy springs. */
export function CollapsibleSection({ expanded, children, style }: CollapsibleSectionProps) {
  const { reduced, duration } = useMotionPreference();
  const enterMs = duration(Motion.collapse.duration);
  const exitMs = duration(Motion.duration.fast);

  if (reduced) {
    return expanded ? <View style={style}>{children}</View> : null;
  }

  return (
    <Animated.View layout={LinearTransition.duration(enterMs).easing(Motion.easing.inOut)}>
      {expanded ? (
        <Animated.View
          style={style}
          entering={FadeIn.duration(enterMs).easing(Motion.easing.outCubic)}
          exiting={FadeOut.duration(exitMs)}>
          {children}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
