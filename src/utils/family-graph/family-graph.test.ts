import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  applyGraphRepairPatches,
  buildFamilyGraph,
  buildLinkSyncPatchesFromGraph,
  buildSpouseReciprocalPatches,
  findDuplicateCandidates,
  getAncestorIds,
  getDescendantIds,
  normalizeFamilyLinkSnapshot,
  planSafeDelete,
  rebuildFamilyGraph,
  validateGraphIntegrity,
  wouldPatchCreateCycle,
} from '@/utils/family-graph';

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
    birthday: options.birthday ?? '',
    phone: options.phone ?? '',
    avatarColor: '#2C4A3E',
    isDeceased: false,
    gender: options.gender,
    fatherId: options.fatherId,
    motherId: options.motherId,
    spouseId: options.spouseId,
    birthdayYear: options.birthdayYear,
    birthdayMonth: options.birthdayMonth,
    birthdayDay: options.birthdayDay,
  };
}

test('buildFamilyGraph normalizes structural links and derived children map', () => {
  const father = mockRelative('f', 'Болат', { gender: 'male' });
  const child = mockRelative('c', 'Серік', { fatherId: 'f' });
  const rebuilt = rebuildFamilyGraph([child, father]);

  assert.equal(rebuilt.graph.getChildren(father).length, 1);
  assert.equal(rebuilt.graph.getParents(child)[0]?.id, 'f');
  assert.equal(rebuilt.normalizedRelatives.length, 2);
});

test('getAncestorIds and getDescendantIds stay consistent', () => {
  const gp = mockRelative('gp', 'Ата');
  const father = mockRelative('f', 'Болат', { fatherId: 'gp', gender: 'male' });
  const child = mockRelative('c', 'Серік', { fatherId: 'f' });
  const relatives = [gp, father, child];

  assert.ok(getDescendantIds('gp', relatives).has('c'));
  assert.ok(getAncestorIds('c', relatives).has('gp'));
});

test('validateGraphIntegrity catches self links and same parent pair', () => {
  const broken = mockRelative('x', 'Қате', {
    fatherId: 'x',
    motherId: 'x',
  });
  const report = validateGraphIntegrity(buildFamilyGraph([broken]));

  assert.equal(report.isValid, false);
  assert.ok(report.issues.some((issue) => issue.code === 'self_link'));
  assert.ok(report.issues.some((issue) => issue.code === 'same_parent_pair'));
});

test('wouldPatchCreateCycle prevents child-as-parent links', () => {
  const father = mockRelative('f', 'Болат');
  const child = mockRelative('c', 'Серік', { fatherId: 'f' });
  const graph = buildFamilyGraph([father, child]);

  assert.equal(
    wouldPatchCreateCycle(graph, 'f', normalizeFamilyLinkSnapshot({ fatherId: 'c' })),
    true,
  );
});

test('validateGraphIntegrity detects ancestor cycles', () => {
  const left = mockRelative('a', 'Айгуль', { fatherId: 'b' });
  const right = mockRelative('b', 'Болат', { fatherId: 'a' });
  const report = validateGraphIntegrity(buildFamilyGraph([left, right]));

  assert.ok(report.issues.some((issue) => issue.code === 'ancestor_cycle'));
});

test('planSafeDelete clears reciprocal spouse and reports child impact', () => {
  const spouse = mockRelative('s', 'Гүлнар', { spouseId: 'p', gender: 'female' });
  const person = mockRelative('p', 'Болат', { spouseId: 's', gender: 'male' });
  const child = mockRelative('c', 'Серік', { fatherId: 'p' });
  const graph = buildFamilyGraph([person, spouse, child]);
  const plan = planSafeDelete(graph, 'p');

  assert.equal(plan.canDelete, true);
  assert.equal(plan.preDeletePatches.length, 1);
  assert.equal(plan.preDeletePatches[0]?.personId, 's');
  assert.equal(plan.impact.childrenLosingParentLink.length, 1);
  assert.equal(plan.impact.descendantCount, 1);
});

test('buildSpouseReciprocalPatches repairs one-sided spouse links', () => {
  const husband = mockRelative('h', 'Болат', { spouseId: 'w', gender: 'male' });
  const wife = mockRelative('w', 'Гүлнар', { gender: 'female' });
  const graph = buildFamilyGraph([husband, wife]);
  const patches = buildSpouseReciprocalPatches(graph);

  assert.equal(patches.length, 1);
  assert.equal(patches[0]?.personId, 'w');

  const repaired = applyGraphRepairPatches(graph, patches);
  assert.equal(repaired.getEffectiveSpouse(wife)?.id, 'h');
});

test('buildLinkSyncPatchesFromGraph mirrors relationship-sync spouse reciprocity', () => {
  const husband = mockRelative('h', 'Болат', { gender: 'male' });
  const wife = mockRelative('w', 'Гүлнар', { gender: 'female' });
  const graph = buildFamilyGraph([husband, wife]);
  const patches = buildLinkSyncPatchesFromGraph(
    'h',
    normalizeFamilyLinkSnapshot({ spouseId: null }),
    normalizeFamilyLinkSnapshot({ spouseId: 'w' }),
    graph,
  );

  assert.deepEqual(patches, [{ personId: 'w', patch: { spouseId: 'h' } }]);
});

test('findDuplicateCandidates matches same name and birthday', () => {
  const left = mockRelative('a', 'Майя', {
    birthdayYear: 1990,
    birthdayMonth: 5,
    birthdayDay: 12,
  });
  const right = mockRelative('b', 'Майя', {
    birthdayYear: 1990,
    birthdayMonth: 5,
    birthdayDay: 12,
  });
  const unrelated = mockRelative('c', 'Болат', {
    birthdayYear: 1980,
  });

  const matches = findDuplicateCandidates(buildFamilyGraph([left, right, unrelated]));

  assert.equal(matches.length, 1);
  assert.equal(matches[0]?.leftId, 'a');
  assert.equal(matches[0]?.rightId, 'b');
  assert.ok(matches[0]?.signals.includes('name'));
});

test('validateGraphIntegrity flags broken link references', () => {
  const orphan = mockRelative('o', 'Жалғыз', { fatherId: 'missing' });
  const report = validateGraphIntegrity(buildFamilyGraph([orphan]));

  assert.ok(report.issues.some((issue) => issue.code === 'broken_link'));
});
