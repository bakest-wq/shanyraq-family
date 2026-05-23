import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  buildParentSideSiblingAddAction,
  getParentSideSiblingHelperText,
  isParentSideSiblingRelationship,
} from '@/utils/parent-side-sibling-add';

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

test('buildParentSideSiblingAddAction prefills father-side grandparents', () => {
  const grandfather = mockRelative('gf', 'Нұрлан', { gender: 'male' });
  const grandmother = mockRelative('gm', 'Гүлнар', { gender: 'female' });
  const father = mockRelative('f', 'Ғалымжан', {
    gender: 'male',
    fatherId: 'gf',
    motherId: 'gm',
  });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const relatives = [grandfather, grandmother, father, root];

  const action = buildParentSideSiblingAddAction('father', root, relatives);

  assert.equal(action.canAdd, true);
  assert.equal(action.relationship, 'father_side_sibling');
  assert.equal(action.fatherId, 'gf');
  assert.equal(action.motherId, 'gm');
  assert.deepEqual(action.addParams, {
    relationship: 'father_side_sibling',
    rootId: 'root',
    fatherId: 'gf',
    motherId: 'gm',
  });
});

test('buildParentSideSiblingAddAction prefills mother-side grandparents', () => {
  const grandfather = mockRelative('mgf', 'Ерлан', { gender: 'male' });
  const grandmother = mockRelative('mgm', 'Айгүл', { gender: 'female' });
  const mother = mockRelative('m', 'Сауле', {
    gender: 'female',
    fatherId: 'mgf',
    motherId: 'mgm',
  });
  const root = mockRelative('root', 'Айжан', { gender: 'female', motherId: 'm' });
  const relatives = [grandfather, grandmother, mother, root];

  const action = buildParentSideSiblingAddAction('mother', root, relatives);

  assert.equal(action.canAdd, true);
  assert.equal(action.relationship, 'mother_side_sibling');
  assert.equal(action.fatherId, 'mgf');
  assert.equal(action.motherId, 'mgm');
});

test('buildParentSideSiblingAddAction blocks when grandparents are missing', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const relatives = [father, root];

  const action = buildParentSideSiblingAddAction('father', root, relatives);

  assert.equal(action.canAdd, false);
  assert.equal(action.blockedReason, 'grandparents_missing');
  assert.match(action.blockedMessage ?? '', /ата-анасын қосыңыз/);
});

test('buildParentSideSiblingAddAction blocks when only one grandparent link exists', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male', fatherId: 'gf' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const relatives = [father, root];

  const action = buildParentSideSiblingAddAction('father', root, relatives);

  assert.equal(action.canAdd, false);
  assert.equal(action.blockedReason, 'grandparents_missing');
});

test('buildParentSideSiblingAddAction blocks when parent is missing', () => {
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const action = buildParentSideSiblingAddAction('father', root, [root]);

  assert.equal(action.canAdd, false);
  assert.equal(action.blockedReason, 'parent_missing');
});

test('parent-side sibling helper text matches relationship type', () => {
  assert.equal(
    getParentSideSiblingHelperText('father_side_sibling'),
    'Бұл адам әкеңізбен бір ата-анадан туған болуы керек.',
  );
  assert.equal(
    getParentSideSiblingHelperText('mother_side_sibling'),
    'Бұл адам анаңызбен бір ата-анадан туған болуы керек.',
  );
  assert.equal(getParentSideSiblingHelperText('Бауыр'), null);
});

test('isParentSideSiblingRelationship detects preset values', () => {
  assert.equal(isParentSideSiblingRelationship('father_side_sibling'), true);
  assert.equal(isParentSideSiblingRelationship('mother_side_sibling'), true);
  assert.equal(isParentSideSiblingRelationship('Бауыр'), false);
});
