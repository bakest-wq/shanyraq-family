import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import { buildFamilyLinkCandidates } from '@/utils/family-link-validation';
import {
  buildParentLinkCandidates,
  findSiblingParentTemplates,
} from '@/utils/parent-link-candidates';

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
    birthday: '',
    phone: '',
    avatarColor: '#2C4A3E',
    isDeceased: false,
    gender: options.gender,
    fatherId: options.fatherId,
    motherId: options.motherId,
    spouseId: options.spouseId,
  };
}

test('existing parents stay selectable for another sibling', () => {
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
  const maiya = mockRelative('mai', 'Майя', { gender: 'female' });
  const relatives = [father, mother, bauyrzhan, alimzhan, maiya];

  const fatherCandidates = buildParentLinkCandidates(relatives, 'father', {
    subjectId: maiya.id,
  });
  const motherCandidates = buildParentLinkCandidates(relatives, 'mother', {
    subjectId: maiya.id,
  });

  assert.ok(fatherCandidates.some((candidate) => candidate.id === 'f'));
  assert.ok(motherCandidates.some((candidate) => candidate.id === 'm'));
});

test('parents with existing children are not excluded', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const child = mockRelative('c', 'Бала', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
  });
  const relatives = [father, mother, child];

  const candidates = buildFamilyLinkCandidates(relatives, 'father', {
    subjectId: 'new-child',
  });

  assert.ok(candidates.some((candidate) => candidate.id === 'f'));
});

test('invalid parent candidates are excluded', () => {
  const subject = mockRelative('s', 'Майя', { gender: 'female', spouseId: 'sp' });
  const spouse = mockRelative('sp', 'Жұбай', { gender: 'male', spouseId: 's' });
  const child = mockRelative('c', 'Бала', { gender: 'male', fatherId: 's' });
  const validFather = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const relatives = [subject, spouse, child, validFather];

  const candidates = buildParentLinkCandidates(relatives, 'father', {
    subjectId: subject.id,
    links: { spouseId: spouse.id },
  });

  assert.equal(
    candidates.some((candidate) => candidate.id === subject.id),
    false,
  );
  assert.equal(
    candidates.some((candidate) => candidate.id === child.id),
    false,
  );
  assert.equal(
    candidates.some((candidate) => candidate.id === spouse.id),
    false,
  );
  assert.ok(candidates.some((candidate) => candidate.id === validFather.id));
});

test('shared parents are sorted first and flagged', () => {
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
  const otherMale = mockRelative('x', 'Болат', { gender: 'male' });
  const maiya = mockRelative('mai', 'Майя', { gender: 'female' });
  const relatives = [father, mother, bauyrzhan, alimzhan, otherMale, maiya];

  const candidates = buildParentLinkCandidates(relatives, 'father', {
    subjectId: maiya.id,
  });

  assert.equal(candidates[0]?.id, 'f');
  assert.equal(candidates[0]?.isSharedParent, true);
  assert.equal(candidates.some((candidate) => candidate.id === 'x'), true);
});

test('findSiblingParentTemplates returns siblings with parents', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const alimzhan = mockRelative('a', 'Алимжан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
  });
  const maiya = mockRelative('mai', 'Майя', { gender: 'female' });
  const relatives = [father, mother, alimzhan, maiya];

  const templates = findSiblingParentTemplates(relatives, maiya.id);

  assert.equal(templates.length, 1);
  assert.equal(templates[0]?.sibling.id, 'a');
  assert.equal(templates[0]?.fatherId, 'f');
  assert.equal(templates[0]?.motherId, 'm');
});
