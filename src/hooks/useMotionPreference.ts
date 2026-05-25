import { useCallback } from 'react';

import { Motion } from '@/constants/motion';
import { useAppTheme } from '@/hooks/useElderMode';

/** Respects elder mode — shorter, gentler motion for clarity and comfort. */
export function useMotionPreference() {
  const theme = useAppTheme();
  const reduced = theme.elderMode;

  const duration = useCallback(
    (base: number) => (reduced ? Math.round(base * 0.65) : base),
    [reduced],
  );

  return {
    reduced,
    duration,
    pressOpacity: reduced ? Motion.press.opacityElder : Motion.press.opacity,
    pressScale: reduced ? Motion.press.scaleElder : Motion.press.scale,
  };
}
