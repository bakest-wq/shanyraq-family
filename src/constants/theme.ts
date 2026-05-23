import { Platform } from 'react-native';

export const Palette = {
  greenDeep: '#1B4332',
  greenMid: '#2D6A4F',
  greenSoft: '#40916C',
  cream: '#FAF7F2',
  creamDark: '#F0EBE0',
  gold: '#C9A227',
  goldLight: '#E8D5A3',
  white: '#FFFBF5',
  textPrimary: '#1A2E1A',
  textSecondary: '#5C6B5C',
  textMuted: '#8A968A',
  shadow: '#1B4332',
  danger: '#B5451B',
  whatsapp: '#25D366',
} as const;

export const Colors = {
  light: {
    text: Palette.textPrimary,
    background: Palette.cream,
    backgroundElement: Palette.white,
    backgroundSelected: Palette.creamDark,
    textSecondary: Palette.textSecondary,
    primary: Palette.greenDeep,
    accent: Palette.gold,
    card: Palette.white,
    tabBar: Palette.greenDeep,
    tabBarActive: Palette.gold,
    tabBarInactive: '#A8C5B0',
  },
  dark: {
    text: Palette.cream,
    background: '#0F1F18',
    backgroundElement: '#1B4332',
    backgroundSelected: '#2D6A4F',
    textSecondary: '#A8C5B0',
    primary: Palette.greenSoft,
    accent: Palette.gold,
    card: '#1B4332',
    tabBar: '#0F1F18',
    tabBarActive: Palette.gold,
    tabBarInactive: '#5C6B5C',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Menlo',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Typography = {
  hero: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  title: { fontSize: 26, lineHeight: 34, fontWeight: '700' as const },
  subtitle: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  body: { fontSize: 18, lineHeight: 26, fontWeight: '500' as const },
  bodySmall: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  tab: { fontSize: 13, lineHeight: 16, fontWeight: '600' as const },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const Shadow = {
  card: Platform.select({
    ios: {
      shadowColor: Palette.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }),
  soft: Platform.select({
    ios: {
      shadowColor: Palette.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }),
};

export const BottomTabInset = Platform.select({ ios: 88, android: 72 }) ?? 72;
export const MaxContentWidth = 480;
