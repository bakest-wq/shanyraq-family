import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  analyzeKinship,
  getKinshipCardLine,
  getKinshipConfidence,
  getKinshipExplanation,
  getKinshipLabel,
  getKinshipPath,
  getThreeJurtGroup,
  JURT_GROUP_LABELS,
  scoreKinshipConfidence,
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
  });
  anna.fatherId = 'af';

  const son = mockRelative('son', 'Алмас', {
    gender: 'male',
    fatherId: 'b',
    motherId: 'an',
  });

  return { father, mother, bauyrzhan, brother, anna, annaFather, son };
}

// —— Vision examples: same person, different roots ——

test('vision: Baurzhan → Abdurashid = kayin ata', () => {
  const { bauyrzhan, anna, annaFather, father, mother } = buildBauyrzhanFamily();
  const relatives = [father, mother, bauyrzhan, anna, annaFather];

  const intel = analyzeKinship(bauyrzhan, annaFather, relatives);
  assert.equal(intel.label.type, 'kayin_ata');
  assert.match(intel.cardLine, /Қайын ата/);
  assert.match(intel.explanation.summary, /жұбай/i);
  assert.match(intel.explanation.summary, /қайын ата/i);
  assert.equal(intel.jurtGroup, 'kaiyn_jurt');
});

test('vision: Baurzhan son → Abdurashid = nagashy ata', () => {
  const { son, anna, annaFather, bauyrzhan } = buildBauyrzhanFamily();
  const relatives = [bauyrzhan, anna, annaFather, son];

  const result = getKinshipLabel(son, annaFather, relatives);
  assert.equal(result.type, 'nagashy_ata');
  assert.equal(getThreeJurtGroup(son, annaFather, relatives), 'nagashy_jurt');
  assert.match(getKinshipExplanation(son, annaFather, relatives).summary, /нағашы ата/i);
});

test('vision: Anna → Abdurashid = father', () => {
  const { anna, annaFather } = buildBauyrzhanFamily();
  assert.equal(getKinshipLabel(anna, annaFather, [anna, annaFather]).type, 'father');
});

test('vision: Baurzhan brother → Abdurashid = kuda', () => {
  const { bauyrzhan, brother, anna, annaFather, father, mother } = buildBauyrzhanFamily();
  const relatives = [father, mother, bauyrzhan, brother, anna, annaFather];

  const result = getKinshipLabel(brother, annaFather, relatives);
  assert.equal(result.type, 'kuda');
  assert.match(getKinshipExplanation(brother, annaFather, relatives).summary, /құда/i);
  assert.equal(getThreeJurtGroup(brother, annaFather, relatives), 'kuda_jurt');
});

test('root switching recalculates all dimensions', () => {
  const { bauyrzhan, brother, anna, annaFather, father, mother, son } = buildBauyrzhanFamily();
  const relatives = [father, mother, bauyrzhan, brother, anna, annaFather, son];

  assert.equal(getKinshipLabel(bauyrzhan, annaFather, relatives).type, 'kayin_ata');
  assert.equal(getKinshipLabel(son, annaFather, relatives).type, 'nagashy_ata');
  assert.equal(getKinshipLabel(brother, annaFather, relatives).type, 'kuda');
  assert.equal(getKinshipLabel(anna, annaFather, relatives).type, 'father');
});

// —— Paternal side ——

test('paternal: father => ake, grandfather => ata', () => {
  const grandfather = mockRelative('gp', 'Қабдолла', { gender: 'male' });
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male', fatherId: 'gp' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const relatives = [grandfather, father, root];

  assert.equal(getKinshipLabel(root, father, relatives).type, 'father');
  assert.equal(getKinshipCardLine(root, grandfather, relatives), 'Ата');
  assert.equal(getThreeJurtGroup(root, grandfather, relatives), 'oz_jurt');
});

// —— Maternal side ——

