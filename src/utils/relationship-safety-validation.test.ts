import assert from 'node:assert/strict';
import test from 'node:test';

import type { CreateRelativeInput, Relative } from '@/types/relative';
import {
  assertRelationshipSafetyForLinkPatch,
  assertRelationshipSafetyForSave,
  RELATIONSHIP_SAFETY_MESSAGES,
  RelationshipSafetyBlockedError,
  validateLinkedChildIdsBeforeSave,
  validateRelationshipSafetyForSave,
} from '@/utils/relationship-safety-validation';

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

function baseInput(overrides: Partial<CreateRelativeInput> = {}): CreateRelativeInput {
  return {
    fullName: 'Test',
    firstName: 'Test',
    relationship: 'Бала',
    birthday: '',
    ...overrides,
  };
}

test('blocks sibling becoming parent', () => {
  const father = mockRelative('f', 'Father', { gender: 'male' });
  const root = mockRelative('root', 'Root', { gender: 'male', fatherId: 'f' });
  const brother = mockRelative('bro', 'Brother', { gender: 'male', fatherId: 'f' });
  const relatives = [father, root, brother];

  const errors = validateRelationshipSafetyForSave(
    baseInput({ fatherId: 'bro' }),
    relatives,
    { relativeId: 'root', relatives },
  );

  assert.equal(errors.fatherId, RELATIONSHIP_SAFETY_MESSAGES.siblingAsParent);
});

test('blocks child becoming parent', () => {
  const father = mockRelative('f', 'Father', { gender: 'male' });
  const child = mockRelative('c', 'Child', { gender: 'male', fatherId: 'f' });
  const grandchild = mockRelative('gc', 'Grandchild', { gender: 'male', fatherId: 'c' });
  const relatives = [father, child, grandchild];

  const errors = validateRelationshipSafetyForSave(
    baseInput({ fatherId: 'gc' }),
    relatives,
    { relativeId: 'f', relatives },
  );

  assert.ok(
    errors.fatherId === RELATIONSHIP_SAFETY_MESSAGES.childAsParent ||
      errors.fatherId === RELATIONSHIP_SAFETY_MESSAGES.circularParents,
  );
});

test('blocks spouse becoming parent', () => {
  const person = mockRelative('p', 'Person', { gender: 'male', spouseId: 's' });
  const spouse = mockRelative('s', 'Spouse', { gender: 'female', spouseId: 'p' });
  const relatives = [person, spouse];

  const errors = validateRelationshipSafetyForSave(
    baseInput({ fatherId: 's', spouseId: 's' }),
    relatives,
    { relativeId: 'p', relatives },
  );

  assert.equal(errors.fatherId, RELATIONSHIP_SAFETY_MESSAGES.spouseAsParent);
});

test('blocks self as father, mother, or spouse', () => {
  const person = mockRelative('p', 'Person', { gender: 'male' });
  const relatives = [person];

  assert.equal(
    validateRelationshipSafetyForSave(
      baseInput({ fatherId: 'p' }),
      relatives,
      { relativeId: 'p', relatives },
    ).fatherId,
    RELATIONSHIP_SAFETY_MESSAGES.self,
  );
  assert.equal(
    validateRelationshipSafetyForSave(
      baseInput({ motherId: 'p' }),
      relatives,
      { relativeId: 'p', relatives },
    ).motherId,
    RELATIONSHIP_SAFETY_MESSAGES.self,
  );
  assert.equal(
    validateRelationshipSafetyForSave(
      baseInput({ spouseId: 'p' }),
      relatives,
      { relativeId: 'p', relatives },
    ).spouseId,
    RELATIONSHIP_SAFETY_MESSAGES.self,
  );
});

