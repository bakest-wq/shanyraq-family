import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  relativeToBirthdayFormParts,
  syncBirthdayFields,
  validateBirthdayPartsInput,
} from '@/utils/birthday-parts';

test('syncBirthdayFields: new birthday from day/month/year parts', () => {
  const synced = syncBirthdayFields({
    birthday: '',
    birthdayDay: 15,
    birthdayMonth: 3,
    birthdayYear: 1990,
    birthdayYearUnknown: false,
  });

  assert.equal(synced.birthday, '1990-03-15');
  assert.equal(synced.birthdayDay, 15);
  assert.equal(synced.birthdayMonth, 3);
  assert.equal(synced.birthdayYear, 1990);
});

test('syncBirthdayFields: unknown year keeps day/month without ISO birthday', () => {
  const synced = syncBirthdayFields({
    birthday: '',
    birthdayDay: 7,
    birthdayMonth: 5,
    birthdayYear: null,
    birthdayYearUnknown: true,
  });

  assert.equal(synced.birthday, '');
  assert.equal(synced.birthdayDay, 7);
  assert.equal(synced.birthdayMonth, 5);
  assert.equal(synced.birthdayYear, null);
  assert.equal(synced.birthdayYearUnknown, true);
});

test('syncBirthdayFields: hydrates parts from legacy ISO when parts missing', () => {
  const synced = syncBirthdayFields({
    birthday: '1985-11-20',
    birthdayDay: null,
    birthdayMonth: null,
    birthdayYear: null,
    birthdayYearUnknown: false,
  });

  assert.equal(synced.birthday, '1985-11-20');
  assert.equal(synced.birthdayDay, 20);
  assert.equal(synced.birthdayMonth, 11);
  assert.equal(synced.birthdayYear, 1985);
});

test('syncBirthdayFields: editing existing birthday updates ISO', () => {
  const synced = syncBirthdayFields({
    birthday: '1990-03-15',
    birthdayDay: 15,
    birthdayMonth: 3,
    birthdayYear: 1992,
    birthdayYearUnknown: false,
  });

  assert.equal(synced.birthday, '1992-03-15');
});

test('relativeToBirthdayFormParts: round-trips ISO record for edit form', () => {
  const relative = {
    id: 'r1',
    fullName: 'Test',
    firstName: 'Test',
    displayName: 'Test',
    relationship: 'Туысы',
    birthday: '1990-03-15',
    birthdayDay: 15,
    birthdayMonth: 3,
    birthdayYear: 1990,
    birthdayYearUnknown: false,
    phone: '',
    avatarColor: '#000',
    isDeceased: false,
  } satisfies Relative;

  const parts = relativeToBirthdayFormParts(relative);
  const synced = syncBirthdayFields(parts);

  assert.equal(synced.birthday, '1990-03-15');
});

test('validateBirthdayPartsInput: accepts partial date with unknown year', () => {
  assert.equal(
    validateBirthdayPartsInput({
      birthdayDay: 10,
      birthdayMonth: 6,
      birthdayYear: null,
      birthdayYearUnknown: true,
    }),
    undefined,
  );
});

test('validateBirthdayPartsInput: rejects day without month', () => {
  assert.match(
    validateBirthdayPartsInput({ birthdayDay: 10, birthdayMonth: null }) ?? '',
    /Күн мен ай/i,
  );
});
