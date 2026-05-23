import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { RELATIONSHIP_PRESET_RU } from '@/utils/relationship-presets';

const PRESET_RU: Record<string, string> = {
  ...RELATIONSHIP_PRESET_RU,
  Я: 'Я',
};

export type KinshipLabel = {
  kazakh: string;
  russian: string;
};

export function findFamilyAnchor(relatives: Relative[]): Relative | null {
  return (
    relatives.find((relative) => relative.relationship === 'Мен' || relative.relationship === 'Я') ??
    null
  );
}

export function getChildrenOf(relativeId: string, relatives: Relative[]): Relative[] {
  return relatives
    .filter((relative) => relative.fatherId === relativeId || relative.motherId === relativeId)
    .sort((a, b) => getRelativeDisplayName(a).localeCompare(getRelativeDisplayName(b), 'ru'));
}

function getById(relatives: Relative[], id?: string | null): Relative | null {
  if (!id) {
    return null;
  }

  return relatives.find((relative) => relative.id === id) ?? null;
}

function getSiblings(relative: Relative, relatives: Relative[]): Relative[] {
  if (!relative.fatherId && !relative.motherId) {
    return [];
  }

  return relatives.filter((candidate) => {
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
  });
}

export function describeKinship(from: Relative, to: Relative, relatives: Relative[]): KinshipLabel {
  if (from.id === to.id) {
    return { kazakh: 'Мен', russian: 'Я' };
  }

  if (to.id === from.fatherId) {
    return { kazakh: 'Әке', russian: 'Отец' };
  }

  if (to.id === from.motherId) {
    return { kazakh: 'Ана', russian: 'Мать' };
  }

  if (to.fatherId === from.id || to.motherId === from.id) {
    return { kazakh: 'Бала', russian: 'Ребёнок' };
  }

  if (to.spouseId === from.id || from.spouseId === to.id) {
    return to.gender === 'female'
      ? { kazakh: 'Жар', russian: 'Жена' }
      : { kazakh: 'Күйеу', russian: 'Муж' };
  }

  const father = getById(relatives, from.fatherId);
  if (father) {
    const siblings = getSiblings(father, relatives);
    if (siblings.some((person) => person.id === to.id && person.gender === 'female')) {
      return { kazakh: 'Әкемнің әпкесі', russian: 'Тётя по отцу' };
    }
    if (siblings.some((person) => person.id === to.id && person.gender === 'male')) {
      return { kazakh: 'Әкемнің ағасы', russian: 'Дядя по отцу' };
    }
    if (father.fatherId === to.id) {
      return { kazakh: 'Ата (әке жағы)', russian: 'Дедушка по отцу' };
    }
    if (father.motherId === to.id) {
      return { kazakh: 'Әже (әке жағы)', russian: 'Бабушка по отцу' };
    }
  }

  const mother = getById(relatives, from.motherId);
  if (mother) {
    const siblings = getSiblings(mother, relatives);
    if (siblings.some((person) => person.id === to.id && person.gender === 'female')) {
      return { kazakh: 'Анамның апасы', russian: 'Тётя по матери' };
    }
    if (siblings.some((person) => person.id === to.id && person.gender === 'male')) {
      return { kazakh: 'Анамның ағасы', russian: 'Дядя по матери' };
    }
    if (mother.fatherId === to.id) {
      return { kazakh: 'Ата (ана жағы)', russian: 'Дедушка по матери' };
    }
    if (mother.motherId === to.id) {
      return { kazakh: 'Әже (ана жағы)', russian: 'Бабушка по матери' };
    }
  }

  return {
    kazakh: to.relationship,
    russian: PRESET_RU[to.relationship] ?? to.relationship,
  };
}

export function getRelationshipPath(
  relative: Relative,
  relatives: Relative[],
  anchor?: Relative | null,
): KinshipLabel {
  const ego = anchor ?? findFamilyAnchor(relatives);

  if (ego && ego.id !== relative.id) {
    return describeKinship(ego, relative, relatives);
  }

  if (relative.fatherId || relative.motherId) {
    const father = getById(relatives, relative.fatherId);
    const mother = getById(relatives, relative.motherId);

    if (father && mother) {
      return {
        kazakh: `${getRelativeDisplayName(father)} пен ${getRelativeDisplayName(mother)} баласы`,
        russian: `Ребёнок ${getRelativeDisplayName(father)} и ${getRelativeDisplayName(mother)}`,
      };
    }

    if (father) {
      return {
        kazakh: `${getRelativeDisplayName(father)} баласы`,
        russian: `Ребёнок ${getRelativeDisplayName(father)}`,
      };
    }

    if (mother) {
      return {
        kazakh: `${getRelativeDisplayName(mother)} баласы`,
        russian: `Ребёнок ${getRelativeDisplayName(mother)}`,
      };
    }
  }

  return {
    kazakh: relative.relationship,
    russian: PRESET_RU[relative.relationship] ?? relative.relationship,
  };
}

export function formatRelationshipPath(label: KinshipLabel): string {
  return `${label.kazakh} · ${label.russian}`;
}
