import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import { buildFocusedFamilyTree, getFocusedTreeRelativeIds } from '@/utils/focused-family-tree';
import {
  getAncestorChain,
  getAncestors,
  getDescendants,
  getExtendedDescendants,
  getLineageConnectedIds,
  getSiblings,
  getSpouse,
} from '@/utils/shezhire-lineage';

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

function buildFixture() {
  const greatGrandfather = mockRelative('ggf', 'Нұрлан', { gender: 'male' });
  const greatGrandmother = mockRelative('ggm', 'Гүлнар', { gender: 'female' });
  const grandfather = mockRelative('gf', 'Болат', {
    gender: 'male',
    fatherId: 'ggf',
    motherId: 'ggm',
  });
  const grandmother = mockRelative('gm', 'Фирдаус', { gender: 'female' });
  const father = mockRelative('f', 'Ғалымжан', {
    gender: 'male',
    fatherId: 'gf',
    motherId: 'gm',
  });
  const mother = mockRelative('m', 'Сауле', { gender: 'female' });
  const uncle = mockRelative('u', 'Ерлан', {
    gender: 'male',
    fatherId: 'gf',
    motherId: 'gm',
  });
  const cousin = mockRelative('cousin', 'Айбек', {
    gender: 'male',
    fatherId: 'u',
  });
  const child = mockRelative('c', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
  });
  const sibling = mockRelative('s', 'Айжан', {
    gender: 'female',
    fatherId: 'f',
    motherId: 'm',
  });
  const spouse = mockRelative('sp', 'Динара', {
    gender: 'female',
    spouseId: 'c',
  });
  const grandchild = mockRelative('gc', 'Али', {
    gender: 'male',
    fatherId: 'c',
    motherId: 'sp',
  });

  child.spouseId = 'sp';
  spouse.spouseId = 'c';

  const relatives = [
    greatGrandfather,
    greatGrandmother,
    grandfather,
    grandmother,
    father,
    mother,
    uncle,
    cousin,
    child,
    sibling,
    spouse,
    grandchild,
  ];

  return {
    relatives,
    child,
    sibling,
    grandfather,
    uncle,
    spouse,
    grandchild,
  };
}

test('selecting child as root shows grandparents in ancestor chain', () => {
  const { relatives, child } = buildFixture();
  const tree = buildFocusedFamilyTree(child.id, relatives);

  assert.ok(tree);
  assert.deepEqual(
    tree!.ancestorChain.map((person) => person.id).sort(),
    ['gf', 'ggf', 'ggm', 'gm'],
  );
});

test('selecting sibling as root keeps shared parents', () => {
  const { relatives, sibling } = buildFixture();
  const tree = buildFocusedFamilyTree(sibling.id, relatives);

  assert.ok(tree);
  assert.equal(tree!.parents.fatherId, 'f');
  assert.equal(tree!.parents.motherId, 'm');
  assert.equal(tree!.siblings.some((person) => person.id === 'c'), true);
});

test('selecting grandparent as root shows descendants below', () => {
  const { relatives, grandfather } = buildFixture();
  const tree = buildFocusedFamilyTree(grandfather.id, relatives);

  assert.ok(tree);
  assert.ok(tree!.children.some((person) => person.id === 'f'));
  assert.ok(tree!.children.some((person) => person.id === 'u'));
  assert.ok(tree!.descendants.some((entry) => entry.person.id === 'c'));
  assert.ok(tree!.descendants.some((entry) => entry.person.id === 'gc'));
});

test('selecting uncle as root shows parents and nieces or nephews', () => {
  const { relatives, uncle } = buildFixture();
  const tree = buildFocusedFamilyTree(uncle.id, relatives);

  assert.ok(tree);
  assert.equal(tree!.parents.fatherId, 'gf');
  assert.ok(tree!.children.some((person) => person.id === 'cousin'));
  assert.ok(getSiblings(uncle, relatives).some((person) => person.id === 'f'));
});

test('selecting spouse as root keeps spouse-side child links', () => {
  const { relatives, spouse } = buildFixture();
  const tree = buildFocusedFamilyTree(spouse.id, relatives);

  assert.ok(tree);
  assert.equal(tree!.spouse?.id, 'c');
  assert.ok(tree!.children.some((person) => person.id === 'gc'));
});

test('connected relatives stay out of orphan set when focus changes', () => {
  const { relatives, child, grandfather } = buildFixture();
  const connectedFromChild = getLineageConnectedIds(child, relatives);
  const connectedFromGrandparent = getLineageConnectedIds(grandfather, relatives);

  assert.ok(connectedFromChild.has('gf'));
  assert.ok(connectedFromChild.has('u'));
  assert.ok(connectedFromGrandparent.has('c'));
  assert.ok(connectedFromGrandparent.has('gc'));
});

test('lineage traversal helpers respect depth and structural links only', () => {
  const { relatives, child } = buildFixture();

  assert.equal(getSpouse(child, relatives)?.id, 'sp');
  assert.equal(getAncestors(child, relatives).length, 6);
  assert.equal(getDescendants(child, relatives).length, 1);
  assert.equal(getExtendedDescendants(child, relatives).length, 0);
  assert.equal(getAncestorChain(child, relatives).length, 4);
});

test('getFocusedTreeRelativeIds includes full lineage graph around root', () => {
  const { relatives, child } = buildFixture();
  const tree = buildFocusedFamilyTree(child.id, relatives);

  assert.ok(tree);

  const ids = getFocusedTreeRelativeIds(tree!, relatives);

  assert.ok(ids.has('gf'));
  assert.ok(ids.has('u'));
  assert.ok(ids.has('gc'));
});
