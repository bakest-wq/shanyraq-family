import assert from 'node:assert/strict';
import test from 'node:test';

import type { FamilyMemory } from '@/types/archive';
import type { Relative } from '@/types/relative';
import { familyViewHref } from '@/utils/family-view';
import { buildHomeGreeting, getHomeTimeOfDay } from '@/utils/home-greeting';
import {
  getHomeBirthdayHighlights,
  getHomeFamilySummary,
  getHomeGentleReminders,
  getHomeRecentMemories,
  getIncompleteLinkRelatives,
} from '@/utils/home-dashboard';

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

function mockMemory(id: string, title: string): FamilyMemory {
  return {
    id,
    title,
    relativeId: 'r1',
    relativeName: 'Айгүл',
    year: '2024',
    story: 'Естelік',
    category: 'story',
    hasPhoto: false,
    createdAt: '2026-05-20T10:00:00.000Z',
  };
}

test('familyViewHref routes tree to shezhire tab and list to relatives tab', () => {
  assert.equal(familyViewHref('tree'), '/(tabs)/shezhire');
  assert.equal(familyViewHref('list'), '/(tabs)/relatives');
});

test('getHomeTimeOfDay picks morning, afternoon, and evening', () => {
  assert.equal(getHomeTimeOfDay(new Date(2026, 4, 23, 9, 0)), 'morning');
  assert.equal(getHomeTimeOfDay(new Date(2026, 4, 23, 14, 0)), 'afternoon');
  assert.equal(getHomeTimeOfDay(new Date(2026, 4, 23, 20, 0)), 'evening');
});

test('buildHomeGreeting personalizes with user and family names', () => {
  const greeting = buildHomeGreeting({
    familyName: 'Нұр отбасы',
    userName: 'Айгül',
    referenceDate: new Date(2026, 4, 23, 9, 0),
  });

  assert.equal(greeting.timeGreeting, 'Қайырлы таң');
  assert.match(greeting.headline, /Айгül/);
  assert.match(greeting.subline, /Нұр отбасы/);
});

test('getHomeBirthdayHighlights returns nearest upcoming birthdays', () => {
  const referenceDate = new Date(2026, 4, 23);

  const todayPerson = mockRelative('today', 'Бүгін', {
    birthdayDay: 23,
    birthdayMonth: 5,
  });
  const soonPerson = mockRelative('soon', 'Ертең', {
    birthdayDay: 24,
    birthdayMonth: 5,
  });
  const laterPerson = mockRelative('later', 'Кейін', {
    birthdayDay: 10,
    birthdayMonth: 8,
  });

  const highlights = getHomeBirthdayHighlights([todayPerson, soonPerson, laterPerson], {
    limit: 2,
    referenceDate,
  });

  assert.equal(highlights.length, 2);
  assert.equal(highlights[0]?.relative.id, 'today');
  assert.equal(highlights[1]?.relative.id, 'soon');
});

test('getIncompleteLinkRelatives skips deceased people', () => {
  const linked = mockRelative('linked', 'Байланысты', {
    fatherId: 'f',
    birthdayDay: 1,
    birthdayMonth: 1,
  });
  const orphanLiving = mockRelative('orphan', 'Жалғыз', {
    birthdayDay: 2,
    birthdayMonth: 2,
  });
  const orphanDeceased = mockRelative('gone', 'Марқұм', {
    birthdayDay: 3,
    birthdayMonth: 3,
    isDeceased: true,
  });
  const father = mockRelative('f', 'Әke');

  const incomplete = getIncompleteLinkRelatives([linked, orphanLiving, orphanDeceased, father]);

  assert.equal(incomplete.length, 1);
  assert.equal(incomplete[0]?.id, 'orphan');
});

test('getHomeRecentMemories returns newest memories first', () => {
  const memories = [
    mockMemory('old', 'Ескі'),
    mockMemory('new', 'Жаңа'),
  ];

  memories[0] = { ...memories[0], createdAt: '2026-01-01T00:00:00.000Z' };
  memories[1] = { ...memories[1], createdAt: '2026-05-20T00:00:00.000Z' };

  const recent = getHomeRecentMemories(memories, 1);

  assert.equal(recent.length, 1);
  assert.equal(recent[0]?.title, 'Жаңа');
});

test('getHomeFamilySummary describes a growing family', () => {
  const relatives = [
    mockRelative('a', 'А'),
    mockRelative('b', 'Б', { isDeceased: true }),
  ];

  const summary = getHomeFamilySummary(relatives, [mockMemory('m1', 'Естelік')], 1);

  assert.match(summary.line, /1 туыс/);
  assert.match(summary.line, /1 естелік/);
});

test('getHomeGentleReminders prioritizes birthday today and identity', () => {
  const today = mockRelative('today', 'Болат', {
    birthdayDay: 23,
    birthdayMonth: 5,
  });

  const reminders = getHomeGentleReminders({
    birthdayHighlights: [{ relative: today, daysUntil: 0 }],
    memories: [],
    deceasedCount: 0,
    hasLinkedIdentity: false,
    limit: 2,
  });

  assert.equal(reminders.length, 2);
  assert.equal(reminders[0]?.id, 'birthday-today:today');
  assert.equal(reminders[1]?.id, 'identity');
});
