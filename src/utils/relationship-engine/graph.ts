import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';

export function getById(relatives: Relative[], id?: string | null): Relative | null {
  if (!id) {
    return null;
  }

  return relatives.find((relative) => relative.id === id) ?? null;
}

function sortByName(people: Relative[]): Relative[] {
  return [...people].sort((a, b) =>
    getRelativeDisplayName(a).localeCompare(getRelativeDisplayName(b), 'ru'),
  );
}

function uniqueById(people: Relative[]): Relative[] {
  const seen = new Set<string>();

  return people.filter((person) => {
    if (seen.has(person.id)) {
      return false;
    }

    seen.add(person.id);
    return true;
  });
}

/** Parents linked through `father_id` and `mother_id`. */
export function getParents(relative: Relative, relatives: Relative[]): Relative[] {
  const parents = [
    getById(relatives, relative.fatherId),
    getById(relatives, relative.motherId),
  ].filter((person): person is Relative => Boolean(person));

  return sortByName(uniqueById(parents));
}

/** Children linked through `father_id` / `mother_id` pointing to this person. */
export function getChildren(relative: Relative, relatives: Relative[]): Relative[] {
  return sortByName(
    relatives.filter(
      (candidate) => candidate.fatherId === relative.id || candidate.motherId === relative.id,
    ),
  );
}

/** Children by relative id — convenience wrapper for existing call sites. */
export function getChildrenById(relativeId: string, relatives: Relative[]): Relative[] {
  const person = getById(relatives, relativeId);
  if (!person) {
    return [];
  }

  return getChildren(person, relatives);
}

/** Siblings share at least one linked parent. */
export function getSiblings(relative: Relative, relatives: Relative[]): Relative[] {
  if (!relative.fatherId && !relative.motherId) {
    return [];
  }

  return sortByName(
    relatives.filter((candidate) => {
      if (candidate.id === relative.id) {
        return false;
      }

      const sharedFather = Boolean(
        relative.fatherId && candidate.fatherId && relative.fatherId === candidate.fatherId,
      );
      const sharedMother = Boolean(
        relative.motherId && candidate.motherId && relative.motherId === candidate.motherId,
      );

      return sharedFather || sharedMother;
    }),
  );
}

/** Parents of parents. */
export function getGrandparents(relative: Relative, relatives: Relative[]): Relative[] {
  const grandparents = getParents(relative, relatives).flatMap((parent) =>
    getParents(parent, relatives),
  );

  return sortByName(uniqueById(grandparents));
}

/** Children of children. */
export function getGrandchildren(relative: Relative, relatives: Relative[]): Relative[] {
  const grandchildren = getChildren(relative, relatives).flatMap((child) =>
    getChildren(child, relatives),
  );

  return sortByName(uniqueById(grandchildren));
}

export function getEffectiveSpouse(relative: Relative, relatives: Relative[]): Relative | null {
  if (relative.spouseId) {
    return getById(relatives, relative.spouseId);
  }

  return relatives.find((candidate) => candidate.spouseId === relative.id) ?? null;
}

export function isMale(relative: Relative): boolean {
  return (
    relative.gender === 'male' ||
    relative.relationship === 'Әке' ||
    relative.relationship === 'Ұлы' ||
    relative.relationship === 'Аға' ||
    relative.relationship === 'Күйеуі' ||
    relative.relationship === 'Күйеу бала'
  );
}

export function isFemale(relative: Relative): boolean {
  return (
    relative.gender === 'female' ||
    relative.relationship === 'Ана' ||
    relative.relationship === 'Қызы' ||
    relative.relationship === 'Әпке' ||
    relative.relationship === 'Жұбайы' ||
    relative.relationship === 'Келін'
  );
}
