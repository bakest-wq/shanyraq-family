import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  debugRootGraph,
  getGraphDisplaySections,
} from '@/utils/shezhire/debugGraph';

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

function buildFixture(): {
  relatives: Relative[];
  child: Relative;
  sibling: Relative;
  spouse: Relative;
  parent: Relative;
  grandparent: Relative;
  stranger: Relative;
} {
  const ggf = mockRelative('ggf', 'Great Grandfather', { gender: 'male' });
  const ggm = mockRelative('ggm', 'Great Grandmother', { gender: 'female' });
  const gf = mockRelative('gf', 'Grandfather', {
    gender: 'male',
    fatherId: 'ggf',
    motherId: 'ggm',
    spouseId: 'gm',
  });
  const gm = mockRelative('gm', 'Grandmother', { gender: 'female', spouseId: 'gf' });
  const f = mockRelative('f', 'Father', {
    gender: 'male',
    fatherId: 'gf',
    motherId: 'gm',
    spouseId: 'm',
  });
  const m = mockRelative('m', 'Mother', { gender: 'female', spouseId: 'f' });
  const u = mockRelative('u', 'Uncle', { gender: 'male', fatherId: 'gf', motherId: 'gm' });
  const cousin = mockRelative('cousin', 'Cousin', { gender: 'male', fatherId: 'u' });
  const child = mockRelative('c', 'Child', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
    spouseId: 'sp',
  });
  const sibling = mockRelative('s', 'Sibling', { gender: 'female', fatherId: 'f', motherId: 'm' });
  const spouse = mockRelative('sp', 'Spouse', { gender: 'female', spouseId: 'c' });
  const gc = mockRelative('gc', 'Grandchild', { gender: 'female', fatherId: 'c', motherId: 'sp' });
  const stranger = mockRelative('stranger', 'Stranger', { gender: 'male' });

  const relatives = [ggf, ggm, gf, gm, f, m, u, cousin, child, sibling, spouse, gc, stranger];

  return {
    relatives,
    child,
    sibling,
    spouse,
    parent: f,
    grandparent: gf,
    stranger,
  };
}

test('debugRootGraph exposes ancestor chain for child root', () => {
  const { relatives, child } = buildFixture();
  const graph = debugRootGraph(child, relatives, { log: false });
  const display = getGraphDisplaySections(graph);

  assert.deepEqual(
    display.ancestorChain.map((person) => person.id).sort(),
    ['gf', 'ggf', 'ggm', 'gm'],
  );
});

test('debugRootGraph keeps connected relatives out of unplaced', () => {
  const { relatives, child, stranger } = buildFixture();
  const graph = debugRootGraph(child, relatives, { log: false });

  assert.equal(graph.unplacedCandidates.length, 1);
  assert.equal(graph.unplacedCandidates[0]?.id, stranger.id);
  assert.equal(graph.connectedIds.has('gf'), true);
  assert.equal(graph.connectedIds.has('s'), true);
  assert.equal(graph.connectedIds.has('sp'), true);
});

test('getGraphDisplaySections splits children and extended descendants', () => {
  const { relatives, child } = buildFixture();
  const graph = debugRootGraph(child, relatives, { log: false });
  const display = getGraphDisplaySections(graph);

  assert.deepEqual(
    display.visibleChildren.map((person) => person.id),
    ['gc'],
  );
  assert.equal(display.extendedDescendants.length, 0);
});

function assertMainRing(
  graph: ReturnType<typeof debugRootGraph>,
  expected: {
    rootId: string;
    parentIds: string[];
    spouseId: string | null;
    childIds: string[];
    siblingIds: string[];
  },
) {
  assert.equal(graph.root.id, expected.rootId);
  assert.deepEqual(
    graph.parents.map((person) => person.id).sort(),
    [...expected.parentIds].sort(),
  );
  assert.equal(graph.spouse?.id ?? null, expected.spouseId);
  assert.deepEqual(
    graph.children.map((person) => person.id).sort(),
    [...expected.childIds].sort(),
  );
  assert.deepEqual(
    graph.siblings.map((person) => person.id).sort(),
    [...expected.siblingIds].sort(),
  );
}

