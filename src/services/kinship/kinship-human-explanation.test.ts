import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import { getKinshipExplanation } from '@/services/kinship';
import { buildHumanKinshipExplanation } from '@/services/kinship/kinship-human-explanation';
import { classifyKinship } from '@/utils/kinship/classify';

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

test('human: spouse father explains as kayin ata in two calm sentences', () => {
  const bauyrzhan = mockRelative('b', 'Бауыржан', { gender: 'male' });
  const anna = mockRelative('an', 'Анна', { gender: 'female', spouseId: 'b' });
  const annaFather = mockRelative('af', 'Абдулрашид', { gender: 'male' });
  anna.fatherId = 'af';

  const summary = getKinshipExplanation(bauyrzhan, annaFather, [bauyrzhan, anna, annaFather]).summary;

  assert.match(summary, /Бұл адам жұбайыңыздың/);
  assert.match(summary, /Сізге қайын ата болады/);
  assert.doesNotMatch(summary, /Анна/i);
  assert.doesNotMatch(summary, /path|граф|node|step/i);
});

test('human: maternal uncle explains as nagashy aga', () => {
  const grandpa = mockRelative('gp', 'Қасым', { gender: 'male' });
  const grandma = mockRelative('gm', 'Зейнеп', { gender: 'female' });
  const mother = mockRelative('m', 'Фирдаус', {
    gender: 'female',
    fatherId: 'gp',
    motherId: 'gm',
    birthdayYear: 1970,
  });
  const nagashyAga = mockRelative('uncle', 'Ерлан', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
    birthdayYear: 1965,
  });
  const root = mockRelative('root', 'Алмас', { gender: 'male', motherId: 'm', birthdayYear: 1995 });

  const result = classifyKinship(root, nagashyAga, [root, mother, nagashyAga, grandpa, grandma]);
  const summary = buildHumanKinshipExplanation(result, true);

  assert.equal(result.type, 'nagashy_aga');
  assert.match(summary, /Бұл адам анаңыздың ағасы/);
  assert.match(summary, /Сізге нағашы аға болады/);
});

test('human: direct father is one short sentence', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });

  const summary = getKinshipExplanation(root, father, [root, father]).summary;

  assert.equal(summary, 'Бұл адам сіздің әкеңіз.');
});

test('human: unknown link stays soft and short', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const stranger = mockRelative('s', 'Бейтаныс', { gender: 'male' });

  const summary = getKinshipExplanation(root, stranger, [root, stranger]).summary;

  assert.match(summary, /толықтырылады|анықталмады/i);
  assert.doesNotMatch(summary, /BFS|traversal|pathSteps/i);
});

test('human: kuda uses natural wording without spouse names', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female', spouseId: 'f' });
  const bauyrzhan = mockRelative('b', 'Бауыржан', { gender: 'male', fatherId: 'f', motherId: 'm' });
  const brother = mockRelative('bro', 'Алимжан', { gender: 'male', fatherId: 'f', motherId: 'm' });
  const anna = mockRelative('an', 'Анна', { gender: 'female', spouseId: 'b' });
  const annaFather = mockRelative('af', 'Абдулрашид', { gender: 'male' });
  anna.fatherId = 'af';

  const summary = getKinshipExplanation(brother, annaFather, [
    father,
    mother,
    bauyrzhan,
    brother,
    anna,
    annaFather,
  ]).summary;

  assert.match(summary, /бауырыңыздың жұбайының/);
  assert.match(summary, /Сізге құда болады/);
});
