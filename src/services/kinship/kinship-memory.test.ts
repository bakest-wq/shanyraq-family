import assert from 'node:assert/strict';
import test from 'node:test';

import type { FamilyMemory } from '@/types/archive';
import type { Relative } from '@/types/relative';
import {
  buildKinshipMemoryLine,
  buildKinshipMemorySnapshot,
} from '@/services/kinship/kinship-memory';

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
    notes: options.notes,
  };
}

function buildNagashyAtaFamily() {
  const nagashyAta = mockRelative('gf', 'Нұрлан', {
    gender: 'male',
    birthdayYear: 1945,
  });
  const mother = mockRelative('m', 'Айгүл', {
    gender: 'female',
    fatherId: 'gf',
    birthdayYear: 1970,
  });
  const me = mockRelative('me', 'Арман', {
    gender: 'male',
    motherId: 'm',
    birthdayYear: 1995,
  });

  return { nagashyAta, mother, me, relatives: [nagashyAta, mother, me] };
}

test('nagashy ata with elder age gap gets childhood memory line', () => {
  const { me, nagashyAta, relatives } = buildNagashyAtaFamily();

  const snapshot = buildKinshipMemorySnapshot(me, nagashyAta, relatives);

  assert.equal(snapshot.confidence, 'high');
  assert.match(snapshot.line ?? '', /балалық/i);
  assert.match(snapshot.line ?? '', /нағашы ата/i);
  assert.equal(snapshot.tone, 'warm');
  assert.ok(snapshot.signals.includes('childhood_together'));
});

test('childhood memory line matches user-facing example shape', () => {
  const { me, nagashyAta, relatives } = buildNagashyAtaFamily();

  const line = buildKinshipMemoryLine(me, nagashyAta, relatives);

  assert.equal(line, 'Балалық шағыңызда бірге тұрған нағашы ата');
});

test('low confidence suppresses precise memory line', () => {
  const root = mockRelative('r', 'Бауыржан', { gender: 'male', birthdayYear: 1990 });
  const target = mockRelative('t', 'Белгісіз', { gender: 'male' });

  const snapshot = buildKinshipMemorySnapshot(root, target, [root, target]);

  assert.equal(snapshot.confidence, 'low');
  assert.equal(snapshot.line, null);
});

test('deceased relative gets memorial tone', () => {
  const { me, nagashyAta, relatives } = buildNagashyAtaFamily();
  nagashyAta.isDeceased = true;

  const snapshot = buildKinshipMemorySnapshot(me, nagashyAta, relatives);

  assert.equal(snapshot.tone, 'memorial');
  assert.match(snapshot.line ?? '', /есте/i);
  assert.match(snapshot.line ?? '', /нағашы ата/i);
});

test('linked archive story produces story tone', () => {
  const { me, nagashyAta, relatives } = buildNagashyAtaFamily();
  const memories: FamilyMemory[] = [
    {
      id: 'mem-1',
      title: 'Жазғы демалыс',
      relativeId: 'gf',
      relativeName: nagashyAta.firstName,
      year: '2003',
      story: 'Ауылда бірге отырдық.',
      category: 'story',
      hasPhoto: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  const snapshot = buildKinshipMemorySnapshot(me, nagashyAta, relatives, { memories });

  assert.equal(snapshot.tone, 'story');
  assert.match(snapshot.line ?? '', /естел/i);
  assert.deepEqual(snapshot.memoryIds, ['mem-1']);
});

test('notes with childhood hint produce warm memory line', () => {
  const father = mockRelative('f', 'Нұрлан', {
    gender: 'male',
    birthdayYear: 1965,
    notes: 'Балалық шағымызда бірге тұрдық.',
  });
  const me = mockRelative('me', 'Арман', {
    gender: 'male',
    fatherId: 'f',
    birthdayYear: 1995,
  });

  const snapshot = buildKinshipMemorySnapshot(me, father, [me, father]);

  assert.match(snapshot.line ?? '', /балалық/i);
  assert.equal(snapshot.source, 'notes');
});

test('self relative returns empty memory snapshot', () => {
  const me = mockRelative('me', 'Арман', { gender: 'male' });

  const snapshot = buildKinshipMemorySnapshot(me, me, [me]);

  assert.equal(snapshot.line, null);
  assert.equal(snapshot.source, 'none');
});
