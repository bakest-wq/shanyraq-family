import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  getKinshipCardLine,
  getThreeJurtGroup,
} from '@/services/kinship.service';
import {
  isMeRootPerson,
  resolveRootPerson,
  shouldResetFocusOnIdentityChange,
} from '@/services/root-person-identity.service';

function mockRelative(id: string, firstName: string, options: Partial<Relative> = {}): Relative {
  return {
    id,
    fullName: firstName,
    firstName,
    displayName: firstName,
    relationship: options.relationship ?? 'Туысы',
    birthday: options.birthday ?? '',
    birthdayYear: options.birthdayYear,
    phone: '',
    avatarColor: '#2C4A3E',
    isDeceased: false,
    gender: options.gender,
    fatherId: options.fatherId,
    motherId: options.motherId,
    spouseId: options.spouseId,
  };
}

test('resolveRootPerson prefers me until focus is ready', () => {
  const me = mockRelative('me', 'Бауыржан', { gender: 'male' });
  const focus = mockRelative('f', 'Анна', { gender: 'female' });

  assert.equal(resolveRootPerson(focus, me, false)?.id, 'me');
  assert.equal(resolveRootPerson(focus, me, true)?.id, 'f');
  assert.equal(resolveRootPerson(null, me, true)?.id, 'me');
});

test('isMeRootPerson detects linked identity match', () => {
  const me = mockRelative('me', 'Бауыржан', { gender: 'male' });
  const other = mockRelative('o', 'Анна', { gender: 'female' });

  assert.equal(isMeRootPerson(me, me), true);
  assert.equal(isMeRootPerson(other, me), false);
});

test('shouldResetFocusOnIdentityChange only after first identity is set', () => {
  assert.equal(shouldResetFocusOnIdentityChange(null, 'a'), false);
  assert.equal(shouldResetFocusOnIdentityChange('a', 'a'), false);
  assert.equal(shouldResetFocusOnIdentityChange('a', 'b'), true);
});

test('root switch recalculates label and jurt instantly from graph', () => {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female', spouseId: 'f' });
  const bauyrzhan = mockRelative('b', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
  });
  const anna = mockRelative('an', 'Анна', { gender: 'female', spouseId: 'b' });
  const annaFather = mockRelative('af', 'Абдулрашид', { gender: 'male' });
  anna.fatherId = 'af';

  const relatives = [father, mother, bauyrzhan, anna, annaFather];

  const fromBauyrzhan = getKinshipCardLine(bauyrzhan, annaFather, relatives);
  const fromAnna = getKinshipCardLine(anna, annaFather, relatives);

  assert.match(fromBauyrzhan, /Қайын ата/);
  assert.equal(fromAnna, 'Әке');

  assert.equal(getThreeJurtGroup(bauyrzhan, annaFather, relatives), 'kaiyn_jurt');
  assert.notEqual(getThreeJurtGroup(anna, annaFather, relatives), 'kaiyn_jurt');
});
