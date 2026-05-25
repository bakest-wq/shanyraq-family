export type FamilyView = 'list' | 'tree';

export function parseFamilyView(value?: string | string[]): FamilyView {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'tree' ? 'tree' : 'list';
}

export function familyViewHref(view: FamilyView = 'list') {
  if (view === 'tree') {
    return '/(tabs)/shezhire' as const;
  }

  return '/(tabs)/relatives' as const;
}
