import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  getConnectedRelativeIds,
  getNeighbors,
  getUnplacedRelatives,
  isPersonConnected,
} from '@/utils/shezhire/connectedGraph';
import { debugRootGraph } from '@/utils/shezhire/debugGraph';

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

function linkSpouses(left: Relative, right: Relative): void {
  left.spouseId = right.id;
  right.spouseId = left.id;
}

test('Anna root connects Baurzhan spouse-side parents and siblings', () => {
  const baurzhanFather = mockRelative('bf', 'Baurzhan Father', { gender: 'male' });
  const baurzhanMother = mockRelative('bm', 'Baurzhan Mother', { gender: 'female' });
  const baurzhanSibling = mockRelative('bs', 'Baurzhan Brother', {
    gender: 'male',
    fatherId: 'bf',
    motherId: 'bm',
  });
  const baurzhan = mockRelative('b', 'Baurzhan', {
    gender: 'male',
    fatherId: 'bf',
    motherId: 'bm',
  });
  const anna = mockRelative('anna', 'Anna', { gender: 'female', spouseId: 'b' });
  linkSpouses(anna, baurzhan);

  const relatives = [anna, baurzhan, baurzhanFather, baurzhanMother, baurzhanSibling];
  const connectedIds = getConnectedRelativeIds(anna, relatives);

  assert.equal(isPersonConnected(baurzhan, connectedIds), true);
  assert.equal(isPersonConnected(baurzhanFather, connectedIds), true);
  assert.equal(isPersonConnected(baurzhanMother, connectedIds), true);
  assert.equal(isPersonConnected(baurzhanSibling, connectedIds), true);
  assert.equal(getUnplacedRelatives(anna, relatives, connectedIds).length, 0);
});

test("spouse's father is connected", () => {
  const spouseFather = mockRelative('sf', 'Kayin ata', { gender: 'male' });
  const spouse = mockRelative('sp', 'Anna', { gender: 'female', fatherId: 'sf' });
  const root = mockRelative('root', 'Bauyrzhan', { gender: 'male' });
  linkSpouses(root, spouse);

  const connectedIds = getConnectedRelativeIds(root, [root, spouse, spouseFather]);
  assert.equal(isPersonConnected(spouseFather, connectedIds), true);
});

test("spouse's mother is connected", () => {
  const spouseMother = mockRelative('sm', 'Kayin ene', { gender: 'female' });
  const spouse = mockRelative('sp', 'Anna', { gender: 'female', motherId: 'sm' });
  const root = mockRelative('root', 'Bauyrzhan', { gender: 'male' });
  linkSpouses(root, spouse);

  const connectedIds = getConnectedRelativeIds(root, [root, spouse, spouseMother]);
  assert.equal(isPersonConnected(spouseMother, connectedIds), true);
});

test("spouse's sibling is connected", () => {
  const spouseMother = mockRelative('sm', 'Kayin ene', { gender: 'female' });
  const spouseSibling = mockRelative('ss', 'Kayin sibling', { gender: 'male', motherId: 'sm' });
  const spouse = mockRelative('sp', 'Anna', { gender: 'female', motherId: 'sm' });
  const root = mockRelative('root', 'Bauyrzhan', { gender: 'male' });
  linkSpouses(root, spouse);

  const relatives = [root, spouse, spouseMother, spouseSibling];
  const connectedIds = getConnectedRelativeIds(root, relatives);
  assert.equal(isPersonConnected(spouseSibling, connectedIds), true);
});

test("root's ancestor is connected", () => {
  const grandfather = mockRelative('gf', 'Ata', { gender: 'male' });
  const father = mockRelative('f', 'Father', { gender: 'male', fatherId: 'gf' });
  const root = mockRelative('root', 'Child', { gender: 'male', fatherId: 'f' });

  const connectedIds = getConnectedRelativeIds(root, [root, father, grandfather]);
  assert.equal(isPersonConnected(grandfather, connectedIds), true);
});

