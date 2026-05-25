import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  buildBirthdaySections,
  getMilestoneAge,
  getSmartReminderHint,
  getRelativesWithBirthdays,
} from '@/utils/birthday-calendar';
import { formatBirthdayCountdownKz } from '@/utils/dates';

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
    birthday: options.birthday ?? '',
    birthdayYear: options.birthdayYear,
    phone: '',
    avatarColor: '#2C4A3E',
    isDeceased: options.isDeceased ?? false,
    gender: options.gender,
    fatherId: options.fatherId,
    motherId: options.motherId,
    spouseId: options.spouseId,
    birthdayDay: options.birthdayDay,
    birthdayMonth: options.birthdayMonth,
  };
}

test('formatBirthdayCountdownKz uses Kazakh labels', () => {
  assert.equal(formatBirthdayCountdownKz(0), 'Бүгін');
  assert.equal(formatBirthdayCountdownKz(1), 'Ертең');
  assert.equal(formatBirthdayCountdownKz(2), '2 күн қалды');
});

test('getSmartReminderHint covers today and soon window', () => {
  assert.equal(getSmartReminderHint(0), 'today');
  assert.equal(getSmartReminderHint(3), 'soon');
  assert.equal(getSmartReminderHint(8), null);
});

test('getRelativesWithBirthdays excludes deceased by default', () => {
  const living = mockRelative('l', 'Айжан', {
    birthdayDay: 10,
    birthdayMonth: 5,
  });
  const deceased = mockRelative('d', 'Болат', {
    birthdayDay: 12,
    birthdayMonth: 6,
    isDeceased: true,
  });

  const livingOnly = getRelativesWithBirthdays([living, deceased], false);
  assert.equal(livingOnly.length, 1);
  assert.equal(livingOnly[0]?.id, 'l');

  const withDeceased = getRelativesWithBirthdays([living, deceased], true);
  assert.equal(withDeceased.length, 2);
});

test('buildBirthdaySections splits today, upcoming, and all', () => {
  const referenceDate = new Date(2026, 4, 23); // May 23, 2026

  const todayPerson = mockRelative('today', 'Бүгінгі', {
    birthdayDay: 23,
    birthdayMonth: 5,
    birthdayYear: 1990,
  });
  const soonPerson = mockRelative('soon', 'Жақын', {
    birthdayDay: 25,
    birthdayMonth: 5,
    birthdayYear: 2000,
  });
  const laterPerson = mockRelative('later', 'Кейін', {
    birthdayDay: 10,
    birthdayMonth: 8,
    birthdayYear: 1985,
  });

  const sections = buildBirthdaySections([todayPerson, soonPerson, laterPerson], {
    referenceDate,
    includeDeceased: false,
    upcomingDays: 30,
  });

  assert.equal(sections.today.length, 1);
  assert.equal(sections.today[0]?.relative.id, 'today');
  assert.equal(sections.upcoming.length, 1);
  assert.equal(sections.upcoming[0]?.relative.id, 'soon');
  assert.ok(sections.all.some((entry) => entry.relative.id === 'later'));
  assert.equal(sections.upcoming[0]?.daysUntil, 2);
});

test('getMilestoneAge detects milestone birthdays', () => {
  const referenceDate = new Date(2026, 0, 1); // Jan 1, 2026

  const turning18 = mockRelative('m18', 'Жас 18', {
    birthdayDay: 15,
    birthdayMonth: 6,
    birthdayYear: 2008,
  });

  const sections = buildBirthdaySections([turning18], { referenceDate });
  const entry = sections.all[0] ?? sections.thisMonth[0] ?? sections.upcoming[0];

  assert.ok(entry);
  assert.equal(getMilestoneAge(entry), 18);
});
