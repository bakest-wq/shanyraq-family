import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  buildKinshipStructuralFingerprint,
  buildJurtGraphFingerprint,
  hasStructuralKinshipChange,
} from '@/services/kinship/family-structural-fingerprint';
import { kinshipCacheService, invalidateKinshipCache } from '@/services/kinship/kinship-cache.service';
import {
  analyzeKinship,
  getKinshipCardLine,
  getKinshipLabel,
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
    phone: '',
    avatarColor: '#2C4A3E',
    isDeceased: options.isDeceased ?? false,
    gender: options.gender,
    fatherId: options.fatherId,
    motherId: options.motherId,
    spouseId: options.spouseId,
    notes: options.notes,
  };
}

test('structural fingerprint ignores notes-only updates', () => {
  const before = [mockRelative('a', 'Айгүл', { notes: 'Ескі жазба' })];
  const after = [mockRelative('a', 'Айгүл', { notes: 'Жаңа жазба' })];

  assert.equal(buildKinshipStructuralFingerprint(before), buildKinshipStructuralFingerprint(after));
  assert.equal(hasStructuralKinshipChange(before, after), false);
});

test('structural fingerprint changes when parent link changes', () => {
  const father = mockRelative('f', 'Әке', { gender: 'male' });
  const before = [father, mockRelative('c', 'Бала', { gender: 'male' })];
  const after = [father, mockRelative('c', 'Бала', { gender: 'male', fatherId: 'f' })];

  assert.notEqual(buildKinshipStructuralFingerprint(before), buildKinshipStructuralFingerprint(after));
  assert.equal(hasStructuralKinshipChange(before, after), true);
});

test('jurt fingerprint changes when deceased flag toggles', () => {
  const before = [mockRelative('a', 'Айгүл', { isDeceased: false })];
  const after = [mockRelative('a', 'Айгүл', { isDeceased: true })];

  assert.equal(buildKinshipStructuralFingerprint(before), buildKinshipStructuralFingerprint(after));
  assert.notEqual(buildJurtGraphFingerprint(before), buildJurtGraphFingerprint(after));
});

test('kinship cache reuses pair results until structural change', () => {
  invalidateKinshipCache();

  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const child = mockRelative('c', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const relatives = [father, child];

  kinshipCacheService.syncStructuralState(relatives, 'family-1');

  const first = getKinshipLabel(father, child, relatives);
  const second = getKinshipLabel(father, child, relatives);

  assert.equal(first.type, 'son');
  assert.equal(second.type, 'son');
  assert.equal(kinshipCacheService.getStats().pairEntries, 1);

  child.notes = 'Жаңа ескертпе';
  kinshipCacheService.syncStructuralState(relatives, 'family-1');
  getKinshipLabel(father, child, relatives);
  assert.equal(kinshipCacheService.getStats().pairEntries, 1);

  child.fatherId = undefined;
  kinshipCacheService.syncStructuralState(relatives, 'family-1');
  getKinshipLabel(father, child, relatives);
  assert.equal(kinshipCacheService.getStats().pairEntries, 1);
});

test('kinship cache is root-scoped', () => {
  invalidateKinshipCache();

  const father = mockRelative('f', 'Әке', { gender: 'male' });
  const mother = mockRelative('m', 'Ана', { gender: 'female', spouseId: 'f' });
  father.spouseId = 'm';
  const child = mockRelative('c', 'Бала', { gender: 'male', fatherId: 'f', motherId: 'm' });
  const relatives = [father, mother, child];

  kinshipCacheService.syncStructuralState(relatives, 'family-1');

  const fromFather = getKinshipCardLine(father, mother, relatives);
  const fromChild = getKinshipCardLine(child, mother, relatives);

  assert.match(fromFather, /әйел/i);
  assert.match(fromChild, /ана/i);
  assert.equal(kinshipCacheService.getStats().pairEntries, 2);

  const fatherIntel = analyzeKinship(father, child, relatives);
  const childIntel = analyzeKinship(child, father, relatives);

  assert.equal(fatherIntel.label.type, 'son');
  assert.equal(childIntel.label.type, 'father');
});

test('family switch clears kinship cache', () => {
  invalidateKinshipCache();

  const root = mockRelative('r', 'Тұлға', { gender: 'male' });
  const target = mockRelative('t', 'Туысы', { gender: 'female' });
  const relatives = [root, target];

  kinshipCacheService.syncStructuralState(relatives, 'family-a');
  getKinshipLabel(root, target, relatives);
  assert.equal(kinshipCacheService.getStats().pairEntries, 1);

  kinshipCacheService.syncStructuralState(relatives, 'family-b');
  assert.equal(kinshipCacheService.getStats().pairEntries, 0);
});
