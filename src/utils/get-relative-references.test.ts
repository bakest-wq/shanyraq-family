import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  formatRelativeReferencesMessage,
  getRelativeReferences,
} from '@/utils/get-relative-references';

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
  };
}

test('getRelativeReferences finds father, mother, and spouse links', () => {
  const subject = mockRelative('dad', 'Әke', { gender: 'male' });
  const child = mockRelative('child', 'Bala', { fatherId: 'dad' });
  const spouse = mockRelative('wife', 'Ayel', { spouseId: 'dad' });
  const relatives = [subject, child, spouse];

  const refs = getRelativeReferences('dad', relatives);

  assert.equal(refs.hasReferences, true);
  assert.equal(refs.links.length, 2);
  assert.equal(refs.referencingRelatives.length, 2);
  assert.equal(refs.clearReferencePatches.length, 2);
  assert.ok(refs.links.some((link) => link.kind === 'father' && link.relative.id === 'child'));
  assert.ok(refs.links.some((link) => link.kind === 'spouse' && link.relative.id === 'wife'));
});

test('getRelativeReferences returns empty when no structural links', () => {
  const person = mockRelative('solo', 'Solo');
  const refs = getRelativeReferences('solo', [person]);

  assert.equal(refs.hasReferences, false);
  assert.equal(refs.links.length, 0);
  assert.equal(refs.clearReferencePatches.length, 0);
});

test('formatRelativeReferencesMessage lists names with relationship type', () => {
  const parent = mockRelative('dad', 'Bolat');
  const child = mockRelative('child', 'Ayan', { fatherId: 'dad' });
  const refs = getRelativeReferences('dad', [parent, child]);

  const message = formatRelativeReferencesMessage(refs.links);

  assert.match(message, /Ayan/);
  assert.match(message, /Әкesi/);
});