test('blocks circular parent chains before save', () => {
  const left = mockRelative('a', 'A', { gender: 'male', fatherId: 'b' });
  const right = mockRelative('b', 'B', { gender: 'male', fatherId: 'a' });
  const relatives = [left, right];

  const errors = validateRelationshipSafetyForSave(
    baseInput({ fatherId: 'a' }),
    relatives,
    { relativeId: 'b', relatives },
  );

  assert.equal(errors.fatherId, RELATIONSHIP_SAFETY_MESSAGES.circularParents);
});

test('blocks ancestor as spouse on create', () => {
  const grandfather = mockRelative('gf', 'Grandfather', { gender: 'male' });
  const father = mockRelative('f', 'Father', { gender: 'male', fatherId: 'gf' });
  const relatives = [grandfather, father];

  const errors = validateRelationshipSafetyForSave(
    baseInput({ fatherId: 'f', spouseId: 'gf' }),
    relatives,
  );

  assert.equal(errors.spouseId, RELATIONSHIP_SAFETY_MESSAGES.parentAsSpouse);
});

test('blocks spouse already linked to someone else', () => {
  const person = mockRelative('p', 'Person', { gender: 'male' });
  const taken = mockRelative('t', 'Taken', { gender: 'female', spouseId: 'other' });
  const other = mockRelative('other', 'Other', { gender: 'male', spouseId: 't' });
  const relatives = [person, taken, other];

  const errors = validateRelationshipSafetyForSave(
    baseInput({ spouseId: 't' }),
    relatives,
    { relativeId: 'p', relatives },
  );

  assert.equal(errors.spouseId, RELATIONSHIP_SAFETY_MESSAGES.spouseAlreadyLinked);
});

test('blocks sibling as child via linked child ids', () => {
  const father = mockRelative('f', 'Father', { gender: 'male' });
  const root = mockRelative('root', 'Root', { gender: 'male', fatherId: 'f' });
  const brother = mockRelative('bro', 'Brother', { gender: 'male', fatherId: 'f' });
  const relatives = [father, root, brother];

  const errors = validateLinkedChildIdsBeforeSave('root', ['bro'], 'father', relatives);

  assert.equal(errors.fatherId, RELATIONSHIP_SAFETY_MESSAGES.siblingAsChild);
});

test('validates proposed spouse-parent conflict on create', () => {
  const person = mockRelative('p', 'Person', { gender: 'male' });
  const spouse = mockRelative('s', 'Spouse', { gender: 'female' });
  const relatives = [person, spouse];

  const errors = validateRelationshipSafetyForSave(
    baseInput({ fatherId: 's', spouseId: 's' }),
    relatives,
  );

  assert.equal(errors.fatherId, RELATIONSHIP_SAFETY_MESSAGES.spouseAsParent);
});

test('assertRelationshipSafetyForLinkPatch throws warm message only', () => {
  const father = mockRelative('f', 'Father', { gender: 'male' });
  const child = mockRelative('c', 'Child', { gender: 'male', fatherId: 'f' });
  const grandchild = mockRelative('gc', 'Grandchild', { gender: 'male', fatherId: 'c' });
  const relatives = [father, child, grandchild];

  assert.throws(
    () => assertRelationshipSafetyForLinkPatch('f', { fatherId: 'gc' }, relatives),
    (error: unknown) => {
      assert.ok(error instanceof RelationshipSafetyBlockedError);
      assert.ok(
        error.message === RELATIONSHIP_SAFETY_MESSAGES.childAsParent ||
          error.message === RELATIONSHIP_SAFETY_MESSAGES.circularParents,
      );
      assert.ok(error.fieldErrors.fatherId);
      return true;
    },
  );
});

test('assertRelationshipSafetyForSave allows valid parent link', () => {
  const father = mockRelative('f', 'Father', { gender: 'male' });
  const child = mockRelative('c', 'Child', { gender: 'male' });
  const relatives = [father, child];

  assert.doesNotThrow(() =>
    assertRelationshipSafetyForSave(
      baseInput({ fatherId: 'f' }),
      relatives,
      { relativeId: 'c', relatives },
    ),
  );
});
