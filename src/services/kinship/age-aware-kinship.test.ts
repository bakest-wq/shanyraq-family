import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  getKinshipCardLine,
  getKinshipExplanation,
  getKinshipLabel,
  isBrotherChildKinshipType,
} from '@/services/kinship/kinship.service';

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

function buildSiblingFamily(options: {
  suffix: string;
  rootGender: 'male' | 'female';
  rootBirthYear?: number;
  siblingGender: 'male' | 'female';
  siblingBirthYear?: number;
}) {
  const id = options.suffix;
  const father = mockRelative(`f-${id}`, 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative(`m-${id}`, 'Фирдаус', { gender: 'female', spouseId: `f-${id}` });
  const root = mockRelative(`root-${id}`, options.rootGender === 'male' ? 'Бауыржан' : 'Анна', {
    gender: options.rootGender,
    fatherId: `f-${id}`,
    motherId: `m-${id}`,
    birthdayYear: options.rootBirthYear ?? 1990,
  });
  const sibling = mockRelative(
    `sib-${id}`,
    options.siblingGender === 'male' ? 'Алимжан' : 'Айжан',
    {
      gender: options.siblingGender,
      fatherId: `f-${id}`,
      motherId: `m-${id}`,
      birthdayYear: options.siblingBirthYear,
    },
  );

  return { root, sibling, relatives: [father, mother, root, sibling] };
}

test('older brother => Аға', () => {
  const { root, sibling, relatives } = buildSiblingFamily({
    suffix: 'bro-older',
    rootGender: 'male',
    rootBirthYear: 1990,
    siblingGender: 'male',
    siblingBirthYear: 1988,
  });

  assert.equal(getKinshipLabel(root, sibling, relatives).type, 'aga');
  assert.equal(getKinshipCardLine(root, sibling, relatives), 'Аға');
});

test('younger brother => Іні', () => {
  const { root, sibling, relatives } = buildSiblingFamily({
    suffix: 'bro-younger',
    rootGender: 'male',
    rootBirthYear: 1990,
    siblingGender: 'male',
    siblingBirthYear: 1992,
  });

  assert.equal(getKinshipLabel(root, sibling, relatives).type, 'ini');
  assert.equal(getKinshipCardLine(root, sibling, relatives), 'Іні');
});

test('younger sister from male root => Қарындас', () => {
  const { root, sibling, relatives } = buildSiblingFamily({
    suffix: 'sis-younger-male-root',
    rootGender: 'male',
    rootBirthYear: 1990,
    siblingGender: 'female',
    siblingBirthYear: 1995,
  });

  assert.equal(getKinshipLabel(root, sibling, relatives).type, 'singli');
  assert.equal(getKinshipCardLine(root, sibling, relatives), 'Қарындас');
});

test('younger sister from female root => Сіңлі', () => {
  const { root, sibling, relatives } = buildSiblingFamily({
    suffix: 'sis-younger-female-root',
    rootGender: 'female',
    rootBirthYear: 1990,
    siblingGender: 'female',
    siblingBirthYear: 1995,
  });

  assert.equal(getKinshipLabel(root, sibling, relatives).type, 'singli');
  assert.equal(getKinshipCardLine(root, sibling, relatives), 'Сіңлі');
});

test('older brother wife => Жеңге', () => {
  const { root, sibling, relatives } = buildSiblingFamily({
    suffix: 'jenge',
    rootGender: 'male',
    rootBirthYear: 1990,
    siblingGender: 'male',
    siblingBirthYear: 1988,
  });
  const wife = mockRelative('wife-jenge', 'Эльмира', {
    gender: 'female',
    spouseId: sibling.id,
  });

  assert.equal(getKinshipLabel(root, wife, [...relatives, wife]).type, 'jenge');
  assert.equal(getKinshipCardLine(root, wife, [...relatives, wife]), 'Жеңге');
});

test('younger brother wife => Келін', () => {
  const { root, sibling, relatives } = buildSiblingFamily({
    suffix: 'kelin-bro',
    rootGender: 'male',
    rootBirthYear: 1990,
    siblingGender: 'male',
    siblingBirthYear: 1992,
  });
  const wife = mockRelative('wife-kelin', 'Анна', {
    gender: 'female',
    spouseId: sibling.id,
  });

  assert.equal(getKinshipLabel(root, wife, [...relatives, wife]).type, 'kelin');
  assert.equal(getKinshipCardLine(root, wife, [...relatives, wife]), 'Келін');
});

test('spouse older brother => Қайын аға', () => {
  const father = mockRelative('f-kayin', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m-kayin', 'Фирдаус', { gender: 'female', spouseId: 'f-kayin' });
  const spouse = mockRelative('sp-kayin', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f-kayin',
    motherId: 'm-kayin',
    spouseId: 'root-kayin',
    birthdayYear: 1990,
  });
  const root = mockRelative('root-kayin', 'Анна', { gender: 'female', spouseId: 'sp-kayin' });
  const brother = mockRelative('bro-kayin', 'Алимжан', {
    gender: 'male',
    fatherId: 'f-kayin',
    motherId: 'm-kayin',
    birthdayYear: 1988,
  });

  const relatives = [father, mother, spouse, root, brother];
  assert.equal(getKinshipLabel(root, brother, relatives).type, 'kayin_aga');
  assert.equal(getKinshipCardLine(root, brother, relatives), 'Қайын аға');
});

test('spouse younger brother => Қайын іні', () => {
  const father = mockRelative('f-kayin2', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m-kayin2', 'Фирдаус', { gender: 'female', spouseId: 'f-kayin2' });
  const spouse = mockRelative('sp-kayin2', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f-kayin2',
    motherId: 'm-kayin2',
    spouseId: 'root-kayin2',
    birthdayYear: 1990,
  });
  const root = mockRelative('root-kayin2', 'Анна', { gender: 'female', spouseId: 'sp-kayin2' });
  const brother = mockRelative('bro-kayin2', 'Алимжан', {
    gender: 'male',
    fatherId: 'f-kayin2',
    motherId: 'm-kayin2',
    birthdayYear: 1992,
  });

  const relatives = [father, mother, spouse, root, brother];
  assert.equal(getKinshipLabel(root, brother, relatives).type, 'kayin_ini');
  assert.equal(getKinshipCardLine(root, brother, relatives), 'Қайын іні');
});

test('sister child => Жиен', () => {
  const { root, sibling, relatives } = buildSiblingFamily({
    suffix: 'zhien',
    rootGender: 'male',
    rootBirthYear: 1990,
    siblingGender: 'female',
    siblingBirthYear: 1988,
  });
  const child = mockRelative('zhien-child', 'Мұрат', {
    gender: 'male',
    fatherId: 'ext-f',
    motherId: sibling.id,
  });

  const result = getKinshipLabel(root, child, [...relatives, child]);
  assert.equal(result.type, 'zhien');
  assert.equal(getKinshipCardLine(root, child, [...relatives, child]), 'Жиен');
});

test('brother child is not Жиен', () => {
  const { root, sibling, relatives } = buildSiblingFamily({
    suffix: 'bro-child',
    rootGender: 'male',
    rootBirthYear: 1990,
    siblingGender: 'male',
    siblingBirthYear: 1992,
  });
  const child = mockRelative('bro-child', 'Ерлан', {
    gender: 'male',
    fatherId: sibling.id,
    motherId: 'ext-m',
  });

  const result = getKinshipLabel(root, child, [...relatives, child]);
  assert.notEqual(result.type, 'zhien');
  assert.ok(isBrotherChildKinshipType(result.type));
  assert.equal(getKinshipCardLine(root, child, [...relatives, child]), 'Ініңіздің баласы');
});

test('older brother child => Ағаңыздың баласы', () => {
  const { root, sibling, relatives } = buildSiblingFamily({
    suffix: 'aga-child',
    rootGender: 'male',
    rootBirthYear: 1990,
    siblingGender: 'male',
    siblingBirthYear: 1988,
  });
  const child = mockRelative('aga-child', 'Нурлан', {
    gender: 'male',
    fatherId: sibling.id,
    motherId: 'ext-m2',
  });

  assert.equal(getKinshipLabel(root, child, [...relatives, child]).type, 'brother_child_older');
  assert.equal(getKinshipCardLine(root, child, [...relatives, child]), 'Ағаңыздың баласы');
});

test('unknown age brother wife => Бауырының жұбайы', () => {
  const { root, sibling, relatives } = buildSiblingFamily({
    suffix: 'bro-wife-unknown',
    rootGender: 'male',
    siblingGender: 'male',
  });
  const wife = mockRelative('wife-unknown', 'Айгерим', {
    gender: 'female',
    spouseId: sibling.id,
  });

  assert.equal(getKinshipLabel(root, wife, [...relatives, wife]).type, 'brother_wife_neutral');
  assert.equal(getKinshipCardLine(root, wife, [...relatives, wife]), 'Бауырының жұбайы');
});

test('Alimzhan root: younger brother Baurzhan wife Anna => Келін', () => {
  const father = mockRelative('f-alim', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m-alim', 'Фирдаус', { gender: 'female', spouseId: 'f-alim' });
  const alimzhan = mockRelative('alim', 'Алимжан', {
    gender: 'male',
    fatherId: 'f-alim',
    motherId: 'm-alim',
    birthdayYear: 1988,
  });
  const bauyrzhan = mockRelative('bau', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f-alim',
    motherId: 'm-alim',
    spouseId: 'anna',
    birthdayYear: 1990,
  });
  const anna = mockRelative('anna', 'Анна', {
    gender: 'female',
    spouseId: 'bau',
  });

  const relatives = [father, mother, alimzhan, bauyrzhan, anna];

  assert.equal(getKinshipLabel(alimzhan, anna, relatives).type, 'kelin');
  assert.equal(getKinshipCardLine(alimzhan, anna, relatives), 'Келін');
});

test('Alimzhan root: Anna explanation uses younger brother wording', () => {
  const father = mockRelative('f-alim2', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m-alim2', 'Фирдаус', { gender: 'female', spouseId: 'f-alim2' });
  const alimzhan = mockRelative('alim2', 'Алимжан', {
    gender: 'male',
    fatherId: 'f-alim2',
    motherId: 'm-alim2',
    birthdayYear: 1988,
  });
  const bauyrzhan = mockRelative('bau2', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f-alim2',
    motherId: 'm-alim2',
    spouseId: 'anna2',
    birthdayYear: 1990,
  });
  const anna = mockRelative('anna2', 'Анна', {
    gender: 'female',
    spouseId: 'bau2',
  });

  const explanation = getKinshipExplanation(alimzhan, anna, [father, mother, alimzhan, bauyrzhan, anna]);

  assert.match(explanation.summary, /Анна — ініңіз Бауыржанның жұбайы/i);
  assert.match(explanation.summary, /келін/i);
});

test('unknown age brother child => Бауырыңыздың баласы', () => {
  const { root, sibling, relatives } = buildSiblingFamily({
    suffix: 'bro-child-unknown',
    rootGender: 'male',
    siblingGender: 'male',
  });
  const child = mockRelative('bro-child-unknown', 'Асқар', {
    gender: 'male',
    fatherId: sibling.id,
    motherId: 'ext-m3',
  });

  const result = getKinshipLabel(root, child, [...relatives, child]);
  assert.equal(result.type, 'brother_child_neutral');
  assert.equal(getKinshipCardLine(root, child, [...relatives, child]), 'Бауырыңыздың баласы');
});

test('daughter child => Жиен', () => {
  const root = mockRelative('root-daughter-child', 'Бауыржан', {
    gender: 'male',
    birthdayYear: 1985,
  });
  const daughter = mockRelative('daughter', 'Айжан', {
    gender: 'female',
    fatherId: root.id,
  });
  const child = mockRelative('daughter-child', 'Айдана', {
    gender: 'female',
    motherId: daughter.id,
    fatherId: 'ext-f',
  });

  const relatives = [root, daughter, child];
  assert.equal(getKinshipLabel(root, child, relatives).type, 'zhien');
  assert.equal(getKinshipCardLine(root, child, relatives), 'Жиен');
});

test('Alimzhan root: younger brother Baurzhan child explanation uses brother wording', () => {
  const father = mockRelative('f-alim3', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m-alim3', 'Фирдаус', { gender: 'female', spouseId: 'f-alim3' });
  const alimzhan = mockRelative('alim3', 'Алимжан', {
    gender: 'male',
    fatherId: 'f-alim3',
    motherId: 'm-alim3',
    birthdayYear: 1988,
  });
  const bauyrzhan = mockRelative('bau3', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f-alim3',
    motherId: 'm-alim3',
    birthdayYear: 1990,
  });
  const abdulla = mockRelative('abdulla', 'Абдулла', {
    gender: 'male',
    fatherId: 'bau3',
    motherId: 'ext-m4',
  });

  const relatives = [father, mother, alimzhan, bauyrzhan, abdulla];
  const explanation = getKinshipExplanation(alimzhan, abdulla, relatives);

  assert.notEqual(getKinshipLabel(alimzhan, abdulla, relatives).type, 'zhien');
  assert.equal(getKinshipCardLine(alimzhan, abdulla, relatives), 'Ініңіздің баласы');
  assert.match(explanation.summary, /Абдулла — ініңіз Бауыржанның баласы/i);
});

test('root switching recalculates age-aware labels', () => {
  const father = mockRelative('f-switch', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m-switch', 'Фирдаус', { gender: 'female', spouseId: 'f-switch' });
  const alimzhan = mockRelative('alim', 'Алимжан', {
    gender: 'male',
    fatherId: 'f-switch',
    motherId: 'm-switch',
    birthdayYear: 1988,
  });
  const bauyrzhan = mockRelative('bau', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f-switch',
    motherId: 'm-switch',
    spouseId: 'anna',
    birthdayYear: 1990,
  });
  const anna = mockRelative('anna', 'Анна', {
    gender: 'female',
    spouseId: 'bau',
  });
  bauyrzhan.spouseId = 'anna';

  const relatives = [father, mother, alimzhan, bauyrzhan, anna];

  assert.equal(getKinshipCardLine(alimzhan, bauyrzhan, relatives), 'Іні');
  assert.equal(getKinshipCardLine(bauyrzhan, alimzhan, relatives), 'Аға');
  assert.equal(getKinshipCardLine(alimzhan, anna, relatives), 'Келін');
  assert.equal(getKinshipCardLine(bauyrzhan, anna, relatives), 'Әйелі');
});
