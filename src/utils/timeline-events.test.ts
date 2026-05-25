import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  buildAutoTimelineEvents,
  dedupeTimelineEvents,
  groupTimelineEventsByYear,
  mergeTimelineEvents,
} from '@/utils/timeline-events';

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
    birthdayYear: options.birthdayYear,
    birthdayMonth: options.birthdayMonth,
    birthdayDay: options.birthdayDay,
    phone: '',
    avatarColor: '#2C4A3E',
    isDeceased: options.isDeceased ?? false,
    gender: options.gender,
    fatherId: options.fatherId,
    motherId: options.motherId,
    spouseId: options.spouseId,
    deathYear: options.deathYear,
    duaText: options.duaText,
  };
}

test('mergeTimelineEvents keeps only meaningful event types', () => {
  const relatives = [
    mockRelative('child', 'Бала', { birthdayYear: 2010, birthdayMonth: 3, birthdayDay: 5 }),
    mockRelative('father', 'Әke', {
      gender: 'male',
      birthdayYear: 1980,
      spouseId: 'mother',
    }),
    mockRelative('mother', 'Ана', {
      gender: 'female',
      birthdayYear: 1982,
      spouseId: 'father',
    }),
  ];

  relatives[0].fatherId = 'father';
  relatives[0].motherId = 'mother';

  const events = mergeTimelineEvents(relatives, new Date(2026, 0, 1));
  const types = new Set(events.map((event) => event.type));

  assert.ok(types.has('birth'));
  assert.ok(types.has('marriage'));
  assert.equal(types.has('migration' as never), false);
});

test('marriage events are deduplicated for spouse pairs', () => {
  const relatives = [
    mockRelative('a', 'Айгүл', { spouseId: 'b', gender: 'female' }),
    mockRelative('b', 'Болат', { spouseId: 'a', gender: 'male' }),
  ];

  const marriages = mergeTimelineEvents(relatives).filter((event) => event.type === 'marriage');
  assert.equal(marriages.length, 1);
});

test('anniversary events include jubilee and memorial milestones', () => {
  const relatives = [
    mockRelative('elder', 'Ата', {
      birthdayYear: 1950,
      birthdayMonth: 6,
      birthdayDay: 12,
      isDeceased: true,
      deathYear: 2020,
    }),
  ];

  const events = mergeTimelineEvents(relatives, new Date(2026, 0, 1));
  const anniversaries = events.filter((event) => event.type === 'anniversary');

  assert.ok(anniversaries.some((event) => event.title.includes('70 жас')));
  assert.ok(anniversaries.some((event) => event.title.includes('5 жыл еске алу')));
});

test('groupTimelineEventsByYear groups events and sorts newest years first', () => {
  const events = buildAutoTimelineEvents([
    mockRelative('a', 'А', { birthdayYear: 1990 }),
    mockRelative('b', 'Б', { birthdayYear: 1980 }),
  ]);

  const sections = groupTimelineEventsByYear(dedupeTimelineEvents(events));

  assert.equal(sections[0]?.year, 1990);
  assert.equal(sections[1]?.year, 1980);
});

test('dedupeTimelineEvents removes duplicate keys', () => {
  const event = {
    id: 'auto:birth:1',
    type: 'birth' as const,
    source: 'auto' as const,
    title: 'А дүниеге келді',
    year: 1990,
    relativeIds: ['1'],
    relativeNames: ['А'],
    createdAt: '',
  };

  const duplicate = { ...event, id: 'auto:birth:1-copy' };
  assert.equal(dedupeTimelineEvents([event, duplicate]).length, 1);
});
