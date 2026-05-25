import { Easing } from 'react-native-reanimated';

/** Calm, premium motion tokens — subtle, never flashy. */
export const Motion = {
  duration: {
    instant: 100,
    fast: 180,
    normal: 280,
    slow: 360,
  },
  fade: {
    /** Opacity when switching content — soft, not a hard cut. */
    switchFrom: 0.88,
    enterFrom: 0,
  },
  press: {
    opacity: 0.94,
    opacityElder: 0.97,
    scale: 0.988,
    scaleElder: 0.994,
    inDuration: 90,
    outDuration: 160,
  },
  collapse: {
    duration: 280,
  },
  loading: {
    enterDuration: 320,
  },
  easing: {
    outCubic: Easing.out(Easing.cubic),
    inOut: Easing.inOut(Easing.quad),
  },
} as const;
