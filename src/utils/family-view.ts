export type FamilyView = 'list' | 'tree';

export function parseFamilyView(value?: string | string[]): FamilyView {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'tree' ? 'tree' : 'list';
}

export function familyViewHref(view: FamilyView = 'list') {
  return {
    pathname: '/(tabs)/relatives' as const,
    params: view === 'tree' ? { view: 'tree' as const } : {},
  };
}
