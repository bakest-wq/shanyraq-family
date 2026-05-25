import { Platform } from 'react-native';

import { createCalmThemeTokens } from '@/utils/calm-theme';
import {
  BottomTabInset,
  MaxContentWidth,
  Palette,
  Radius,
  Spacing,
  Typography,
} from '@/constants/theme';

type TypographyToken = {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
};

type TypographyScale = Record<string, TypographyToken>;
type SpacingScale = Record<string, number>;

const ELDER_PALETTE = {
  ...Palette,
  textPrimary: '#0F1A0F',
  textSecondary: '#364636',
  textMuted: '#4A5E4A',
  cream: '#F5F0E8',
  creamDark: '#E0D8CC',
  goldLight: '#DFC56E',
} as const;

function scaleTypography(base: TypographyScale, scale: number): TypographyScale {
  return Object.fromEntries(
    Object.entries(base).map(([key, value]) => [
      key,
      {
        ...value,
        fontSize: Math.round(value.fontSize * scale),
        lineHeight: Math.round(value.lineHeight * scale),
      },
    ]),
  ) as TypographyScale;
}

function scaleSpacing(base: SpacingScale, scale: number): SpacingScale {
  return Object.fromEntries(
    Object.entries(base).map(([key, value]) => [key, Math.round(value * scale)]),
  ) as SpacingScale;
}

export type AppPalette = typeof Palette;

export type AppTheme = {
  elderMode: boolean;
  palette: AppPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  radius: typeof Radius;
  maxContentWidth: number;
  calm: {
    screenGap: number;
    sectionGap: number;
    softGap: number;
    touchPaddingVertical: number;
    minTouchHeight: number;
    maxPrimaryActions: number;
    surfaceSoft: string;
    surfaceRaised: string;
    borderSoft: string;
  };
  layout: {
    bottomTabInset: number;
    tabBarHeight: number;
    buttonMinHeight: number;
    quickActionIconSize: number;
    quickActionMinHeight: number;
    touchTarget: number;
    cardBorderWidth: number;
    tabEmojiSize: number;
    tabLabelSize: number;
  };
};

export function createAppTheme(elderMode: boolean): AppTheme {
  const scale = elderMode ? 1.22 : 1;

  const palette = (elderMode ? ELDER_PALETTE : Palette) as AppPalette;
  const spacing = scaleSpacing(Spacing, scale);
  const calmTokens = createCalmThemeTokens(elderMode);

  return {
    elderMode,
    palette,
    typography: scaleTypography(Typography, scale),
    spacing,
    radius: Radius,
    maxContentWidth: MaxContentWidth,
    calm: {
      ...calmTokens,
      surfaceSoft: palette.cream,
      surfaceRaised: palette.white,
      borderSoft: palette.creamDark,
    },
    layout: {
      bottomTabInset: elderMode
        ? Platform.select({ ios: 102, android: 88 }) ?? 88
        : BottomTabInset,
      tabBarHeight: elderMode ? 98 : 84,
      buttonMinHeight: elderMode ? 84 : 72,
      quickActionIconSize: elderMode ? 60 : 52,
      quickActionMinHeight: elderMode ? 84 : 72,
      touchTarget: calmTokens.minTouchHeight,
      cardBorderWidth: elderMode ? 2 : 1.5,
      tabEmojiSize: elderMode ? 26 : 20,
      tabLabelSize: elderMode ? 14 : 10,
    },
  };
}
