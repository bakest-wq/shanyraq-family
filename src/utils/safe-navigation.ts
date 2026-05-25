import type { Href } from 'expo-router';

/** Main app home — tabs root with auth redirect handled by index. */
export const APP_HOME_HREF = '/(tabs)' as Href;

export const APP_ROUTES = {
  home: APP_HOME_HREF,
  relatives: '/(tabs)/relatives' as Href,
  shezhire: '/(tabs)/shezhire' as Href,
  management: '/(tabs)/management' as Href,
  shezhireHealthCheck: '/shezhire-health-check' as Href,
  onboarding: '/onboarding' as Href,
} as const;

export type SafeRouter = {
  back: () => void;
  canGoBack: () => boolean;
  replace: (href: Href) => void;
};

export type SafeGoBackOptions = {
  /** Where to go when the stack has no previous screen. Defaults to home tabs. */
  fallback?: Href;
};

/**
 * Go back when history exists; otherwise replace with a safe fallback
 * so the app never hits an unhandled GO_BACK or blank screen.
 */
export function safeGoBack(router: SafeRouter, options: SafeGoBackOptions = {}): void {
  const fallback = options.fallback ?? APP_HOME_HREF;

  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallback);
}
