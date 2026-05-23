import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  buildSiblingParentInheritanceOffer,
  resolveSiblingInheritanceReference,
  shouldSuggestSiblingParentInheritance,
} from '@/utils/sibling-parent-inheritance';

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

test('inherits parents from focused root for sibling relationship', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const root = mockRelative('root', 'Бауыржан', {
    relationship: 'Мен',
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
  });
  const relatives = [father, mother, root];

  const reference = resolveSiblingInheritanceReference({
    relatives,
    focusedRootId: 'root',
  });

  assert.equal(reference?.id, 'root');

  const offer = buildSiblingParentInheritanceOffer(reference!, relatives, {}, 'mai');
  assert.equal(offer?.fatherId, 'f');
  assert.equal(offer?.motherId, 'm');
});

test('does not offer inheritance when sibling already has same parents', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const root = mockRelative('root', 'Бауыржан', {
    relationship: 'Мен',
    fatherId: 'f',
    motherId: 'm',
  });
  const relatives = [father, mother, root];

  const suggestion = shouldSuggestSiblingParentInheritance(
    'Іні',
    { relatives, focusedRootId: 'root' },
    { fatherId: 'f', motherId: 'm' },
  );

  assert.equal(suggestion.offer, null);
});

test('flags missing reference parents for sibling relationship', () => {
  const root = mockRelative('root', 'Бауыржан', { relationship: 'Мен' });
  const relatives = [root];

  const suggestion = shouldSuggestSiblingParentInheritance(
    'Бауыр',
    { relatives, focusedRootId: 'root' },
    {},
  );

  assert.equal(suggestion.missingReferenceParents, true);
  assert.equal(suggestion.offer, null);
});

test('skips reference when editing the root person itself', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const root = mockRelative('root', 'Бауыржан', {
    relationship: 'Мен',
    fatherId: 'f',
  });
  const relatives = [father, root];

  const reference = resolveSiblingInheritanceReference({
    relatives,
    editingRelativeId: 'root',
    focusedRootId: 'root',
  });

  assert.equal(reference, null);
});
