import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import {
  findShortestRelationshipPath,
  formatInternalRelationshipPathTrace,
  getRelationshipPathHopCount,
  toKinshipPathSteps,
} from '@/services/kinship/relationship-path.engine';
import { getKinshipPath } from '@/services/kinship/kinship-path';
import { scoreKinshipConfidence } from '@/services/kinship/kinship-confidence';
import { getKinshipLabel } from '@/services/kinship/kinship.service';

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
    relationship: 'Туысы',
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

function buildBauyrzhanFamily() {
  const father = mockRelative('f', 'Ғалымжан', { gender: 'male' });
  const mother = mockRelative('m', 'Фирдаус', { gender: 'female', spouseId: 'f' });
  const bauyrzhan = mockRelative('b', 'Бауыржан', {
    gender: 'male',
    fatherId: 'f',
    motherId: 'm',
    spouseId: 'an',
  });
  const anna = mockRelative('an', 'Анна', {
    gender: 'female',
    spouseId: 'b',
    fatherId: 'af',
  });
  const annaFather = mockRelative('af', 'Абдулрашид', { gender: 'male' });

  father.spouseId = 'm';
  mother.spouseId = 'f';

  return { father, mother, bauyrzhan, anna, annaFather };
}

test('shortest path: Baurzhan → spouse Anna → father Abdurashid', () => {
  const { bauyrzhan, anna, annaFather, father, mother } = buildBauyrzhanFamily();
  const relatives = [father, mother, bauyrzhan, anna, annaFather];

  const result = findShortestRelationshipPath(bauyrzhan, annaFather, relatives);

  assert.equal(result.resolved, true);
  assert.equal(result.hopCount, 2);
  assert.equal(result.steps[0]?.person.id, 'an');
  assert.match(result.steps[0]?.stepLabel ?? '', /жұбай/i);
  assert.equal(result.steps[1]?.person.id, 'af');
  assert.match(result.steps[1]?.stepLabel ?? '', /әк/i);

  const trace = formatInternalRelationshipPathTrace(bauyrzhan, result);
  assert.match(trace, /Бауыржан/i);
  assert.match(trace, /жұбайы.*Анна/i);
  assert.match(trace, /әк.*Абдулрашид/i);
});

test('BFS loop protection does not revisit nodes on cyclic parent graph', () => {
  const a = mockRelative('a', 'A', { gender: 'male', fatherId: 'b' });
  const b = mockRelative('b', 'B', { gender: 'male', fatherId: 'a' });
  const c = mockRelative('c', 'C', { gender: 'male' });

  const result = findShortestRelationshipPath(c, a, [a, b, c]);

  assert.equal(result.resolved, false);
  assert.equal(result.hopCount, 0);
});

test('getKinshipPath delegates to relationship path engine', () => {
  const { bauyrzhan, anna, annaFather, father, mother } = buildBauyrzhanFamily();
  const relatives = [father, mother, bauyrzhan, anna, annaFather];

  const path = getKinshipPath(bauyrzhan, annaFather, relatives);
  const engine = findShortestRelationshipPath(bauyrzhan, annaFather, relatives);

  assert.deepEqual(path, toKinshipPathSteps(engine));
});

test('kayin ata has structural path support for confidence scoring', () => {
  const { bauyrzhan, annaFather, father, mother, anna } = buildBauyrzhanFamily();
  const relatives = [father, mother, bauyrzhan, anna, annaFather];

  const label = getKinshipLabel(bauyrzhan, annaFather, relatives);
  assert.equal(label.type, 'kayin_ata');
  assert.ok(getRelationshipPathHopCount(bauyrzhan, annaFather, relatives) >= 2);
  assert.equal(scoreKinshipConfidence(label), 'high');
});

test('disconnected relatives yield unresolved path', () => {
  const root = mockRelative('r', 'Бауыржан', { gender: 'male' });
  const stranger = mockRelative('s', 'Бейтаныс', { gender: 'male' });

  const result = findShortestRelationshipPath(root, stranger, [root, stranger]);

  assert.equal(result.resolved, false);
  assert.equal(getKinshipPath(root, stranger, [root, stranger]).length, 0);
});