test("root's child is connected", () => {
  const root = mockRelative('root', 'Me', { gender: 'male' });
  const child = mockRelative('child', 'Son', { gender: 'male', fatherId: 'root' });

  const connectedIds = getConnectedRelativeIds(root, [root, child]);
  assert.equal(isPersonConnected(child, connectedIds), true);
});

test('disconnected random person is unplaced', () => {
  const root = mockRelative('root', 'Anna', { gender: 'female' });
  const stranger = mockRelative('stranger', 'Stranger');

  const unplaced = getUnplacedRelatives(root, [root, stranger]);
  assert.deepEqual(
    unplaced.map((person) => person.id),
    ['stranger'],
  );
});

test('getNeighbors includes reverse spouse link', () => {
  const left = mockRelative('a', 'Anna', { gender: 'female' });
  const right = mockRelative('b', 'Baurzhan', { gender: 'male', spouseId: 'a' });

  const neighbors = getNeighbors(left, [left, right]);
  assert.ok(neighbors.some((person) => person.id === 'b'));
});

test('getNeighbors includes structural siblings directly', () => {
  const father = mockRelative('f', 'Father', { gender: 'male' });
  const mother = mockRelative('m', 'Mother', { gender: 'female' });
  const root = mockRelative('c', 'Child', { gender: 'male', fatherId: 'f', motherId: 'm' });
  const sibling = mockRelative('s', 'Sibling', { gender: 'female', fatherId: 'f', motherId: 'm' });

  const neighbors = getNeighbors(root, [root, sibling, father, mother]);
  assert.ok(neighbors.some((person) => person.id === 's'));
});

test('getNeighbors walks spouse parents when spouse only has reverse link', () => {
  const father = mockRelative('bf', 'Father', { gender: 'male' });
  const baurzhan = mockRelative('b', 'Baurzhan', {
    gender: 'male',
    fatherId: 'bf',
    spouseId: 'anna',
  });
  const anna = mockRelative('anna', 'Anna', { gender: 'female' });

  const neighbors = getNeighbors(anna, [anna, baurzhan, father]);
  assert.ok(neighbors.some((person) => person.id === 'b'));

  const connectedIds = getConnectedRelativeIds(anna, [anna, baurzhan, father]);
  assert.equal(isPersonConnected(father, connectedIds), true);
});

test('siblings stay connected through direct sibling edges', () => {
  const mother = mockRelative('m', 'Mother', { gender: 'female' });
  const root = mockRelative('c', 'Child', { gender: 'male', motherId: 'm' });
  const sibling = mockRelative('s', 'Sibling', { gender: 'female', motherId: 'm' });

  const connectedIds = getConnectedRelativeIds(root, [root, sibling, mother]);
  assert.equal(isPersonConnected(sibling, connectedIds), true);
});

test('debugRootGraph uses canonical connected graph for unplaced', () => {
  const baurzhanFather = mockRelative('bf', 'Baurzhan Father', { gender: 'male' });
  const baurzhan = mockRelative('b', 'Baurzhan', { gender: 'male', fatherId: 'bf' });
  const anna = mockRelative('anna', 'Anna', { gender: 'female' });
  const stranger = mockRelative('stranger', 'Stranger');
  linkSpouses(anna, baurzhan);

  const graph = debugRootGraph(anna, [anna, baurzhan, baurzhanFather, stranger], { log: false });

  assert.equal(isPersonConnected(baurzhanFather, graph.connectedIds), true);
  assert.equal(graph.unplacedCandidates.length, 1);
  assert.equal(graph.unplacedCandidates[0]?.id, 'stranger');
});

test('visited set prevents infinite loops in cyclic spouse links', () => {
  const left = mockRelative('a', 'A', { gender: 'male' });
  const right = mockRelative('b', 'B', { gender: 'female' });
  linkSpouses(left, right);

  assert.doesNotThrow(() => {
    const connectedIds = getConnectedRelativeIds(left, [left, right]);
    assert.equal(connectedIds.size, 2);
  });
});
