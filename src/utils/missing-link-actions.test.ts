import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  buildMissingLinkNavigateParams,
  hasMissingFather,
  hasMissingMother,
  hasMissingSpouse,
  resolveMissingLinkSavePatches,
  resolvePendingMissingLinkAfterSave,
  resolveSpousePresetForTarget,
  shouldReturnToShezhireAfterSave,
} from '@/utils/missing-link-actions';

function mockRelative(
  id: string,
  firstName: string,
  options: Partial<Relative> = {},
): Relative {
  return {
    id,
    firstName,
    lastName: '',
    fullName: firstName,
    gender: 'male',
    avatarColor: '#000000',
    ...options,
  };
}

test('buildMissingLinkNavigateParams for add father', () => {
  const target = mockRelative('child', 'Бала');
  const params = buildMissingLinkNavigateParams('father', target, {
    shezhireRootId: 'child',
  });

  assert.equal(params.context, 'add_father');
  assert.equal(params.targetRelativeId, 'child');
  assert.equal(params.gender, 'male');
  assert.equal(params.relationship, 'Әке');
  assert.equal(params.returnTo, 'shezhire');
});

test('resolvePendingMissingLinkAfterSave links created parent to target', () => {
  assert.deepEqual(resolvePendingMissingLinkAfterSave('add_father', 'child'), {
    rootPersonId: 'child',
    linkField: 'fatherId',
  });
  assert.deepEqual(resolvePendingMissingLinkAfterSave('add_mother', 'child'), {
    rootPersonId: 'child',
    linkField: 'motherId',
  });
  assert.equal(resolvePendingMissingLinkAfterSave('add_spouse', 'child'), null);
});

test('resolveMissingLinkSavePatches connects all missing link kinds', () => {
  const father = mockRelative('f', 'Әke', { gender: 'male', spouseId: 'm' });
  const mother = mockRelative('m', 'Ana', { gender: 'female', spouseId: 'f' });
  const child = mockRelative('c', 'Bala');

  assert.deepEqual(resolveMissingLinkSavePatches('add_father', 'c', 'new-f'), [
    { personId: 'c', patch: { fatherId: 'new-f' } },
  ]);
  assert.deepEqual(resolveMissingLinkSavePatches('add_mother', 'c', 'new-m'), [
    { personId: 'c', patch: { motherId: 'new-m' } },
  ]);
  assert.deepEqual(resolveMissingLinkSavePatches('add_spouse', 'c', 'new-s'), [
    { personId: 'c', patch: { spouseId: 'new-s' } },
  ]);
  assert.deepEqual(
    resolveMissingLinkSavePatches('add_child', 'f', 'new-b', {
      targetPerson: father,
      spouse: mother,
    }),
    [{ personId: 'new-b', patch: { fatherId: 'f', motherId: 'm' } }],
  );
});

test('add child params use structural parent ids only', () => {
  const father = mockRelative('f', 'Әke', { gender: 'male', spouseId: 'm' });
  const mother = mockRelative('m', 'Ana', { gender: 'female', spouseId: 'f' });

  const params = buildMissingLinkNavigateParams('child', father, {
    shezhireRootId: father.id,
    spouse: mother,
  });

  assert.equal(params.context, 'add_child');
  assert.equal(params.parentRelativeId, 'f');
  assert.equal(params.fatherId, 'f');
  assert.equal(params.motherId, 'm');
  assert.equal(params.relationship, 'Бала');
});

test('missing spouse detection shows action when spouse is not resolved', () => {
  const person = mockRelative('p', 'Person');
  assert.equal(hasMissingFather(person), true);
  assert.equal(hasMissingMother(person), true);
  assert.equal(hasMissingSpouse(person, null), true);
  assert.equal(
    hasMissingSpouse(mockRelative('s', 'Spouse', { spouseId: 'p' }), null),
    true,
    'broken spouse link still offers add action',
  );
  assert.equal(
    hasMissingSpouse(person, mockRelative('w', 'Ayel')),
    false,
  );
});

test('resolveSpousePresetForTarget follows gender only', () => {
  assert.deepEqual(resolveSpousePresetForTarget(mockRelative('m', 'Er', { gender: 'male' })), {
    relationship: 'Әйелі',
    gender: 'female',
  });
  assert.deepEqual(resolveSpousePresetForTarget(mockRelative('w', 'Ayel', { gender: 'female' })), {
    relationship: 'Күйеуі',
    gender: 'male',
  });
});

test('shouldReturnToShezhireAfterSave for missing link contexts', () => {
  assert.equal(shouldReturnToShezhireAfterSave(undefined, 'add_child'), true);
  assert.equal(shouldReturnToShezhireAfterSave('shezhire', null), true);
  assert.equal(shouldReturnToShezhireAfterSave(undefined, 'kayin'), false);
});
