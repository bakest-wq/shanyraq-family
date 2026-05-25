import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import { getKinshipCardLine } from '@/utils/kinship/getKinshipLabel';
import {
  buildRelativeSearchHaystack,
  getRelativeSearchMatchScore,
  matchesRelativeSearch,
  searchRelatives,
} from '@/utils/relative-search';

function mockRelative(
  id: string,
  firstName: string,
  options: Partial<Relative> = {},
): Relative {
  return {
    id,
    fullName: options.fullName ?? firstName,
    firstName,
    displayName: options.displayName ?? firstName,
    relationship: options.relationship ?? 'Туысы',
    birthday: options.birthday ?? '',
    phone: '',
    avatarColor: '#2C4A3E',
    isDeceased: options.isDeceased ?? false,
    gender: options.gender,
    fatherId: options.fatherId,
    motherId: options.motherId,
    spouseId: options.spouseId,
  };
}

test('searchRelatives matches display name, nickname, and full name', () => {
  const relatives = [
    mockRelative('1', 'Айгүл', { displayName: 'Гүлнур' }),
    mockRelative('2', 'Болат', { fullName: 'Болат Қасымов' }),
  ];

  assert.deepEqual(
    searchRelatives(relatives, 'гүлнур').map((relative) => relative.id),
    ['1'],
  );
  assert.deepEqual(
    searchRelatives(relatives, 'қасым').map((relative) => relative.id),
    ['2'],
  );
  assert.deepEqual(
    searchRelatives(relatives, 'айг').map((relative) => relative.id),
    ['1'],
  );
});

test('searchRelatives matches calculated kinship labels from anchor person', () => {
  const me = mockRelative('me', 'Мен', { gender: 'male' });
  const father = mockRelative('father', 'Қасым', {
    gender: 'male',
    fullName: 'Қасым Аға',
  });
  const grandfather = mockRelative('grandfather', 'Ақболат', {
    gender: 'male',
    fatherId: 'great-grandfather',
  });
  const relatives = [me, father, grandfather];

  me.fatherId = father.id;
  father.fatherId = grandfather.id;

  const context = { anchorPerson: me, allRelatives: relatives };
  const kinshipLabel = getKinshipCardLine(me, grandfather, relatives);

  assert.ok(kinshipLabel.length > 0);
  assert.ok(buildRelativeSearchHaystack(grandfather, context).includes(kinshipLabel.toLowerCase()));
  assert.deepEqual(
    searchRelatives(relatives, kinshipLabel, context).map((relative) => relative.id),
    ['grandfather'],
  );
});

test('searchRelatives ranks exact name matches ahead of kinship matches', () => {
  const me = mockRelative('me', 'Мен', { gender: 'male' });
  const ataPerson = mockRelative('ata', 'Ата', { gender: 'male' });
  const grandfather = mockRelative('grandfather', 'Ақболат', {
    gender: 'male',
    fullName: 'Ақболат Аға',
  });

  me.fatherId = 'father';
  const father = mockRelative('father', 'Әke', { gender: 'male', fatherId: grandfather.id });
  const relatives = [me, ataPerson, father, grandfather];

  const context = { anchorPerson: me, allRelatives: relatives };
  const results = searchRelatives(relatives, 'ата', context);

  assert.equal(results[0]?.id, 'ata');
  assert.ok(getRelativeSearchMatchScore(ataPerson, 'ата', context) > getRelativeSearchMatchScore(grandfather, 'ата', context));
});

test('searchRelatives uses prepared kinshipLabels when provided', () => {
  const me = mockRelative('me', 'Мен', { gender: 'male' });
  const father = mockRelative('father', 'Қасым', { gender: 'male' });
  const grandfather = mockRelative('grandfather', 'Ақболат', { gender: 'male' });
  const relatives = [me, father, grandfather];

  me.fatherId = father.id;
  father.fatherId = grandfather.id;

  const kinshipLabels = new Map<string, string>([
    [grandfather.id, 'Ата'],
  ]);
  const context = { anchorPerson: me, allRelatives: relatives, kinshipLabels };

  assert.deepEqual(
    searchRelatives(relatives, 'ата', context).map((relative) => relative.id),
    ['grandfather'],
  );
});

test('matchesRelativeSearch ignores empty query', () => {
  const relative = mockRelative('1', 'Айгүл');
  assert.equal(matchesRelativeSearch(relative, ''), true);
  assert.equal(matchesRelativeSearch(relative, '   '), true);
});
