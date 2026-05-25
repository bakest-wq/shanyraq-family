import { CALM_UX } from '@/constants/calm-ux';

/** Base spacing scale — mirrors theme Spacing without pulling react-native into tests. */
const BASE_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

function scaleSpacing(scale: number): Record<keyof typeof BASE_SPACING, number> {
  return Object.fromEntries(
    Object.entries(BASE_SPACING).map(([key, value]) => [key, Math.round(value * scale)]),
  ) as Record<keyof typeof BASE_SPACING, number>;
}

export type CalmThemeTokens = {
  screenGap: number;
  sectionGap: number;
  softGap: number;
  touchPaddingVertical: number;
  minTouchHeight: number;
  maxPrimaryActions: number;
};

/** Pure calm UX tokens — testable without React Native. */
export function createCalmThemeTokens(elderMode: boolean): CalmThemeTokens {
  const scale = elderMode ? 1.22 : 1;
  const spacing = scaleSpacing(scale);
  const touchTarget = elderMode ? CALM_UX.elderMinTouchHeight : CALM_UX.minTouchHeight;

  return {
    screenGap: spacing.xxl,
    sectionGap: spacing.lg,
    softGap: spacing.md,
    touchPaddingVertical: spacing.sm,
    minTouchHeight: touchTarget,
    maxPrimaryActions: elderMode
      ? CALM_UX.elderMaxPrimaryActions
      : CALM_UX.maxPrimaryActions,
  };
}
