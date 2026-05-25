import type { Href } from 'expo-router';

import { APP_ROUTES, safeGoBack, type SafeRouter } from '@/utils/safe-navigation';

export type EditReturnTo = 'details' | 'relatives' | 'shezhire';

export function parseEditReturnTo(value: string | string[] | undefined): EditReturnTo | undefined {
  const raw = Array.isArray(value) ? value[0] : value;

  if (raw === 'details' || raw === 'relatives' || raw === 'shezhire') {
    return raw;
  }

  return undefined;
}

export function buildEditRelativeHref(id: string, returnTo: EditReturnTo) {
  return {
    pathname: '/edit-relative/[id]' as const,
    params: { id, returnTo },
  };
}

export function resolveEditBackFallback(relativeId: string, returnTo?: EditReturnTo): Href {
  if (returnTo === 'shezhire') {
    return APP_ROUTES.shezhire;
  }

  if (returnTo === 'relatives') {
    return APP_ROUTES.relatives;
  }

  if (returnTo === 'details') {
    return {
      pathname: '/relative/[id]',
      params: { id: relativeId },
    };
  }

  return APP_ROUTES.relatives;
}

/** Dismiss edit modal and return to the screen that opened it (profile, list, or tree). */
export function navigateAfterEditSave(
  router: SafeRouter,
  relativeId: string,
  returnTo?: EditReturnTo,
) {
  safeGoBack(router, { fallback: resolveEditBackFallback(relativeId, returnTo) });
}
