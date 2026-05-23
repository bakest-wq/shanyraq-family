import { Relative } from '@/types/relative';

export function getById(relatives: Relative[], id?: string | null): Relative | null {
  if (!id) {
    return null;
  }

  return relatives.find((relative) => relative.id === id) ?? null;
}

export function getEffectiveSpouse(relative: Relative, relatives: Relative[]): Relative | null {
  if (relative.spouseId) {
    return getById(relatives, relative.spouseId);
  }

  return relatives.find((candidate) => candidate.spouseId === relative.id) ?? null;
}

export function areSpousesLinked(a: Relative, b: Relative): boolean {
  return a.spouseId === b.id || b.spouseId === a.id;
}

export function isFemale(relative: Relative): boolean {
  return relative.gender === 'female' || relative.relationship === 'Ана' || relative.relationship === 'Қызы';
}

export function isMale(relative: Relative): boolean {
  return relative.gender === 'male' || relative.relationship === 'Әке' || relative.relationship === 'Ұлы';
}

export function suggestionPairKey(idA: string, idB: string): string {
  return [idA, idB].sort().join(':');
}
