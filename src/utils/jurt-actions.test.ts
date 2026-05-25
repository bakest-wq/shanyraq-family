import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  getAddRelativeContextHelper,
  jurtNavigateParamsToRouterRecord,
  resolveFatherSideSiblingAdd,
  resolveJurtSideAddAction,
  resolveMotherSideSiblingAdd,
} from '@/utils/jurt-actions';

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

test('oz jurt action blocks when father is missing', () => {
  const root = mockRelative('root', 'Бауыржан', { relationship: 'Мен', gender: 'male' });
  const action = resolveJurtSideAddAction('oz', root, [root]);

  assert.equal(action.status, 'blocked');
  if (action.status === 'blocked') {
    assert.equal(action.message, 'Алдымен әкеңізді қосыңыз.');
  }
});

test('oz jurt action navigates with father-side sibling context', () => {
  const grandfather = mockRelative('gf', 'Нұрлан', { gender: 'male' });
  const grandmother = mockRelative('gm', 'Гүлнар', { gender: 'female' });
  const father = mockRelative('f', 'Ғалымжан', {
    gender: 'male',
    fatherId: 'gf',
    motherId: 'gm',
  });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const relatives = [grandfather, grandmother, father, root];

  const action = resolveJurtSideAddAction('oz', root, relatives);

  assert.equal(action.status, 'ready');
  if (action.status === 'ready') {
    assert.equal(action.navigate.context, 'father_side_sibling');
    assert.equal(action.navigate.fatherId, 'gf');
    assert.equal(action.navigate.motherId, 'gm');
  }
});

test('resolveFatherSideSiblingAdd uses resolved father parent from tree context', () => {
  const grandfather = mockRelative('gf', 'Нұрлан', { gender: 'male' });
  const grandmother = mockRelative('gm', 'Гүлнар', { gender: 'female' });
  const father = mockRelative('f', 'Ғалымжан', {
    gender: 'male',
    fatherId: 'gf',
    motherId: 'gm',
  });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male' });
  const relatives = [grandfather, grandmother, father, root];

  const action = resolveFatherSideSiblingAdd(root, relatives, father);

  assert.equal(action.status, 'ready');
  if (action.status === 'ready') {
    assert.equal(action.navigate.context, 'father_side_sibling');
    assert.equal(action.navigate.fatherId, 'gf');
    assert.equal(action.navigate.motherId, 'gm');
  }
});

test('resolveFatherSideSiblingAdd ignores stale tree parent missing grandparent links', () => {
  const grandfather = mockRelative('gf', 'Нұрлан', { gender: 'male' });
  const grandmother = mockRelative('gm', 'Гүлнар', { gender: 'female' });
  const fatherFresh = mockRelative('f', 'Ғалымжан', {
    gender: 'male',
    fatherId: 'gf',
    motherId: 'gm',
  });
  const fatherStale = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const relatives = [grandfather, grandmother, fatherFresh, root];

  const action = resolveFatherSideSiblingAdd(root, relatives, fatherStale);

  assert.equal(action.status, 'ready');
  if (action.status === 'ready') {
    assert.equal(action.navigate.fatherId, 'gf');
    assert.equal(action.navigate.motherId, 'gm');
  }
});

test('resolveMotherSideSiblingAdd ignores stale tree parent missing grandparent links', () => {
  const grandfather = mockRelative('mgf', 'Ерлан', { gender: 'male' });
  const grandmother = mockRelative('mgm', 'Зейнеп', { gender: 'female' });
  const motherFresh = mockRelative('m', 'Сауле', {
    gender: 'female',
    fatherId: 'mgf',
    motherId: 'mgm',
  });
  const motherStale = mockRelative('m', 'Сауле', { gender: 'female' });
  const root = mockRelative('root', 'Айжан', { gender: 'female', motherId: 'm' });
  const relatives = [grandfather, grandmother, motherFresh, root];

  const action = resolveMotherSideSiblingAdd(root, relatives, motherStale);

  assert.equal(action.status, 'ready');
  if (action.status === 'ready') {
    assert.equal(action.navigate.fatherId, 'mgf');
    assert.equal(action.navigate.motherId, 'mgm');
  }
});

test('resolveMotherSideSiblingAdd blocks with mother-side grandparents message', () => {
  const mother = mockRelative('m', 'Сауле', { gender: 'female' });
  const root = mockRelative('root', 'Айжан', { gender: 'female', motherId: 'm' });
  const action = resolveMotherSideSiblingAdd(root, [mother, root]);

  assert.equal(action.status, 'blocked');
  if (action.status === 'blocked') {
    assert.equal(action.message, 'Алдымен анаңыздың ата-анасын қосыңыз.');
  }
});

test('kayin jurt action blocks when spouse is missing', () => {
  const root = mockRelative('root', 'Бауыржан', { relationship: 'Мен', gender: 'male' });
  const action = resolveJurtSideAddAction('kayin', root, [root]);

  assert.equal(action.status, 'blocked');
  if (action.status === 'blocked') {
    assert.equal(action.message, 'Алдымен жұбайыңызды қосыңыз.');
  }
});

test('kayin jurt action navigates with spouse context', () => {
  const spouse = mockRelative('sp', 'Айгül', { gender: 'female', spouseId: 'root' });
  const root = mockRelative('root', 'Ерлан', {
    relationship: 'Мен',
    gender: 'male',
    spouseId: 'sp',
  });
  const action = resolveJurtSideAddAction('kayin', root, [root, spouse]);

  assert.equal(action.status, 'ready');
  if (action.status === 'ready') {
    assert.equal(action.navigate.context, 'kayin');
    assert.equal(action.navigate.spouseId, 'sp');
  }
});

test('jurtNavigateParamsToRouterRecord includes snake_case aliases', () => {
  const record = jurtNavigateParamsToRouterRecord({
    context: 'father_side_sibling',
    relationship: 'father_side_sibling',
    rootId: 'root',
    fatherId: 'gf',
    motherId: 'gm',
  });

  assert.equal(record.fatherId, 'gf');
  assert.equal(record.father_id, 'gf');
  assert.equal(record.motherId, 'gm');
  assert.equal(record.mother_id, 'gm');
});

test('getAddRelativeContextHelper returns jurt-specific copy', () => {
  assert.match(getAddRelativeContextHelper('father_side_sibling') ?? '', /әкеңізбен/);
  assert.match(getAddRelativeContextHelper('kayin') ?? '', /жұбайыңыз/);
});
