import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  getKinshipCardLine,
  getKinshipExplanation,
  getKinshipLabel,
  getKinshipPath,
  getRelationshipConfidence,
  getThreeJurtGroup,
} from '@/services/kinship';

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

function buildBauyrzhanFamily() {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female', spouseId: 'f' });
  const bauyrzhan = mockRelative('b', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
    birthdayYear: 1990,
  });
  const brother = mockRelative('bro', 'Алимжан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
    birthdayYear: 1992,
  });
  const anna = mockRelative('an', 'Анна', {
    gender: 'female',
    spouseId: 'b',
  });
  const annaFather = mockRelative('af', 'Абдулрашид', {
    gender: 'male',
    fatherId: undefined,
  });
  anna.fatherId = 'af';

  return { father, mother, bauyrzhan, brother, anna, annaFather };
}

test('critical: root spouse father => kayin ata', () => {
  const { bauyrzhan, anna, annaFather, father, mother } = buildBauyrzhanFamily();
  const relatives = [father, mother, bauyrzhan, anna, annaFather];

  const result = getKinshipLabel(bauyrzhan, annaFather, relatives);
  assert.equal(result.type, 'kayin_ata');
  assert.match(getKinshipCardLine(bauyrzhan, annaFather, relatives), /Қайын ата/);
  assert.match(getKinshipExplanation(bauyrzhan, annaFather, relatives).summary, /жұбай/i);
  assert.match(getKinshipExplanation(bauyrzhan, annaFather, relatives).summary, /қайын ата/i);
});

test('critical: root child to mothers father => nagashy ata', () => {
  const nagashyAta = mockRelative('nga', 'Ерлан', { gender: 'male' });
  const mother = mockRelative('m', 'Айгүл', { gender: 'female', fatherId: 'nga' });
  const child = mockRelative('child', 'Алмас', { gender: 'male', motherId: 'm' });
  const relatives = [child, mother, nagashyAta];

  const result = getKinshipLabel(child, nagashyAta, relatives);
  assert.equal(result.type, 'nagashy_ata');
  assert.equal(getThreeJurtGroup(child, nagashyAta, relatives), 'nagashy_jurt');
});

test('critical: root brother to spouse father => kuda', () => {
  const { bauyrzhan, brother, anna, annaFather, father, mother } = buildBauyrzhanFamily();
  const relatives = [father, mother, bauyrzhan, brother, anna, annaFather];

  const result = getKinshipLabel(brother, annaFather, relatives);
  assert.equal(result.type, 'kuda');
  assert.match(getKinshipExplanation(brother, annaFather, relatives).summary, /құда/i);
});

test('critical: root to own father => ake', () => {
  const { bauyrzhan, father, mother } = buildBauyrzhanFamily();
  const relatives = [father, mother, bauyrzhan];

  const result = getKinshipLabel(bauyrzhan, father, relatives);
  assert.equal(result.type, 'father');
  assert.match(getKinshipCardLine(bauyrzhan, father, relatives), /Әке/);
  assert.equal(getThreeJurtGroup(bauyrzhan, father, relatives), 'direct_family');
});

test('critical: root to fathers father => ata', () => {
  const grandfather = mockRelative('gp', 'Қабдолла', { gender: 'male' });
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male', fatherId: 'gp' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const relatives = [grandfather, father, root];

  const result = getKinshipLabel(root, grandfather, relatives);
  assert.equal(result.type, 'grandfather');
  assert.equal(getKinshipCardLine(root, grandfather, relatives), 'Ата');
});

