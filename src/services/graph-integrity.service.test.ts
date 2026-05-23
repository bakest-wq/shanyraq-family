import assert from 'node:assert/strict';
import test from 'node:test';

import type { CreateRelativeInput, Relative } from '@/types/relative';
import { GRAPH_INTEGRITY_COPY } from '@/constants/graph-integrity-content';
import {
  assessSafeDelete,
  buildShezhireRepairPlan,
  collectRepairPatches,
  findBrokenParentLinks,
  findCircularParentChains,
  validateRelativeBeforeSave,
} from '@/services/graph-integrity.service';
import { buildSpouseReciprocalPatches, buildFamilyGraph } from '@/utils/family-graph';

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

function baseInput(overrides: Partial<CreateRelativeInput> = {}): CreateRelativeInput {
  return {
    fullName: 'Test',
    firstName: 'Test',
    relationship: 'Бала',
    birthday: '',
    ...overrides,
  };
}

test('brother must not become child via save validation', () => {
  const father = mockRelative('f', 'Father', { gender: 'male' });
  const root = mockRelative('root', 'Root', { gender: 'male', fatherId: 'f' });
  const brother = mockRelative('bro', 'Brother', { gender: 'male', fatherId: 'f' });
  const relatives = [father, root, brother];

  const result = validateRelativeBeforeSave(
    baseInput({ fatherId: 'bro' }),
    relatives,
    { relativeId: 'root', relatives },
  );

  assert.equal(result.valid, false);
  assert.equal(result.errors.fatherId, GRAPH_INTEGRITY_COPY.validation.siblingAsParent);
});

test('spouse sync repair patches work both directions', () => {
  const left = mockRelative('a', 'Ayna', { gender: 'female', spouseId: 'b' });
  const right = mockRelative('b', 'Bolat', { gender: 'male' });
  const graph = buildFamilyGraph([left, right]);
  const patches = buildSpouseReciprocalPatches(graph);

  assert.equal(patches.length, 1);
  assert.equal(patches[0]?.personId, 'b');
  assert.equal(patches[0]?.patch.spouseId, 'a');

  const plan = buildShezhireRepairPlan([left, right]);
  const merged = collectRepairPatches(plan, ['sync_spouses']);
  assert.equal(merged.length, 1);
});

test('broken UUID parent link is detected', () => {
  const child = mockRelative('c', 'Child', { fatherId: 'missing-id' });
  const broken = findBrokenParentLinks([child]);

  assert.equal(broken.length, 1);
  assert.equal(broken[0]?.code, 'broken_link');
  assert.equal(broken[0]?.field, 'fatherId');
});

test('safe delete blocks referenced person', () => {
  const parent = mockRelative('p', 'Parent', { gender: 'male' });
  const child = mockRelative('c', 'Child', { fatherId: 'p' });
  const assessment = assessSafeDelete('p', [parent, child]);

  assert.equal(assessment.canDelete, false);
  assert.equal(assessment.blockMessage, GRAPH_INTEGRITY_COPY.deleteBlocked);
  assert.equal(assessment.referencingRelatives.length, 1);
  assert.equal(assessment.referencingRelatives[0]?.id, 'c');
  assert.equal(assessment.clearReferencePatches.length, 1);
});

test('circular parent chain is blocked before save', () => {
  const father = mockRelative('f', 'Father', { gender: 'male' });
  const child = mockRelative('c', 'Child', { gender: 'male', fatherId: 'f' });
  const relatives = [father, child];

  const result = validateRelativeBeforeSave(
    baseInput({ fatherId: 'c' }),
    relatives,
    { relativeId: 'f', relatives },
  );

  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some((issue) => issue.code === 'ancestor_cycle') ||
      Boolean(result.errors.fatherId),
  );
});

test('run health check surfaces circular relations', () => {
  const a = mockRelative('a', 'A', { gender: 'male', fatherId: 'b' });
  const b = mockRelative('b', 'B', { gender: 'male', fatherId: 'a' });
  const circular = findCircularParentChains([a, b]);

  assert.ok(circular.length >= 1);
});
