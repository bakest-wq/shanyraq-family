import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  BROAD_KINSHIP_LABELS,
  getKinshipCardLine,
  getKinshipConfidence,
  getKinshipExplanation,
  getKinshipLabel,
  resolveConfidenceSafeLabel,
  scoreKinshipConfidence,
} from '@/services/kinship';
import { buildKinshipResult, PARTIAL_PARENT_HINT } from '@/utils/kinship/classify-helpers';

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

test('high confidence kuda shows precise label Құда', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const bauyrzhan = mockRelative('b', 'Бауыржан', { gender: 'male', fatherId: 'f', motherId: 'm' });
  const brother = mockRelative('bro', 'Алимжан', { gender: 'male', fatherId: 'f', motherId: 'm' });
  const anna = mockRelative('an', 'Анна', { gender: 'female', spouseId: 'b' });
  const annaFather = mockRelative('af', 'Абдулрашид', { gender: 'male' });
  anna.fatherId = 'af';
  const relatives = [father, mother, bauyrzhan, brother, anna, annaFather];

  const result = getKinshipLabel(brother, annaFather, relatives);
  assert.equal(getKinshipConfidence(brother, annaFather, relatives), 'high');
  assert.equal(getKinshipCardLine(brother, annaFather, relatives), 'Құда');
});

test('medium confidence kuda_neutral shows broad Құдалық байланыс not Құда', () => {
  const result = buildKinshipResult('kuda_neutral', {
    uncertain: true,
    confidenceHint: BROAD_KINSHIP_LABELS.kuda,
    pathSteps: [],
  });

  assert.equal(scoreKinshipConfidence(result), 'medium');
  assert.equal(resolveConfidenceSafeLabel(result), BROAD_KINSHIP_LABELS.kuda);
  assert.doesNotMatch(resolveConfidenceSafeLabel(result), /^Құда$/);
});

test('uncertain sibling age falls back to Бауыр not precise аға', () => {
  const result = buildKinshipResult('aga', {
    uncertain: true,
    missingGenderHint: false,
    pathSteps: [{ person: mockRelative('s', 'Алимжан', { gender: 'male' }), stepLabel: 'аға' }],
  });

  assert.equal(scoreKinshipConfidence(result), 'medium');
  assert.equal(resolveConfidenceSafeLabel(result), BROAD_KINSHIP_LABELS.sibling);
});

test('low confidence unknown shows incomplete link message', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const stranger = mockRelative('s', 'Бейтаныс', { gender: 'male' });

  assert.equal(getKinshipConfidence(root, stranger, [root, stranger]), 'low');
  assert.equal(getKinshipCardLine(root, stranger, [root, stranger]), PARTIAL_PARENT_HINT);
});

test('high confidence kayin ata stays precise', () => {
  const bauyrzhan = mockRelative('b', 'Бауыржан', { gender: 'male' });
  const anna = mockRelative('an', 'Анна', { gender: 'female', spouseId: 'b' });
  const annaFather = mockRelative('af', 'Абдулрашид', { gender: 'male' });
  anna.fatherId = 'af';

  assert.equal(getKinshipConfidence(bauyrzhan, annaFather, [bauyrzhan, anna, annaFather]), 'high');
  assert.match(getKinshipCardLine(bauyrzhan, annaFather, [bauyrzhan, anna, annaFather]), /Қайын ата/);
});

test('medium confidence softens kuda explanation', () => {
  const result = buildKinshipResult('kuda', {
    uncertain: true,
    pathSteps: [
      { person: mockRelative('c', 'Алмас', { gender: 'male' }), stepLabel: 'ұлы' },
      { person: mockRelative('af', 'Абдулрашид', { gender: 'male' }), stepLabel: 'құда' },
    ],
  });

  const label = resolveConfidenceSafeLabel(result, 'medium');
  assert.equal(label, BROAD_KINSHIP_LABELS.kuda);
});

test('never appends fake (мүмкін) suffix to card labels', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f', motherId: 'm' });
  const sibling = mockRelative('s', 'Алимжан', { gender: 'male', fatherId: 'f', motherId: 'm', birthdayYear: 1995 });
  root.birthdayYear = 1990;

  const line = getKinshipCardLine(root, sibling, [root, sibling, father, mother]);
  assert.doesNotMatch(line, /\(мүмкін\)/);
});