test('critical: root to mothers father => nagashy ata', () => {
  const nagashyAta = mockRelative('nga', 'Ерлан', { gender: 'male' });
  const mother = mockRelative('m', 'Айгül', { gender: 'female', fatherId: 'nga' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', motherId: 'm' });
  const relatives = [root, mother, nagashyAta];

  assert.equal(getKinshipLabel(root, nagashyAta, relatives).type, 'nagashy_ata');
});

test('critical: younger brother wife => kelin', () => {
  const { bauyrzhan, brother, father, mother } = buildBauyrzhanFamily();
  const wife = mockRelative('wife', 'Эльмира', { gender: 'female', spouseId: 'bro' });
  const relatives = [father, mother, bauyrzhan, brother, wife];

  assert.equal(getKinshipLabel(bauyrzhan, wife, relatives).type, 'kelin');
});

test('critical: sister husband => jezde', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f', motherId: 'm' });
  const sister = mockRelative('sis', 'Айша', { gender: 'female', fatherId: 'f', motherId: 'm' });
  const husband = mockRelative('h', 'Марат', { gender: 'male', spouseId: 'sis' });

  assert.equal(getKinshipLabel(root, husband, [root, sister, husband, father, mother]).type, 'jezde');
});

test('critical: son wife => kelin', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const son = mockRelative('son', 'Алмас', { gender: 'male', fatherId: 'root' });
  const kelin = mockRelative('kelin', 'Айгерим', { gender: 'female', spouseId: 'son' });

  assert.equal(getKinshipLabel(root, kelin, [root, son, kelin]).type, 'kelin');
});

test('critical: daughter husband => kuyeu bala', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const daughter = mockRelative('d', 'Асия', { gender: 'female', fatherId: 'root' });
  const zyat = mockRelative('z', 'Ерлан', { gender: 'male', spouseId: 'd' });

  assert.equal(getKinshipLabel(root, zyat, [root, daughter, zyat]).type, 'kuyeu_bala');
});

test('critical: sisters children => bole', () => {
  const nagAta = mockRelative('nga', 'Қасым', { gender: 'male' });
  const nagAje = mockRelative('ngj', 'Зейнеп', { gender: 'female' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female', fatherId: 'nga', motherId: 'ngj' });
  const aunt = mockRelative('aunt', 'Гүлнар', { gender: 'female', fatherId: 'nga', motherId: 'ngj' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', motherId: 'm' });
  const cousin = mockRelative('cousin', 'Аружан', { gender: 'female', motherId: 'aunt' });

  assert.equal(getKinshipLabel(root, cousin, [root, mother, aunt, cousin, nagAta, nagAje]).type, 'bole');
});

test('critical: sister child => zhien', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f', motherId: 'm' });
  const sister = mockRelative('sis', 'Айжан', { gender: 'female', fatherId: 'f', motherId: 'm' });
  const zhien = mockRelative('zh', 'Мұрат', { gender: 'male', motherId: 'sis' });

  assert.equal(getKinshipLabel(root, zhien, [father, mother, root, sister, zhien]).type, 'zhien');
});

test('critical: root Anna to Anna father => ake', () => {
  const { anna, annaFather } = buildBauyrzhanFamily();
  const relatives = [anna, annaFather];

  assert.equal(getKinshipLabel(anna, annaFather, relatives).type, 'father');
});

test('root switching recalculates labels', () => {
  const { bauyrzhan, brother, anna, annaFather, father, mother } = buildBauyrzhanFamily();
  const relatives = [father, mother, bauyrzhan, brother, anna, annaFather];

  assert.equal(getKinshipLabel(bauyrzhan, anna, relatives).type, 'wife');
  assert.equal(getKinshipLabel(brother, anna, relatives).type, 'jenge');
  assert.equal(getKinshipLabel(bauyrzhan, annaFather, relatives).type, 'kayin_ata');
  assert.equal(getKinshipLabel(brother, annaFather, relatives).type, 'kuda');
});

test('getKinshipPath returns structural steps', () => {
  const { bauyrzhan, anna, annaFather, father, mother } = buildBauyrzhanFamily();
  const relatives = [father, mother, bauyrzhan, anna, annaFather];

  const path = getKinshipPath(bauyrzhan, annaFather, relatives);
  assert.ok(path.length >= 2);
});

test('confidence is low for unknown links', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const stranger = mockRelative('s', 'Бейтаныс', { gender: 'male' });

  assert.equal(getRelationshipConfidence(root, stranger, [root, stranger]), 'low');
});
