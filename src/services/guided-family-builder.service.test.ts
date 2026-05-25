import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  applyPendingRootLinkAfterSave,
  buildGuidedFamilyStep,
  resolvePendingRootLinkPatch,
} from '@/services/guided-family-builder.service';

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

test('sibling step suggests shared parents when root has parents', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female' });
  const root = mockRelative('root', 'Бауыржан', {
    relationship: 'Мен',
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
  });
  const relatives = [father, mother, root];

  const step = buildGuidedFamilyStep({
    relationship: 'Іні',
    relatives,
    rootPersonId: 'root',
    formLinks: {},
  });

  assert.equal(step?.kind, 'sibling');
  assert.equal(step?.id, 'sibling-shared-parents');
  assert.deepEqual(step?.primaryAction, {
    type: 'patch_form',
    patch: { fatherId: 'f', motherId: 'm' },
  });
});

test('sibling step guides user when root has no parents', () => {
  const root = mockRelative('root', 'Бауыржан', { relationship: 'Мен', gender: 'male' });
  const relatives = [root];

  const step = buildGuidedFamilyStep({
    relationship: 'Бауыр',
    relatives,
    rootPersonId: 'root',
    formLinks: {},
  });

  assert.equal(step?.kind, 'info');
  assert.equal(step?.id, 'sibling-missing-root-parents');
});

test('spouse step links root as spouse then suggests children', () => {
  const root = mockRelative('root', 'Айгül', {
    relationship: 'Мен',
    gender: 'female',
    spouseId: 'sp',
  });
  const spouse = mockRelative('sp', 'Ерлан', { gender: 'male', spouseId: 'root' });
  const relatives = [root, spouse];

  const linkStep = buildGuidedFamilyStep({
    relationship: 'Күйеуі',
    relatives,
    rootPersonId: 'root',
    formLinks: {},
  });

  assert.equal(linkStep?.kind, 'spouse');
  assert.equal(linkStep?.id, 'spouse-link-root');
  assert.deepEqual(linkStep?.primaryAction, {
    type: 'patch_form',
    patch: { spouseId: 'root' },
  });

  const childrenStep = buildGuidedFamilyStep({
    relationship: 'Күйеуі',
    relatives,
    rootPersonId: 'root',
    formLinks: { spouseId: 'root' },
  });

  assert.equal(childrenStep?.id, 'spouse-link-children');
  assert.equal(childrenStep?.primaryAction.type, 'navigate_add_child');
});

test('child step prefills parents from root gender and spouse', () => {
  const root = mockRelative('root', 'Ерлан', {
    relationship: 'Мен',
    gender: 'male',
    spouseId: 'wife',
  });
  const wife = mockRelative('wife', 'Айгül', { gender: 'female', spouseId: 'root' });
  const relatives = [root, wife];

  const step = buildGuidedFamilyStep({
    relationship: 'Ұлы',
    relatives,
    rootPersonId: 'root',
    formLinks: {},
  });

  assert.equal(step?.kind, 'child');
  assert.deepEqual(step?.primaryAction, {
    type: 'patch_form',
    patch: { fatherId: 'root', motherId: 'wife' },
  });
});

test('parent add step confirms root link after save', () => {
  const root = mockRelative('root', 'Бауыржан', { relationship: 'Мен', gender: 'male' });
  const relatives = [root];

  const step = buildGuidedFamilyStep({
    relationship: 'Әке',
    relatives,
    rootPersonId: 'root',
    formLinks: {},
  });

  assert.equal(step?.kind, 'parent');
  assert.equal(step?.primaryAction.type, 'confirm_root_parent_link');

  if (step?.primaryAction.type === 'confirm_root_parent_link') {
    const pending = resolvePendingRootLinkPatch(step.primaryAction);
    assert.deepEqual(pending, { rootPersonId: 'root', linkField: 'fatherId' });
    assert.deepEqual(applyPendingRootLinkAfterSave(pending!, 'new-father'), {
      fatherId: 'new-father',
    });
  }
});

test('parent-side sibling blocked when grandparents missing', () => {
  const father = mockRelative('f', 'Әke', { gender: 'male' });
  const root = mockRelative('root', 'Бауыржан', {
    relationship: 'Мен',
    gender: 'male',
    fatherId: 'f',
  });
  const relatives = [father, root];

  const step = buildGuidedFamilyStep({
    relationship: 'father_side_sibling',
    relatives,
    rootPersonId: 'root',
    formLinks: {},
  });

  assert.equal(step?.kind, 'parent_side_sibling');
  assert.equal(step?.id, 'parent-side-blocked-father');
});

test('parent-side sibling applies grandparents when ready', () => {
  const grandfather = mockRelative('gf', 'Ата', { gender: 'male' });
  const grandmother = mockRelative('gm', 'Ана', { gender: 'female' });
  const father = mockRelative('f', 'Әke', {
    gender: 'male',
    fatherId: 'gf',
    motherId: 'gm',
  });
  const root = mockRelative('root', 'Бауыржан', {
    relationship: 'Мен',
    gender: 'male',
    fatherId: 'f',
  });
  const relatives = [grandfather, grandmother, father, root];

  const step = buildGuidedFamilyStep({
    relationship: 'father_side_sibling',
    relatives,
    rootPersonId: 'root',
    formLinks: {},
  });

  assert.equal(step?.kind, 'parent_side_sibling');
  assert.deepEqual(step?.primaryAction, {
    type: 'patch_form',
    patch: { fatherId: 'gf', motherId: 'gm' },
  });
});

test('dismissed steps are not shown again', () => {
  const root = mockRelative('root', 'Бауыржан', { relationship: 'Мен', gender: 'male' });
  const relatives = [root];

  const step = buildGuidedFamilyStep({
    relationship: 'Бауыр',
    relatives,
    rootPersonId: 'root',
    formLinks: {},
    dismissedStepIds: new Set(['sibling-missing-root-parents']),
  });

  assert.equal(step, null);
});
