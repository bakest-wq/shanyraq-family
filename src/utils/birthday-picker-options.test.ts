import assert from 'node:assert/strict';
import test from 'node:test';

import {
  filterBirthdayDayOptions,
  filterBirthdayMonthOptions,
  getCompactBirthYearOptions,
  monthMatchesSearch,
  parseManualBirthdayInput,
} from '@/utils/birthday-picker-options';

test('monthMatchesSearch supports Kazakh, Russian, and English names', () => {
  assert.equal(monthMatchesSearch(1, 'қаң'), true);
  assert.equal(monthMatchesSearch(1, 'январ'), true);
  assert.equal(monthMatchesSearch(1, 'january'), true);
  assert.equal(monthMatchesSearch(3, 'март'), true);
});

test('filterBirthdayDayOptions matches day numbers', () => {
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  assert.deepEqual(filterBirthdayDayOptions(days, '27'), [27]);
  assert.ok(filterBirthdayDayOptions(days, '2').includes(2));
  assert.ok(filterBirthdayDayOptions(days, '2').includes(20));
});

test('filterBirthdayMonthOptions filters by month name', () => {
  const results = filterBirthdayMonthOptions('наурыз');
  assert.equal(results.length, 1);
  assert.equal(results[0]?.value, 3);
});

test('getCompactBirthYearOptions returns recent years by default', () => {
  const years = getCompactBirthYearOptions({ referenceDate: new Date('2026-05-23') });
  assert.equal(years[0], 2026);
  assert.ok(years.length <= 32);
  assert.ok(!years.includes(1900));
});

test('getCompactBirthYearOptions includes selected year window when outside recent range', () => {
  const years = getCompactBirthYearOptions({
    selectedYear: 1965,
    referenceDate: new Date('2026-05-23'),
  });

  assert.ok(years.includes(1965));
  assert.ok(years.includes(1960));
});

test('getCompactBirthYearOptions searches full year range', () => {
  const years = getCompactBirthYearOptions({
    searchQuery: '1965',
    referenceDate: new Date('2026-05-23'),
  });

  assert.deepEqual(years, [1965]);
});

test('parseManualBirthdayInput accepts DD.MM.YYYY and YYYY-MM-DD', () => {
  assert.deepEqual(parseManualBirthdayInput('27.03.1965'), {
    day: 27,
    month: 3,
    year: 1965,
    yearUnknown: false,
  });

  assert.deepEqual(parseManualBirthdayInput('1965-03-27'), {
    day: 27,
    month: 3,
    year: 1965,
    yearUnknown: false,
  });
});

test('parseManualBirthdayInput rejects invalid dates', () => {
  assert.equal(parseManualBirthdayInput('31.02.1965'), null);
  assert.equal(parseManualBirthdayInput('not-a-date'), null);
});
