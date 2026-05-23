import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import { getKinshipLabel } from '@/utils/kinship/getKinshipLabel';
import {
  buildParentSideRelativesTree,
  getParentSideRelativeIds,
  hasParentSideRelatives,
} from '@/utils/parent-side-relatives';

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

test('buildParentSideRelativesTree finds father-side siblings and their children', () => {
  const grand = mockRelative('gp', 'Нұрлан', { gender: 'male' });
  const grandMother = mockRelative('gm', 'Гүлнар', { gender: 'female' });
  const father = mockRelative('f', 'Ғалымжан', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
    birthdayYear: 1970,
  });
  const uncle = mockRelative('u', 'Серік', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
    birthdayYear: 1965,
  });
  const cousin = mockRelative('c', 'Алмас', { gender: 'male', fatherId: 'u' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const relatives = [grand, grandMother, father, uncle, cousin, root];

  const tree = buildParentSideRelativesTree(root, relatives);
  assert.equal(tree.fatherSide.grandparentsReady, true);
  assert.equal(tree.fatherSide.entries.length, 1);
  assert.equal(tree.fatherSide.entries[0]?.person.id, 'u');
  assert.equal(tree.fatherSide.entries[0]?.children.length, 1);
  assert.equal(hasParentSideRelatives(tree), true);
});

test('buildParentSideRelativesTree finds mother-side siblings', () => {
  const nagAta = mockRelative('nga', 'Қасым', { gender: 'male' });
  const nagAje = mockRelative('ngj', 'Зейнеп', { gender: 'female' });
  const mother = mockRelative('m', 'Фирдаус', {
    gender: 'female',
    fatherId: 'nga',
    motherId: 'ngj',
  });
  const uncle = mockRelative('u', 'Болат', {
    gender: 'male',
    fatherId: 'nga',
    motherId: 'ngj',
  });
  const root = mockRelative('root', 'Майя', { gender: 'female', motherId: 'm' });
  const relatives = [nagAta, nagAje, mother, uncle, root];

  const tree = buildParentSideRelativesTree(root, relatives);
  assert.equal(tree.motherSide.entries.length, 1);
  assert.equal(tree.motherSide.entries[0]?.person.id, 'u');
});

test('excludes root person and root siblings from father-side branch', () => {
  const grand = mockRelative('gp', 'Нұрлан', { gender: 'male' });
  const grandMother = mockRelative('gm', 'Гүлнар', { gender: 'female' });
  const father = mockRelative('f', 'Ғалымжан', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
  });
  const uncle = mockRelative('u', 'Серік', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
  });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const sibling = mockRelative('sib', 'Майя', { gender: 'female', fatherId: 'f' });
  const relatives = [grand, grandMother, father, uncle, root, sibling];

  const tree = buildParentSideRelativesTree(root, relatives);
  const uncleIds = tree.fatherSide.entries.map((entry) => entry.person.id);

  assert.deepEqual(uncleIds, ['u']);
  assert.ok(!uncleIds.includes('root'));
  assert.ok(!uncleIds.includes('sib'));
});

test('excludeIds removes relatives already shown in the main focused tree', () => {
  const grand = mockRelative('gp', 'Нұрлан', { gender: 'male' });
  const grandMother = mockRelative('gm', 'Гүлнар', { gender: 'female' });
  const father = mockRelative('f', 'Ғалымжан', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
  });
  const uncle = mockRelative('u', 'Серік', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
  });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const relatives = [grand, grandMother, father, uncle, root];

  const tree = buildParentSideRelativesTree(root, relatives, new Set(['u']));
  assert.equal(tree.fatherSide.entries.length, 0);
});

test('getParentSideRelativeIds collects aunt/uncle and cousin ids', () => {
  const grand = mockRelative('gp', 'Нұрлан', { gender: 'male' });
  const grandMother = mockRelative('gm', 'Гүлнар', { gender: 'female' });
  const father = mockRelative('f', 'Ғалымжан', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
  });
  const uncle = mockRelative('u', 'Серік', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
  });
  const cousin = mockRelative('c', 'Алмас', { gender: 'male', fatherId: 'u' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const tree = buildParentSideRelativesTree(root, [grand, grandMother, father, uncle, cousin, root]);
  const ids = getParentSideRelativeIds(tree);

  assert.ok(ids.has('u'));
  assert.ok(ids.has('c'));
});

test('father-side cousin gets dynamic tuas label from root', () => {
  const grand = mockRelative('gp', 'Нұрлан', { gender: 'male' });
  const grandMother = mockRelative('gm', 'Гүлнар', { gender: 'female' });
  const father = mockRelative('f', 'Ғалымжан', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
    birthdayYear: 1970,
  });
  const uncle = mockRelative('u', 'Серік', {
    gender: 'male',
    fatherId: 'gp',
    motherId: 'gm',
    birthdayYear: 1965,
  });
  const cousin = mockRelative('c', 'Алмас', { gender: 'male', fatherId: 'u' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const relatives = [grand, grandMother, father, uncle, cousin, root];

  const result = getKinshipLabel(root, cousin, relatives);
  assert.equal(result.type, 'tuas');
});

test('does not infer half siblings when only one grandparent link exists', () => {
  const grand = mockRelative('gp', 'Нұрлан', { gender: 'male' });
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male', fatherId: 'gp' });
  const uncle = mockRelative('u', 'Серік', { gender: 'male', fatherId: 'gp' });
  const root = mockRelative('root', 'Бауыржан', { gender: 'male', fatherId: 'f' });
  const relatives = [grand, father, uncle, root];

  const tree = buildParentSideRelativesTree(root, relatives);

  assert.equal(tree.fatherSide.grandparentsReady, false);
  assert.equal(tree.fatherSide.entries.length, 0);
  assert.match(tree.fatherSide.guidanceMessage ?? '', /ата-анасын қосыңыз/);
});
