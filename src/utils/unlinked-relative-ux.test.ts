import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import { analyzeUnlinkedRelative } from '@/utils/unlinked-relative-ux';

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

test('missing parents shows warm reason and parent action', () => {
  const person = mockRelative('p', 'Майя', { relationship: 'Бауыр' });
  const insight = analyzeUnlinkedRelative(person, [person]);

  assert.ok(insight.reasons.includes('Ата-анасы байланыстырылмаған'));
  assert.ok(insight.actions.some((action) => action.id === 'link_parents'));
  assert.ok(insight.actions.some((action) => action.id === 'focus_tree'));
});

test('parent without spouse suggests spouse link', () => {
  const parent = mockRelative('p', 'Ғалымжан', {
    relationship: 'Әке',
    gender: 'male',
    fatherId: 'gp',
  });
  const child = mockRelative('c', 'Бала', { fatherId: 'p' });
  const relatives = [parent, child];

  const insight = analyzeUnlinkedRelative(parent, relatives);

  assert.ok(insight.reasons.includes('Жұбайы көрсетілмеген'));
  assert.ok(insight.actions.some((action) => action.id === 'link_spouse'));
});

test('linked but isolated relative gets soft shezhire reason', () => {
  const father = mockRelative('f', 'Болат', { gender: 'male' });
  const person = mockRelative('p', 'Серік', { fatherId: 'f', motherId: 'm' });
  const mother = mockRelative('m', 'Гүлнар', { gender: 'female', spouseId: 'f' });
  father.spouseId = 'm';

  const insight = analyzeUnlinkedRelative(person, [person, father, mother]);

  assert.ok(insight.reasons.includes('Шежіредегі орны анықталмаған'));
});
