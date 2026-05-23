import { Relative, RelativeGender, GENDER_OPTIONS } from '@/types/relative';

export function getGenderLabel(gender?: RelativeGender): string {
  if (!gender) {
    return '—';
  }

  return GENDER_OPTIONS.find((option) => option.id === gender)?.label ?? '—';
}

export function getShezhireHeaderLine(relative: Relative): string | null {
  const parts = [
    relative.zhuz?.trim(),
    relative.ru?.trim(),
    relative.tribeBranch?.trim(),
    relative.ataLine?.trim(),
  ].filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  return parts.join(' · ');
}

export function getKinshipPathSubtitle(path: string, relationship: string): string | null {
  const trimmedPath = path.trim();
  const trimmedRelationship = relationship.trim();

  if (!trimmedPath || trimmedPath === trimmedRelationship) {
    return null;
  }

  return trimmedPath;
}
