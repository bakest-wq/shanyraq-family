import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import { getKinshipLabel } from '@/utils/kinship/getKinshipLabel';
import { explainKinshipToMe } from '@/utils/kinship/explainKinship';

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

test('brother wife => jenge', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female', spouseId: 'f' });
  const root = mockRelative('root', 'Бауыржан', {
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
  const wife = mockRelative('wife', 'Эльмира', {
    gender: 'female',
    spouseId: 'bro',
  });

  const relatives = [father, mother, root, brother, wife];
  const result = getKinshipLabel(root, wife, relatives);

  assert.equal(result.type, 'jenge');
  assert.match(result.label.kazakh, /Жеңге/);
});

test('sister husband => jezde', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const root = mockRelative('root', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
  });
  const sister = mockRelative('sis', 'Айша', {
    gender: 'female',
    fatherId: 'f',
    motherId: 'm',
  });
  const husband = mockRelative('h', 'Марат', {
    gender: 'male',
    spouseId: 'sis',
  });

  const relatives = [father, mother, root, sister, husband];
  const result = getKinshipLabel(root, husband, relatives);

  assert.equal(result.type, 'jezde');
});

test('son wife => kelin', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const son = mockRelative('son', 'Аbdulla', {
    gender: 'male',
    fatherId: 'root',
  });
  const kelin = mockRelative('kelin', 'Айгерим', {
    gender: 'female',
    spouseId: 'son',
  });

  const result = getKinshipLabel(root, kelin, [root, son, kelin]);
  assert.equal(result.type, 'kelin');
});

test('daughter husband => kuyeu_bala', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const daughter = mockRelative('d', 'Асия', {
    gender: 'female',
    fatherId: 'root',
  });
  const zyat = mockRelative('z', 'Ерлан', {
    gender: 'male',
    spouseId: 'd',
  });

  const result = getKinshipLabel(root, zyat, [root, daughter, zyat]);
  assert.equal(result.type, 'kuyeu_bala');
});

test('spouse father => kayin_ata', () => {
  const kayinAta = mockRelative('ka', 'Серік', { gender: 'male' });
  const spouse = mockRelative('sp', 'Анна', {
    gender: 'female',
    fatherId: 'ka',
  });
  const root = mockRelative('root', 'Бауыржан', {
    gender: 'male',
    spouseId: 'sp',
  });

  const result = getKinshipLabel(root, kayinAta, [root, spouse, kayinAta]);
  assert.equal(result.type, 'kayin_ata');
});

test('labels recalculate when root changes', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const bauyrzhan = mockRelative('b', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
  });
  const alimzhan = mockRelative('a', 'Алимжан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
  });
  const anna = mockRelative('an', 'Анна', {
    gender: 'female',
    spouseId: 'b',
  });

  const relatives = [father, mother, bauyrzhan, alimzhan, anna];

  const fromBauyrzhan = getKinshipLabel(bauyrzhan, anna, relatives);
  const fromAlimzhan = getKinshipLabel(alimzhan, anna, relatives);

  assert.equal(fromBauyrzhan.type, 'wife');
  assert.equal(fromAlimzhan.type, 'jenge');
});

test('mother brother => nagashy aga/ini', () => {
  const nagashyAta = mockRelative('nga', 'Қасым', { gender: 'male' });
  const nagashyAje = mockRelative('ngj', 'Зейнеп', { gender: 'female' });
  const mother = mockRelative('m', 'Фирдаус', {
    gender: 'female',
    fatherId: 'nga',
    motherId: 'ngj',
    birthdayYear: 1970,
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

  const result = getKinshipLabel(root, uncle, [root, mother, uncle, nagashyAta, nagashyAje]);
  assert.equal(result.type, 'nagashy_aga');
});

test('mother father => nagashy ata', () => {
  const nagashyAta = mockRelative('nga', 'Қасым', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', {
    gender: 'female',
    fatherId: 'nga',
  });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', motherId: 'm' });

  const result = getKinshipLabel(root, nagashyAta, [root, mother, nagashyAta]);
  assert.equal(result.type, 'nagashy_ata');
});

test('sister child => zhien', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const root = mockRelative('root', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
  });
  const sister = mockRelative('sis', 'Айжан', {
    gender: 'female',
    fatherId: 'f',
    motherId: 'm',
  });
  const zhien = mockRelative('zh', 'Мұрат', {
    gender: 'male',
    motherId: 'sis',
  });

  const result = getKinshipLabel(root, zhien, [father, mother, root, sister, zhien]);
  assert.equal(result.type, 'zhien');
});