test('maternal: mother father => nagashy ata', () => {
  const nagashyAta = mockRelative('nga', 'Ерлан', { gender: 'male' });
  const mother = mockRelative('m', 'Айгül', { gender: 'female', fatherId: 'nga' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', motherId: 'm' });
  const relatives = [root, mother, nagashyAta];

  assert.equal(getKinshipLabel(root, nagashyAta, relatives).type, 'nagashy_ata');
  assert.equal(getThreeJurtGroup(root, nagashyAta, relatives), 'nagashy_jurt');
});

test('maternal: aunt child => bole', () => {
  const nagAta = mockRelative('nga', 'Қасым', { gender: 'male' });
  const nagAje = mockRelative('ngj', 'Зейнеп', { gender: 'female' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female', fatherId: 'nga', motherId: 'ngj' });
  const aunt = mockRelative('aunt', 'Гүлнар', { gender: 'female', fatherId: 'nga', motherId: 'ngj' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', motherId: 'm' });
  const cousin = mockRelative('cousin', 'Аружан', { gender: 'female', motherId: 'aunt' });

  assert.equal(
    getKinshipLabel(root, cousin, [root, mother, aunt, cousin, nagAta, nagAje]).type,
    'bole',
  );
});

// —— In-laws ——

test('in-law: older brother wife => jenge, younger brother wife => kelin, sister husband => jezde', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const root = mockRelative('root', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
    birthdayYear: 1990,
  });
  const olderBrother = mockRelative('bro-old', 'Ерлан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
    birthdayYear: 1988,
  });
  const youngerBrother = mockRelative('bro-young', 'Алимжан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
    birthdayYear: 1992,
  });
  const sister = mockRelative('sis', 'Айша', { gender: 'female', fatherId: 'f', motherId: 'm' });
  const jenge = mockRelative('wife-old', 'Эльмира', { gender: 'female', spouseId: 'bro-old' });
  const kelin = mockRelative('wife-young', 'Анна', { gender: 'female', spouseId: 'bro-young' });
  const jezde = mockRelative('h', 'Марат', { gender: 'male', spouseId: 'sis' });

  const relatives = [father, mother, root, olderBrother, youngerBrother, sister, jenge, kelin, jezde];

  assert.equal(getKinshipLabel(root, jenge, relatives).type, 'jenge');
  assert.equal(getKinshipLabel(root, kelin, relatives).type, 'kelin');
  assert.equal(getKinshipLabel(root, jezde, relatives).type, 'jezde');
});

test('in-law: son wife => kelin, daughter husband => kuyeu bala', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const son = mockRelative('son', 'Алмас', { gender: 'male', fatherId: 'root' });
  const daughter = mockRelative('d', 'Асия', { gender: 'female', fatherId: 'root' });
  const kelin = mockRelative('kelin', 'Айгерим', { gender: 'female', spouseId: 'son' });
  const zyat = mockRelative('z', 'Ерлан', { gender: 'male', spouseId: 'd' });

  assert.equal(getKinshipLabel(root, kelin, [root, son, kelin]).type, 'kelin');
  assert.equal(getKinshipLabel(root, zyat, [root, daughter, zyat]).type, 'kuyeu_bala');
});

// —— Grandchildren ——

test('grandchild => nemere', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const child = mockRelative('c', 'Алмас', { gender: 'male', fatherId: 'root' });
  const nemere = mockRelative('n', 'Айдана', { gender: 'female', fatherId: 'c' });

  assert.equal(getKinshipLabel(root, nemere, [root, child, nemere]).type, 'nemere');
  assert.equal(getThreeJurtGroup(root, nemere, [root, child, nemere]), 'direct_family');
});

test('sister child => zhien', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f', motherId: 'm' });
  const sister = mockRelative('sis', 'Айжан', { gender: 'female', fatherId: 'f', motherId: 'm' });
  const zhien = mockRelative('zh', 'Мұрат', { gender: 'male', motherId: 'sis' });

  assert.equal(getKinshipLabel(root, zhien, [father, mother, root, sister, zhien]).type, 'zhien');
});

// —— Confidence ——

test('confidence: unknown link => low', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const stranger = mockRelative('s', 'Бейтаныс', { gender: 'male' });

  assert.equal(getKinshipConfidence(root, stranger, [root, stranger]), 'low');
  assert.equal(scoreKinshipConfidence(getKinshipLabel(root, stranger, [root, stranger])), 'low');
});

test('confidence: certain direct link => high', () => {
  const { bauyrzhan, father, mother } = buildBauyrzhanFamily();
  assert.equal(getKinshipConfidence(bauyrzhan, father, [father, mother, bauyrzhan]), 'high');
});

// —— Graph path ——

test('graph path: spouse chain to kayin ata', () => {
  const { bauyrzhan, anna, annaFather, father, mother } = buildBauyrzhanFamily();
  const path = getKinshipPath(bauyrzhan, annaFather, [father, mother, bauyrzhan, anna, annaFather]);
  assert.ok(path.length >= 2);
});

// —— Jurt labels ——

test('jurt group labels are Kazakh-first', () => {
  assert.equal(JURT_GROUP_LABELS.nagashy_jurt, 'Нағашы жұрты');
  assert.equal(JURT_GROUP_LABELS.kuda_jurt, 'Құдалық байланыс');
});

// —— analyzeKinship future-ready meta ——

test('analyzeKinship returns full intelligence snapshot', () => {
  const { bauyrzhan, anna, annaFather, father, mother } = buildBauyrzhanFamily();
  const intel = analyzeKinship(bauyrzhan, annaFather, [father, mother, bauyrzhan, anna, annaFather]);

  assert.equal(intel.confidence, 'high');
  assert.ok(intel.meta.structuralPathLength >= 0);
  assert.equal(intel.meta.jurtGroup, 'kaiyn_jurt');
});