test('explanation title uses confidence-safe label', () => {
  const result = buildKinshipResult('kuda_neutral', {
    uncertain: true,
    confidenceHint: BROAD_KINSHIP_LABELS.kuda,
  });

  assert.equal(resolveConfidenceSafeLabel(result), BROAD_KINSHIP_LABELS.kuda);
});

function buildAnnaSpouseSiblingFamily(options: {
  suffix: string;
  siblingGender: 'male' | 'female';
  spouseBirthYear?: number;
  siblingBirthYear?: number;
}) {
  const id = options.suffix;
  const father = mockRelative(`f-${id}`, 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative(`m-${id}`, 'Фирдаус', { gender: 'female', spouseId: `f-${id}` });
  const spouse = mockRelative(`sp-${id}`, 'Бауыржан', {
    gender: 'male',
    fatherId: `f-${id}`,
    motherId: `m-${id}`,
    spouseId: `root-${id}`,
    birthdayYear: options.spouseBirthYear ?? 1990,
  });
  const root = mockRelative(`root-${id}`, 'Анна', { gender: 'female', spouseId: `sp-${id}` });
  const sibling = mockRelative(`sib-${id}`, options.siblingGender === 'male' ? 'Алимжан' : 'Айжан', {
    gender: options.siblingGender,
    fatherId: `f-${id}`,
    motherId: `m-${id}`,
    birthdayYear: options.siblingBirthYear,
  });

  return { root, spouse, sibling, relatives: [father, mother, spouse, root, sibling] };
}

test('spouse brother older => Қайын аға', () => {
  const { root, sibling, relatives } = buildAnnaSpouseSiblingFamily({
    suffix: 'bro-older',
    siblingGender: 'male',
    spouseBirthYear: 1990,
    siblingBirthYear: 1988,
  });

  assert.equal(getKinshipLabel(root, sibling, relatives).type, 'kayin_aga');
  assert.equal(getKinshipCardLine(root, sibling, relatives), 'Қайын аға');
});

test('spouse brother younger => Қайын іні', () => {
  const { root, sibling, relatives } = buildAnnaSpouseSiblingFamily({
    suffix: 'bro-younger',
    siblingGender: 'male',
    spouseBirthYear: 1990,
    siblingBirthYear: 1992,
  });

  assert.equal(getKinshipLabel(root, sibling, relatives).type, 'kayin_ini');
  assert.equal(getKinshipCardLine(root, sibling, relatives), 'Қайын іні');
});

test('spouse sister older => Қайын әпке', () => {
  const { root, sibling, relatives } = buildAnnaSpouseSiblingFamily({
    suffix: 'sis-older',
    siblingGender: 'female',
    spouseBirthYear: 1990,
    siblingBirthYear: 1988,
  });

  assert.equal(getKinshipLabel(root, sibling, relatives).type, 'kayin_apke');
  assert.equal(getKinshipCardLine(root, sibling, relatives), 'Қайын әпке');
});

test('spouse sister younger => Қайын сіңлі', () => {
  const { root, sibling, relatives } = buildAnnaSpouseSiblingFamily({
    suffix: 'sis-younger',
    siblingGender: 'female',
    spouseBirthYear: 1990,
    siblingBirthYear: 1995,
  });

  assert.equal(getKinshipLabel(root, sibling, relatives).type, 'kayin_singli');
  assert.equal(getKinshipCardLine(root, sibling, relatives), 'Қайын сіңлі');
});

test('spouse sibling without birth year falls back to gender-safe kayin labels not Қайын туыс', () => {
  const { root, sibling, relatives } = buildAnnaSpouseSiblingFamily({
    suffix: 'bro-no-year',
    siblingGender: 'male',
  });

  assert.equal(getKinshipLabel(root, sibling, relatives).type, 'kayin_aga');
  assert.equal(getKinshipCardLine(root, sibling, relatives), 'Қайын аға');
  assert.notEqual(getKinshipCardLine(root, sibling, relatives), BROAD_KINSHIP_LABELS.kayin);
});
