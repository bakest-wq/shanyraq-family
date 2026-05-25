import assert from 'node:assert/strict';
import test from 'node:test';

import { buildBauyrzhanLabFamily } from '@/services/kinship/lab/kinship-lab.fixtures';
import { buildFamilyStorySnapshot } from '@/services/family-story/family-story.service';
import {
  buildFamilyStoryLineForChildren,
  buildFamilyStoryLineFromRoot,
  resolveFamilyStoryContext,
} from '@/services/family-story/family-story-lines';
import { classifyKinship } from '@/utils/kinship/classify';
import type { Relative } from '@/types/relative';

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

test('family story: maternal uncle uses warm path wording', () => {
  const grandpa = mockRelative('gp', 'Қасым', { gender: 'male' });
  const grandma = mockRelative('gm', 'Зейнеп', { gender: 'female' });
  const mother = mockRelative('m', 'Фирдаус', {
    gender: 'female',
    fatherId: 'gp',
    motherId: 'gm',
    birthdayYear: 1970,
  });
  const nagashyIni = mockRelative('uncle', 'Ерлан', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
    birthdayYear: 1975,
  });
  const root = mockRelative('root', 'Алмас', { gender: 'male', motherId: 'm', birthdayYear: 1995 });

  const result = classifyKinship(root, nagashyIni, [root, mother, nagashyIni, grandpa, grandma]);
  const line = buildFamilyStoryLineFromRoot(result, resolveFamilyStoryContext(result));

  assert.equal(result.type, 'nagashy_ini');
  assert.match(line ?? '', /Бұл кісі сіздің анаңыздың туған інісі/);
});

test('family story: nagashy ata adds forward line for children', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, nagAta } = family.members;

  const snapshot = buildFamilyStorySnapshot(bauyrzhan, nagAta, family.relatives);

  assert.match(snapshot?.fromRoot ?? '', /анаңыздың/);
  assert.match(snapshot?.forChildren ?? '', /нағашы ата болады/);
});

test('family story: suppresses uncertain links', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const stranger = mockRelative('s', 'Бейтаныс', { gender: 'male' });

  const snapshot = buildFamilyStorySnapshot(root, stranger, [root, stranger]);

  assert.equal(snapshot, null);
});

test('family story: self returns null', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan } = family.members;

  assert.equal(buildFamilyStorySnapshot(bauyrzhan, bauyrzhan, family.relatives), null);
});

test('family story: children line only for mapped kinship types', () => {
  assert.match(buildFamilyStoryLineForChildren('nagashy_ata') ?? '', /нағашы ата болады/);
  assert.equal(buildFamilyStoryLineForChildren('kuda'), null);
});

test('family story: kayin ata stays short and calm', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, annaFather } = family.members;

  const snapshot = buildFamilyStorySnapshot(bauyrzhan, annaFather, family.relatives);

  assert.match(snapshot?.fromRoot ?? '', /жұбайыңыздың/);
  assert.match(snapshot?.forChildren ?? '', /қайын ата болады/);
});
