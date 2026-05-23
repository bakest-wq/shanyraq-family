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

export function navigateAfterEditSave(
  router: { replace: (href: never) => void },
  relativeId: string,
  returnTo?: EditReturnTo,
) {
  if (returnTo === 'shezhire') {
    router.replace({
      pathname: '/(tabs)/relatives',
      params: { view: 'tree' },
    } as never);
    return;
  }

  if (returnTo === 'relatives') {
    router.replace('/(tabs)/relatives' as never);
    return;
  }

  if (returnTo === 'details') {
    router.replace({
      pathname: '/relative/[id]',
      params: { id: relativeId },
    } as never);
    return;
  }

  router.replace('/(tabs)/relatives' as never);
}
