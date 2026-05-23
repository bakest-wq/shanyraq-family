import { Relative } from '@/types/relative';
import {
  buildSiblingRelationshipSync,
  sanitizeSiblingParentPatch,
} from '@/utils/sibling-relationship-sync';

function expectEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(message ?? `Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function expectNotEqual<T>(actual: T, expected: T, message?: string) {
  if (actual === expected) {
    throw new Error(message ?? `Expected value to differ from ${String(expected)}`);
  }
}

function makeRelative(
  id: string,
  overrides: Partial<Relative> = {},
): Relative {
  return {
    id,
    fullName: overrides.fullName ?? id,
    firstName: overrides.firstName ?? id,
    displayName: overrides.displayName ?? id,
    relationship: overrides.relationship ?? 'Бауыр',
    birthday: '',
    phone: '',
    avatarColor: '#000000',
    isDeceased: false,
    ...overrides,
  };
}

function test(name: string, fn: () => void) {
  fn();
  console.log(`ok - ${name}`);
}

test('brother: selecting sibling never sets sibling.father_id to current person', () => {
  const father = makeRelative('father', { fullName: 'Ғалымжан', gender: 'male' });
  const mother = makeRelative('mother', { fullName: 'Фирдаус', gender: 'female' });
  const bauyrzhan = makeRelative('bauyrzhan', {
    fullName: 'Бауыржан',
    relationship: 'Мен',
    fatherId: father.id,
    motherId: mother.id,
    gender: 'male',
  });
  const alimzhan = makeRelative('alimzhan', {
    fullName: 'Алимжан',
    relationship: 'Іні',
    fatherId: bauyrzhan.id,
    gender: 'male',
  });

  const plan = buildSiblingRelationshipSync(
    bauyrzhan.id,
    { fatherId: bauyrzhan.fatherId, motherId: bauyrzhan.motherId },
    alimzhan,
  );

  expectNotEqual(plan.siblingPatch.fatherId, bauyrzhan.id);
  expectEqual(plan.siblingPatch.fatherId, father.id);
  expectEqual(plan.removesInvalidChildLink, true);
});

test('sister: copies shared parents without child link', () => {
  const father = makeRelative('father', { gender: 'male' });
  const mother = makeRelative('mother', { gender: 'female' });
  const bauyrzhan = makeRelative('bauyrzhan', {
    fatherId: father.id,
    motherId: mother.id,
    gender: 'male',
  });
  const sister = makeRelative('sister', {
    fullName: 'Айша',
    relationship: 'Әпке',
    gender: 'female',
  });

  const plan = buildSiblingRelationshipSync(
    bauyrzhan.id,
    { fatherId: bauyrzhan.fatherId, motherId: bauyrzhan.motherId },
    sister,
  );

  expectEqual(plan.siblingPatch.fatherId, father.id);
  expectEqual(plan.siblingPatch.motherId, mother.id);
  expectNotEqual(plan.siblingPatch.fatherId, bauyrzhan.id);
  expectNotEqual(plan.siblingPatch.motherId, bauyrzhan.id);
});

test('older brother: removes subject-as-parent and inherits real father', () => {
  const father = makeRelative('father', { gender: 'male' });
  const bauyrzhan = makeRelative('bauyrzhan', {
    fatherId: father.id,
    gender: 'male',
  });
  const olderBrother = makeRelative('older-brother', {
    fullName: 'Алимжан',
    relationship: 'Аға',
    fatherId: bauyrzhan.id,
    gender: 'male',
  });

  const plan = buildSiblingRelationshipSync(
    bauyrzhan.id,
    { fatherId: bauyrzhan.fatherId },
    olderBrother,
  );

  expectEqual(plan.siblingPatch.fatherId, father.id);
  expectNotEqual(plan.siblingPatch.fatherId, bauyrzhan.id);
});

test('younger sister: syncs missing parents from sibling to subject', () => {
  const father = makeRelative('father', { gender: 'male' });
  const mother = makeRelative('mother', { gender: 'female' });
  const bauyrzhan = makeRelative('bauyrzhan', {
    fatherId: father.id,
    motherId: mother.id,
    gender: 'male',
  });
  const youngerSister = makeRelative('younger-sister', {
    fullName: 'Асия',
    relationship: 'Қарындас',
    fatherId: father.id,
    motherId: mother.id,
    gender: 'female',
  });

  const plan = buildSiblingRelationshipSync(bauyrzhan.id, {}, youngerSister);

  expectEqual(plan.subjectPatch.fatherId, father.id);
  expectEqual(plan.subjectPatch.motherId, mother.id);
  expectNotEqual(plan.subjectPatch.fatherId, youngerSister.id);
});

test('sanitizeSiblingParentPatch blocks subject id on sibling patch', () => {
  const sanitized = sanitizeSiblingParentPatch('subject', 'sibling', {
    fatherId: 'subject',
    motherId: 'mother',
  });

  expectEqual(sanitized.fatherId, undefined);
  expectEqual(sanitized.motherId, 'mother');
});

console.log('All sibling relationship sync tests passed.');