test('maternal aunt children => bole', () => {
  const nagAta = mockRelative('nga', 'Қасым', { gender: 'male' });
  const nagAje = mockRelative('ngj', 'Зейнеп', { gender: 'female' });
  const mother = mockRelative('m', 'Фирдаус', {
    gender: 'female',
    fatherId: 'nga',
    motherId: 'ngj',
  });
  const aunt = mockRelative('aunt', 'Гүлнар', {
    gender: 'female',
    fatherId: 'nga',
    motherId: 'ngj',
  });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', motherId: 'm' });
  const cousin = mockRelative('cousin', 'Аружан', {
    gender: 'female',
    motherId: 'aunt',
  });

  const result = getKinshipLabel(root, cousin, [root, mother, aunt, cousin, nagAta, nagAje]);
  assert.equal(result.type, 'bole');
});

test('grandchild => nemere, great-grandchild => shobere', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const child = mockRelative('c', 'Алмас', { gender: 'male', fatherId: 'root' });
  const nemere = mockRelative('n', 'Дана', { gender: 'female', fatherId: 'c' });
  const shobere = mockRelative('s', 'Ера', { gender: 'male', fatherId: 'n' });

  assert.equal(getKinshipLabel(root, nemere, [root, child, nemere, shobere]).type, 'nemere');
  assert.equal(getKinshipLabel(root, shobere, [root, child, nemere, shobere]).type, 'shobere');
});

test('father brother => paternal aga', () => {
  const grand = mockRelative('gp', 'Нұрлан', { gender: 'male' });
  const father = mockRelative('f', 'Ғалымжан', {
    gender: 'male',
    fatherId: 'gp',
    birthdayYear: 1970,
  });
  const uncle = mockRelative('u', 'Серік', {
    gender: 'male',
    fatherId: 'gp',
    birthdayYear: 1965,
  });
  const root = mockRelative('root', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f',
  });

  const result = getKinshipLabel(root, uncle, [root, father, uncle, grand]);
  assert.equal(result.type, 'paternal_aga');
});

test('child spouse father => kuda', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const son = mockRelative('son', 'Алмас', { gender: 'male', fatherId: 'root' });
  const kuda = mockRelative('kuda', 'Талғат', { gender: 'male' });
  const kelin = mockRelative('kelin', 'Айгерим', {
    gender: 'female',
    spouseId: 'son',
    fatherId: 'kuda',
  });

  const result = getKinshipLabel(root, kuda, [root, son, kelin, kuda]);
  assert.equal(result.type, 'kuda');
});

test('bole explanation mentions apaly-singli', () => {
  const nagAta = mockRelative('nga', 'Қасым', { gender: 'male' });
  const nagAje = mockRelative('ngj', 'Зейнеп', { gender: 'female' });
  const mother = mockRelative('m', 'Фирдаус', {
    gender: 'female',
    fatherId: 'nga',
    motherId: 'ngj',
  });
  const aunt = mockRelative('aunt', 'Гүлнар', {
    gender: 'female',
    fatherId: 'nga',
    motherId: 'ngj',
  });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', motherId: 'm' });
  const cousin = mockRelative('cousin', 'Аружан', {
    gender: 'female',
    motherId: 'aunt',
  });
  const relatives = [root, mother, aunt, cousin, nagAta, nagAje];

  const explanation = explainKinshipToMe(root, cousin, relatives);
  assert.match(explanation.summary, /апалы-сіңлі/i);
});

test('unknown kinship includes confidence hint when parents missing', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const stranger = mockRelative('s', 'Бейтаныс', { gender: 'male' });

  const result = getKinshipLabel(root, stranger, [root, stranger]);
  assert.equal(result.type, 'unknown');
  assert.match(result.confidenceHint ?? '', /әke\/ана/i);
});
