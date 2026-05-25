import assert from 'node:assert/strict';
import test from 'node:test';

import { buildBauyrzhanLabFamily } from '@/services/kinship/lab/kinship-lab.fixtures';
import {
  RELATIVE_PRIORITY_TIERS,
  getRelativePriorityTier,
  sortRelativesBySmartPriority,
} from '@/services/relative-priority-sort';
import {
  clearRelativeInteractionSession,
  recordRelativeInteraction,
} from '@/services/relative-interaction-session';
import { buildJurtGroups } from '@/utils/jurt-grouping';

test('getRelativePriorityTier maps core kinship bands', () => {
  const family = buildBauyrzhanLabFamily();
  const root = family.members.bauyrzhan;
  const relatives = family.relatives;

  assert.equal(
    getRelativePriorityTier(root, family.members.father, relatives),
    RELATIVE_PRIORITY_TIERS.parents,
  );
  assert.equal(
    getRelativePriorityTier(root, family.members.mother, relatives),
    RELATIVE_PRIORITY_TIERS.parents,
  );
  assert.equal(
    getRelativePriorityTier(root, family.members.anna, relatives),
    RELATIVE_PRIORITY_TIERS.spouse,
  );
  assert.equal(
    getRelativePriorityTier(root, family.members.son, relatives),
    RELATIVE_PRIORITY_TIERS.children,
  );
  assert.equal(
    getRelativePriorityTier(root, family.members.brother, relatives),
    RELATIVE_PRIORITY_TIERS.siblings,
  );
  assert.equal(
    getRelativePriorityTier(root, family.members.jenge, relatives),
    RELATIVE_PRIORITY_TIERS.siblingSpouses,
  );
  assert.equal(
    getRelativePriorityTier(root, family.members.annaFather, relatives),
    RELATIVE_PRIORITY_TIERS.spouseSideClose,
  );
  assert.equal(
    getRelativePriorityTier(root, family.members.nagAta, relatives),
    RELATIVE_PRIORITY_TIERS.extended,
  );
});

test('sortRelativesBySmartPriority orders by tier then name', () => {
  const family = buildBauyrzhanLabFamily();
  const root = family.members.bauyrzhan;
  const relatives = family.relatives;

  const targets = [
    family.members.nagAta,
    family.members.brother,
    family.members.father,
    family.members.anna,
    family.members.son,
    family.members.jenge,
  ];

  const sorted = sortRelativesBySmartPriority(root, targets, { allRelatives: relatives });

  assert.deepEqual(
    sorted.map((relative) => relative.id),
    ['f', 'an', 'son', 'bro', 'jenge', 'nga'],
  );
});

test('sortRelativesBySmartPriority is stable for equal tiers and names', () => {
  const family = buildBauyrzhanLabFamily();
  const root = family.members.bauyrzhan;

  const siblingA = { ...family.members.brother, id: 'bro-a', firstName: 'Алим', displayName: 'Алим' };
  const siblingB = { ...family.members.sister, id: 'bro-b', firstName: 'Алим', displayName: 'Алим' };
  const relatives = [...family.relatives, siblingA, siblingB];

  const firstPass = sortRelativesBySmartPriority(root, [siblingA, siblingB], { allRelatives: relatives });
  const secondPass = sortRelativesBySmartPriority(root, [siblingB, siblingA], { allRelatives: relatives });

  assert.deepEqual(
    firstPass.map((relative) => relative.id),
    secondPass.map((relative) => relative.id),
  );
});

test('sortRelativesBySmartPriority prefers recently opened relatives within tier', () => {
  clearRelativeInteractionSession();

  const family = buildBauyrzhanLabFamily();
  const root = family.members.bauyrzhan;
  const relatives = family.relatives;

  recordRelativeInteraction(root.id, family.members.brother.id);
  recordRelativeInteraction(root.id, family.members.sister.id);
  recordRelativeInteraction(root.id, family.members.brother.id);

  const sorted = sortRelativesBySmartPriority(root, [family.members.sister, family.members.brother], {
    allRelatives: relatives,
  });

  assert.equal(sorted[0]?.id, 'bro');
  assert.equal(sorted[1]?.id, 'sis');
});

test('buildJurtGroups sibling bucket uses smart priority ordering', () => {
  clearRelativeInteractionSession();

  const family = buildBauyrzhanLabFamily();
  const root = family.members.bauyrzhan;
  const relatives = family.relatives;

  recordRelativeInteraction(root.id, family.members.sister.id);

  const groups = buildJurtGroups(root, relatives, new Set([root.id]));
  const siblingSubgroup = groups.oz.subgroups?.find((subgroup) => subgroup.id === 'siblings');

  assert.ok(siblingSubgroup);
  assert.equal(siblingSubgroup.entries[0]?.person.id, 'sis');
});
