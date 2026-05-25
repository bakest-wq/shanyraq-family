import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import { summarizeGraphChange, canRestoreGraphVersion } from '@/utils/graph-version-change';
import { buildKinshipStructuralFingerprint } from '@/services/kinship/family-structural-fingerprint';

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
    notes: options.notes,
  };
}

test('summarizeGraphChange detects new relative', () => {
  const before = [mockRelative('a', 'Айгүл')];
  const after = [...before, mockRelative('b', 'Бауыржан')];

  assert.match(summarizeGraphChange(before, after), /қосылды/i);
});

test('summarizeGraphChange detects parent link change', () => {
  const father = mockRelative('f', 'Әке', { gender: 'male' });
  const child = mockRelative('c', 'Бала', { gender: 'male' });
  const before = [father, child];
  const after = [father, mockRelative('c', 'Бала', { gender: 'male', fatherId: 'f' })];

  assert.match(summarizeGraphChange(before, after), /әке байланысы/i);
});

test('canRestoreGraphVersion allows change and restore kinds only', () => {
  assert.equal(canRestoreGraphVersion('change'), true);
  assert.equal(canRestoreGraphVersion('restore'), true);
  assert.equal(canRestoreGraphVersion('safety'), false);
});

test('structural fingerprint ignores notes-only updates', () => {
  const before = [mockRelative('a', 'Айгүл', { notes: 'Ескі' })];
  const after = [mockRelative('a', 'Айгүл', { notes: 'Жаңа' })];

  assert.equal(
    buildKinshipStructuralFingerprint(before),
    buildKinshipStructuralFingerprint(after),
  );
});
