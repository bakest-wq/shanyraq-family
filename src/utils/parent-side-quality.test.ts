import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  evaluateParentSideGuard,
  getParentGrandparentLinks,
  sharesExactParentsWith,
} from '@/utils/parent-side-quality';

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
    birthdayYear: options.birthdayYear,
  };
}

test('getParentGrandparentLinks requires both structural parent ids', () => {
  const partial = mockRelative('p', 'Parent', { fatherId: 'gf' });
  const complete = mockRelative('p2', 'Parent', { fatherId: 'gf', motherId: 'gm' });

  assert.equal(getParentGrandparentLinks(partial), null);
  assert.deepEqual(getParentGrandparentLinks(complete), {
    fatherId: 'gf',
    motherId: 'gm',
  });
});

test('evaluateParentSideGuard blocks when parent is missing', () => {
  const root = mockRelative('root', 'Root', { gender: 'male' });
  const guard = evaluateParentSideGuard('father', root, [root]);

  assert.equal(guard.state, 'parent_missing');
});

test('evaluateParentSideGuard blocks when grandparents are incomplete', () => {
  const father = mockRelative('f', 'Father', { gender: 'male', fatherId: 'gf' });
  const root = mockRelative('root', 'Root', { gender: 'male', fatherId: 'f' });
  const guard = evaluateParentSideGuard('father', root, [father, root]);

  assert.equal(guard.state, 'grandparents_missing');
});

test('evaluateParentSideGuard is ready with complete parent chain', () => {
  const grandfather = mockRelative('gf', 'Grandfather', { gender: 'male' });
  const grandmother = mockRelative('gm', 'Grandmother', { gender: 'female' });
  const father = mockRelative('f', 'Father', {
    gender: 'male',
    fatherId: 'gf',
    motherId: 'gm',
  });
  const root = mockRelative('root', 'Root', { gender: 'male', fatherId: 'f' });
  const guard = evaluateParentSideGuard('father', root, [grandfather, grandmother, father, root]);

  assert.equal(guard.state, 'ready');
  if (guard.state === 'ready') {
    assert.deepEqual(guard.grandparents, { fatherId: 'gf', motherId: 'gm' });
  }
});

test('sharesExactParentsWith requires both parents and does not guess half siblings', () => {
  const parent = mockRelative('f', 'Father', {
    gender: 'male',
    fatherId: 'gf',
    motherId: 'gm',
  });
  const fullSibling = mockRelative('u', 'Uncle', {
    gender: 'male',
    fatherId: 'gf',
    motherId: 'gm',
  });
  const halfSibling = mockRelative('h', 'Half', { gender: 'male', fatherId: 'gf' });
  const grandparents = { fatherId: 'gf', motherId: 'gm' };

  assert.equal(sharesExactParentsWith(fullSibling, parent, grandparents), true);
  assert.equal(sharesExactParentsWith(halfSibling, parent, grandparents), false);
  assert.equal(sharesExactParentsWith(parent, parent, grandparents), false);
});