test('child root renders stable main ring', () => {
  const { relatives, child } = buildFixture();
  const graph = debugRootGraph(child, relatives, { log: false });

  assertMainRing(graph, {
    rootId: 'c',
    parentIds: ['f', 'm'],
    spouseId: 'sp',
    childIds: ['gc'],
    siblingIds: ['s'],
  });
});

test('parent root renders stable main ring', () => {
  const { relatives, parent } = buildFixture();
  const graph = debugRootGraph(parent, relatives, { log: false });

  assertMainRing(graph, {
    rootId: 'f',
    parentIds: ['gf', 'gm'],
    spouseId: 'm',
    childIds: ['c', 's'],
    siblingIds: ['u'],
  });
});

test('grandparent root renders stable main ring', () => {
  const { relatives, grandparent } = buildFixture();
  const graph = debugRootGraph(grandparent, relatives, { log: false });

  assertMainRing(graph, {
    rootId: 'gf',
    parentIds: ['ggf', 'ggm'],
    spouseId: 'gm',
    childIds: ['f', 'u'],
    siblingIds: [],
  });
});

test('sibling root renders stable main ring', () => {
  const { relatives, sibling } = buildFixture();
  const graph = debugRootGraph(sibling, relatives, { log: false });

  assertMainRing(graph, {
    rootId: 's',
    parentIds: ['f', 'm'],
    spouseId: null,
    childIds: [],
    siblingIds: ['c'],
  });
});

test('spouse root renders stable main ring', () => {
  const { relatives, spouse } = buildFixture();
  const graph = debugRootGraph(spouse, relatives, { log: false });

  assertMainRing(graph, {
    rootId: 'sp',
    parentIds: [],
    spouseId: 'c',
    childIds: ['gc'],
    siblingIds: [],
  });
});

test('UI sections expose parent slots for every root role', () => {
  const { relatives, child, parent, grandparent, sibling, spouse } = buildFixture();

  for (const root of [child, parent, grandparent, sibling, spouse]) {
    const graph = debugRootGraph(root, relatives, { log: false });
    const display = getGraphDisplaySections(graph);

    assert.deepEqual(display.parentSlots, graph.parentSlots);
    assert.deepEqual(display.visibleChildren.map((person) => person.id), graph.children.map((person) => person.id));
  }
});

function assertRingMembersConnected(
  graph: ReturnType<typeof debugRootGraph>,
  relatives: Relative[],
) {
  const ringIds = [
    ...graph.parents.map((person) => person.id),
    ...graph.siblings.map((person) => person.id),
    ...graph.children.map((person) => person.id),
    ...(graph.spouse ? [graph.spouse.id] : []),
    ...graph.ancestors.map((entry) => entry.person.id),
  ];

  for (const id of ringIds) {
    const person = relatives.find((relative) => relative.id === id);
    assert.ok(person, `expected ring member ${id}`);
    assert.equal(
      graph.connectedIds.has(id),
      true,
      `${id} must stay connected for root ${graph.root.id}`,
    );
    assert.equal(
      graph.unplacedCandidates.some((candidate) => candidate.id === id),
      false,
      `${id} must not be unplaced for root ${graph.root.id}`,
    );
  }
}

test('main ring and ancestors stay connected for every root role', () => {
  const { relatives, child, parent, grandparent, sibling, spouse } = buildFixture();

  for (const root of [child, parent, grandparent, sibling, spouse]) {
    const graph = debugRootGraph(root, relatives, { log: false });
    assertRingMembersConnected(graph, relatives);
  }
});

test('deceased parents and children remain in main ring', () => {
  const { relatives, child } = buildFixture();
  const deceasedFather = { ...relatives.find((person) => person.id === 'f')!, isDeceased: true };
  const patched = relatives.map((person) => (person.id === 'f' ? deceasedFather : person));

  const graph = debugRootGraph(child, patched, { log: false });

  assert.equal(graph.parents.some((person) => person.id === 'f'), true);
  assertRingMembersConnected(graph, patched);
});

test('grandparent root keeps ancestor chain in graph data', () => {
  const { relatives, grandparent } = buildFixture();
  const graph = debugRootGraph(grandparent, relatives, { log: false });

  assert.deepEqual(
    graph.ancestors.map((entry) => entry.person.id).sort(),
    ['ggf', 'ggm'],
  );
  assert.deepEqual(graph.parentSlots.father?.id, 'ggf');
  assert.deepEqual(graph.parentSlots.mother?.id, 'ggm');
});
