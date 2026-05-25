import type { Relative } from '@/types/relative';

import type { KinshipLabFamily } from '@/services/kinship/lab/kinship-lab.types';

export function labRelative(
  id: string,
  firstName: string,
  options: Partial<Relative> = {},
): Relative {
  return {
    id,
    fullName: firstName,
    firstName,
    displayName: firstName,
    relationship: options.relationship ?? 'Туысы',
    birthday: options.birthday ?? '',
    birthdayYear: options.birthdayYear,
    phone: '',
    avatarColor: '#2C4A3E',
    isDeceased: false,
    gender: options.gender,
    fatherId: options.fatherId,
    motherId: options.motherId,
    spouseId: options.spouseId,
  };
}

/** Extended Bauyrzhan vision family — covers in-law, nagashy, kuda, and sibling branches. */
export function buildBauyrzhanLabFamily(): KinshipLabFamily {
  const father = labRelative('f', 'Ғалымжан', { gender: 'male' });
  const nagAta = labRelative('nga', 'Ерлан', { gender: 'male' });
  const nagAje = labRelative('ngj', 'Зейнеп', { gender: 'female', spouseId: 'nga' });
  nagAta.spouseId = 'ngj';

  const mother = labRelative('m', 'Фирдаус', {
    gender: 'female',
    spouseId: 'f',
    fatherId: 'nga',
    motherId: 'ngj',
  });
  father.spouseId = 'm';

  const bauyrzhan = labRelative('b', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
    birthdayYear: 1990,
  });

  const brother = labRelative('bro', 'Алимжан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
    birthdayYear: 1992,
  });

  const sister = labRelative('sis', 'Айжан', {
    gender: 'female',
    fatherId: 'f',
    motherId: 'm',
  });

  const annaFather = labRelative('af', 'Абдулрашид', { gender: 'male' });
  const anna = labRelative('an', 'Анна', {
    gender: 'female',
    spouseId: 'b',
    fatherId: 'af',
  });
  bauyrzhan.spouseId = 'an';

  const son = labRelative('son', 'Алмас', {
    gender: 'male',
    fatherId: 'b',
    motherId: 'an',
  });

  const jenge = labRelative('jenge', 'Эльмира', {
    gender: 'female',
    spouseId: 'bro',
  });
  brother.spouseId = 'jenge';

  const jezde = labRelative('jezde', 'Марат', {
    gender: 'male',
    spouseId: 'sis',
  });
  sister.spouseId = 'jezde';

  const zhien = labRelative('zhien', 'Мұрат', {
    gender: 'male',
    motherId: 'sis',
  });

  const aunt = labRelative('aunt', 'Гүлнар', {
    gender: 'female',
    fatherId: 'nga',
    motherId: 'ngj',
  });

  const bole = labRelative('bole', 'Аружан', {
    gender: 'female',
    motherId: 'aunt',
  });

  const members = {
    father,
    mother,
    bauyrzhan,
    brother,
    sister,
    anna,
    annaFather,
    son,
    jenge,
    jezde,
    zhien,
    nagAta,
    nagAje,
    aunt,
    bole,
  };

  return {
    id: 'bauyrzhan',
    label: 'Bauyrzhan extended vision family',
    members,
    relatives: Object.values(members),
  };
}

export const KINSHIP_LAB_FAMILIES: Record<string, KinshipLabFamily> = {
  bauyrzhan: buildBauyrzhanLabFamily(),
};

export function getKinshipLabFamily(familyId: string): KinshipLabFamily {
  const family = KINSHIP_LAB_FAMILIES[familyId];
  if (!family) {
    throw new Error(`Unknown kinship lab family: ${familyId}`);
  }

  return family;
}
