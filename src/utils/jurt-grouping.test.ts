import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import { buildJurtGroups, resolveJurtKind } from '@/utils/jurt-grouping';
import { kayinJurtHasPerson } from '@/utils/kayin-jurt-subgroups';
import { getKinshipLabel } from '@/utils/kinship/getKinshipLabel';
import { getThreeJurtGroup, getKinshipExplanation } from '@/services/kinship';

function mockRelative(
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

test('father side uncle lands in oz jurt', () => {
  const grand = mockRelative('gp', 'Нұрлан', { gender: 'male' });
  const grandm = mockRelative('gm', 'Айгül', { gender: 'female' });
  const father = mockRelative('f', 'Ғалымжан', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
    birthdayYear: 1970,
  });
  const uncle = mockRelative('u', 'Серік', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
    birthdayYear: 1965,
  });
  const root = mockRelative('root', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f',
  });

  const relatives = [grand, grandm, father, root, uncle];
  const groups = buildJurtGroups(root, relatives, new Set([root.id, father.id]));

  const inOz =
    groups.oz.entries.some((entry) => entry.person.id === 'u') ||
    groups.oz.extraRelatives.some((person) => person.id === 'u');

  assert.equal(inOz, true);
  assert.equal(resolveJurtKind(root, uncle, relatives), 'oz');
});

test('mother side uncle lands in nagashy jurt', () => {
  const nagAta = mockRelative('nga', 'Қасым', { gender: 'male' });
  const nagAje = mockRelative('ngj', 'Зейнеп', { gender: 'female' });
  const mother = mockRelative('m', 'Фирдаус', {
    gender: 'female',
    fatherId: 'nga',
    motherId: 'ngj',
  });
  const uncle = mockRelative('uncle', 'Болат', {
    gender: 'male',
    fatherId: 'nga',
    motherId: 'ngj',
    birthdayYear: 1965,
  });
  const root = mockRelative('root', 'Бауыржан', {
    gender: 'male',
    motherId: 'm',
  });

  const relatives = [nagAta, nagAje, mother, root, uncle];
  const groups = buildJurtGroups(root, relatives, new Set([root.id, mother.id]));

  assert.equal(groups.nagashy.entries.some((entry) => entry.person.id === 'uncle'), true);
  assert.match(getKinshipLabel(root, uncle, relatives).type, /^nagashy_/);
  assert.equal(resolveJurtKind(root, uncle, relatives), 'nagashy');
});

test('spouse parent lands in kayin jurt', () => {
  const kayinAta = mockRelative('ka', 'Серік', { gender: 'male' });
  const spouse = mockRelative('sp', 'Анна', {
    gender: 'female',
    fatherId: 'ka',
  });
  const root = mockRelative('root', 'Бауыржан', {
    gender: 'male',
    spouseId: 'sp',
  });

  const relatives = [root, spouse, kayinAta];
  const groups = buildJurtGroups(root, relatives, new Set([root.id, spouse.id]));

  assert.equal(kayinJurtHasPerson(groups.kayin.subgroups ?? [], 'ka'), true);
  assert.equal(getKinshipLabel(root, kayinAta, relatives).type, 'kayin_ata');
  assert.equal(resolveJurtKind(root, kayinAta, relatives), 'kayin');
});

test('reverse spouse link still places spouse father in kayin jurt', () => {
  const kayinAta = mockRelative('ka', 'Серік', { gender: 'male' });
  const spouse = mockRelative('sp', 'Анна', {
    gender: 'female',
    fatherId: 'ka',
    spouseId: 'root',
  });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });

  const relatives = [root, spouse, kayinAta];
  const groups = buildJurtGroups(root, relatives, new Set([root.id, spouse.id]));

  assert.equal(kayinJurtHasPerson(groups.kayin.subgroups ?? [], 'ka'), true);
  assert.equal(getKinshipLabel(root, kayinAta, relatives).type, 'kayin_ata');
  assert.equal(getThreeJurtGroup(root, kayinAta, relatives), 'kaiyn_jurt');
  assert.match(
    getKinshipExplanation(root, kayinAta, relatives).summary,
    /Сізге қайын ата болады/,
  );
});

