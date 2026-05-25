import assert from 'node:assert/strict';
import test from 'node:test';

import type { CreateRelativeInput, Relative } from '@/types/relative';
import {
  detectHighConfidenceDuplicateRelatives,
  fullNameSimilarity,
  scoreDuplicateRelativePair,
} from '@/services/duplicate-relative.engine';

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
    relationship: 'Туысы',
    birthday: '',
    phone: '',
    avatarColor: '#2C4A3E',
    isDeceased: false,
    gender: options.gender,
    fatherId: options.fatherId,
    motherId: options.motherId,
    spouseId: options.spouseId,
    birthdayYear: options.birthdayYear,
  };
}

function mockInput(
  firstName: string,
  options: Partial<CreateRelativeInput> = {},
): CreateRelativeInput {
  return {
    fullName: firstName,
    firstName,
    displayName: firstName,
    relationship: 'Туысы',
    birthday: '',
    phone: '',
    gender: options.gender,
    fatherId: options.fatherId,
    motherId: options.motherId,
    spouseId: options.spouseId,
    birthdayYear: options.birthdayYear,
    ...options,
  };
}

test('fullNameSimilarity matches exact and partial token overlap', () => {
  assert.equal(fullNameSimilarity('Бауыржан Қасым', 'Бауыржан Қасым'), 1);
  assert.ok(fullNameSimilarity('Бауыржан Қасым', 'Бауыржан Касым') >= 0.33);
});

test('high confidence: same name and birth year', () => {
  const existing = mockRelative('e1', 'Майра', { birthdayYear: 1992 });
  const input = mockInput('Майра', { birthdayYear: 1992 });

  const match = scoreDuplicateRelativePair(input, existing);
  assert.ok(match);
  assert.equal(match.confidence, 'high');
  assert.ok(match.signals.includes('full_name'));
  assert.ok(match.signals.includes('birth_year'));
});

test('high confidence: same parents and similar name', () => {
  const father = mockRelative('f', 'Әке', { gender: 'male' });
  const existing = mockRelative('e1', 'Алмас', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
  });
  const input = mockInput('Алмасхан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
  });

  const matches = detectHighConfidenceDuplicateRelatives(input, [father, existing]);
  assert.equal(matches.length, 1);
  assert.equal(matches[0]?.relativeId, 'e1');
  assert.ok(matches[0]?.signals.includes('parent_link'));
});

test('high confidence: same spouse link and name', () => {
  const spouse = mockRelative('s', 'Айгүл', { gender: 'female' });
  const existing = mockRelative('e1', 'Бауыржан', {
    gender: 'male',
    spouseId: 's',
  });
  const input = mockInput('Бауыржан', { gender: 'male', spouseId: 's' });

  const matches = detectHighConfidenceDuplicateRelatives(input, [spouse, existing]);
  assert.equal(matches.length, 1);
  assert.ok(matches[0]?.signals.includes('spouse_link'));
});

test('low-signal partial name alone does not reach high confidence', () => {
  const existing = mockRelative('e1', 'Бауыржан');
  const input = mockInput('Айгүл');

  const matches = detectHighConfidenceDuplicateRelatives(input, [existing]);
  assert.equal(matches.length, 0);
});

test('detectHighConfidenceDuplicateRelatives excludes target id when editing', () => {
  const existing = mockRelative('e1', 'Майра', { birthdayYear: 1990 });
  const input = mockInput('Майра', { birthdayYear: 1990 });

  const matches = detectHighConfidenceDuplicateRelatives(input, [existing], {
    excludeRelativeId: 'e1',
  });

  assert.equal(matches.length, 0);
});
