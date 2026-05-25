import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import { mapRelativeRow } from '@/utils/relative.mapper';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  isReferencedAsParent,
  resolveShezhireParentSlots,
} from '@/utils/shezhire-parent-lookup';
import { debugRootGraph } from '@/utils/shezhire/debugGraph';
import { findOrphanRelatives } from '@/services/graph-integrity.service';

function mockRelative(
  id: string,
  fullName: string,
  options: Partial<Relative> = {},
): Relative {
  return {
    id,
    firstName: fullName.split(/\s+/)[0] ?? fullName,
    fullName,
    gender: 'male',
    avatarColor: '#000000',
    relationship: 'Туыс',
    ...options,
  };
}

test('getRelativeDisplayName uses stored full_name only', () => {
  const relative = mockRelative('p', 'Иванов Иван Иванович', {
    firstName: 'Иван',
    middleName: 'Иванович',
    currentSurname: 'Иванов',
  });

  assert.equal(getRelativeDisplayName(relative), 'Иванов Иван Иванович');
});

test('mapRelativeRow prefers database full_name over composed parts', () => {
  const relative = mapRelativeRow({
    id: 'p',
    family_id: 'fam',
    full_name: 'Петров Петр Петрович',
    first_name: 'Петр',
    middle_name: 'Петрович',
    current_surname: 'Петров',
    display_name: null,
    relationship: 'Туыс',
    birthday: null,
    birthday_day: null,
    birthday_month: null,
    birthday_year: null,
    phone: null,
    avatar_color: '#000',
    photo_url: null,
    is_deceased: false,
    death_year: null,
    dua_text: null,
    notes: null,
    father_id: null,
    mother_id: null,
    spouse_id: null,
    gender: 'male',
    marital_status: null,
    zhuz: null,
    ru: null,
    ata_line: null,
    tribe_branch: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    birth_surname: null,
  });

  assert.equal(relative.fullName, 'Петров Петр Петрович');
  assert.equal(getRelativeDisplayName(relative), 'Петров Петр Петрович');
});

test("Anna's father resolves in ATA-ANA via father_id only", () => {
  const annaFather = mockRelative('sf', 'Сидоров Сидор Сидорович', {
    gender: 'male',
    firstName: 'Сидор',
    middleName: 'Сидорович',
    currentSurname: 'Сидоров',
  });
  const anna = mockRelative('anna', 'Иванова Анна Петровна', {
    gender: 'female',
    fatherId: 'sf',
    spouseId: 'b',
  });
  const baurzhan = mockRelative('b', 'Иванов Иван', {
    gender: 'male',
    spouseId: 'anna',
  });

  const relatives = [anna, baurzhan, annaFather];
  const slots = resolveShezhireParentSlots(anna, relatives);

  assert.equal(slots.father.linkId, 'sf');
  assert.equal(slots.father.parent?.id, 'sf');
  assert.equal(getRelativeDisplayName(slots.father.parent!), 'Сидоров Сидор Сидорович');
});

test("Anna's father is connected and not unplaced or orphan", () => {
  const annaFather = mockRelative('sf', 'Сидоров Сидор', { gender: 'male' });
  const anna = mockRelative('anna', 'Иванова Анна', {
    gender: 'female',
    fatherId: 'sf',
    spouseId: 'b',
  });
  const baurzhan = mockRelative('b', 'Иванов Иван', { gender: 'male', spouseId: 'anna' });
  const relatives = [anna, baurzhan, annaFather];

  const graph = debugRootGraph(anna, relatives, { log: false });

  assert.equal(graph.parentSlots.father?.id, 'sf');
  assert.ok(graph.connectedIds.has('sf'));
  assert.ok(!graph.unplacedCandidates.some((person) => person.id === 'sf'));

  const orphans = findOrphanRelatives(relatives);
  assert.ok(!orphans.some((person) => person.id === 'sf'));
  assert.ok(isReferencedAsParent(annaFather, relatives));
});