test('spouse mother lands in kayin jurt as kayin ene', () => {
  const kayinEne = mockRelative('ke', 'Гүлнар', { gender: 'female' });
  const spouse = mockRelative('sp', 'Анна', {
    gender: 'female',
    motherId: 'ke',
    spouseId: 'root',
  });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', spouseId: 'sp' });

  const relatives = [root, spouse, kayinEne];
  const groups = buildJurtGroups(root, relatives, new Set([root.id, spouse.id]));

  assert.equal(kayinJurtHasPerson(groups.kayin.subgroups ?? [], 'ke'), true);
  assert.equal(getKinshipLabel(root, kayinEne, relatives).type, 'kayin_ene');
  assert.match(getKinshipLabel(root, kayinEne, relatives).label.kazakh, /Қайын ене/);
});

test('brother wife is jenge and not in kayin jurt', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const root = mockRelative('b', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
    birthdayYear: 1990,
  });
  const brother = mockRelative('bro', 'Алимжан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
    birthdayYear: 1988,
  });
  const jenge = mockRelative('jenge', 'Эльмира', {
    gender: 'female',
    spouseId: 'bro',
  });
  brother.spouseId = 'jenge';

  const relatives = [father, mother, root, brother, jenge];
  const groups = buildJurtGroups(root, relatives, new Set([root.id, brother.id]));

  assert.equal(getKinshipLabel(root, jenge, relatives).type, 'jenge');
  assert.match(getKinshipLabel(root, jenge, relatives).label.kazakh, /Жеңге/i);
  assert.notEqual(getThreeJurtGroup(root, jenge, relatives), 'kaiyn_jurt');
  assert.equal(kayinJurtHasPerson(groups.kayin.subgroups ?? [], jenge.id), false);
  assert.equal(resolveJurtKind(root, jenge, relatives), 'oz');
});

test('spouse sibling lands in kayin jurt', () => {
  const kayinAta = mockRelative('ka', 'Серік', { gender: 'male' });
  const kayinBrother = mockRelative('kb', 'Нұрлан', {
    gender: 'male',
    fatherId: 'ka',
    birthdayYear: 1985,
  });
  const spouse = mockRelative('sp', 'Анна', {
    gender: 'female',
    fatherId: 'ka',
  });
  const root = mockRelative('root', 'Бауыржан', {
    gender: 'male',
    spouseId: 'sp',
  });

  const relatives = [root, spouse, kayinAta, kayinBrother];
  const groups = buildJurtGroups(root, relatives, new Set([root.id, spouse.id]));

  assert.equal(getThreeJurtGroup(root, kayinBrother, relatives), 'kaiyn_jurt');
  assert.equal(kayinJurtHasPerson(groups.kayin.subgroups ?? [], kayinBrother.id), true);
  assert.match(getKinshipLabel(root, kayinBrother, relatives).type, /^kayin_/);
});

test('jurt groups recalculate when root changes', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const bauyrzhan = mockRelative('b', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
    birthdayYear: 1990,
    spouseId: 'an',
  });
  const alimzhan = mockRelative('a', 'Алимжан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
    birthdayYear: 1988,
  });
  const anna = mockRelative('an', 'Анна', {
    gender: 'female',
    spouseId: 'b',
  });

  const relatives = [father, mother, bauyrzhan, alimzhan, anna];

  const fromBauyrzhan = getKinshipLabel(bauyrzhan, anna, relatives);
  const fromAlimzhan = getKinshipLabel(alimzhan, anna, relatives);

  assert.equal(fromBauyrzhan.type, 'wife');
  assert.equal(fromAlimzhan.type, 'kelin');
  assert.equal(resolveJurtKind(bauyrzhan, anna, relatives), null);
  assert.equal(resolveJurtKind(alimzhan, anna, relatives), 'oz');
});
