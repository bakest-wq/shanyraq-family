import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import { runShezhireHealthCheck } from '@/services/graph-integrity.service';
import {
  buildHealthCheckIssueSections,
  countHealthCheckIssues,
} from '@/utils/health-check-issues';

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

test('buildHealthCheckIssueSections groups into five calm sections', () => {
  const child = mockRelative('child', 'Бала', { fatherId: 'missing-father' });
  const left = mockRelative('left', 'Айгуль', { birthday: '1990-01-01', phone: '+77001112233' });
  const right = mockRelative('right', 'Айгуль', { birthday: '1990-01-01', phone: '+77001112233' });
  const unplaced = mockRelative('solo', 'Жалғыз');
  const relatives = [child, left, right, unplaced];
  const report = runShezhireHealthCheck(relatives);
  const sections = buildHealthCheckIssueSections(report, relatives, [unplaced]);

  assert.ok(sections.brokenLinks.length >= 1);
  assert.ok(sections.missingParents.length >= 1);
  assert.ok(sections.duplicateCandidates.length >= 1);
  assert.equal(sections.spouseMismatch.length, 0);
  assert.ok(countHealthCheckIssues(sections) >= 3);
});

test('healthy tree yields zero issues in all sections', () => {
  const father = mockRelative('f', 'Әke', { gender: 'male' });
  const child = mockRelative('c', 'Bala', { gender: 'male', fatherId: 'f' });
  const relatives = [father, child];
  const report = runShezhireHealthCheck(relatives);
  const sections = buildHealthCheckIssueSections(report, relatives, []);

  assert.equal(countHealthCheckIssues(sections), 0);
  assert.equal(sections.brokenLinks.length, 0);
  assert.equal(sections.duplicateCandidates.length, 0);
  assert.equal(sections.missingParents.length, 0);
  assert.equal(sections.spouseMismatch.length, 0);
  assert.equal(sections.circularRelations.length, 0);
});

test('same parent pair surfaces in broken links section', () => {
  const person = mockRelative('p', 'Адам', {
    gender: 'male',
    fatherId: 'same',
    motherId: 'same',
  });
  const same = mockRelative('same', 'Бір', { gender: 'female' });
  const relatives = [person, same];

  const report = runShezhireHealthCheck(relatives);
  const sections = buildHealthCheckIssueSections(report, relatives, []);

  assert.ok(sections.brokenLinks.length >= 1);
  assert.match(sections.brokenLinks[0]?.explanation ?? '', /бір адам/i);
});

test('one-sided spouse link goes to spouse mismatch when repairable', () => {
  const left = mockRelative('a', 'Ayna', { gender: 'female', spouseId: 'b' });
  const right = mockRelative('b', 'Bolat', { gender: 'male' });
  const relatives = [left, right];
  const report = runShezhireHealthCheck(relatives);
  const sections = buildHealthCheckIssueSections(report, relatives, []);

  assert.ok(sections.spouseMismatch.length >= 1);
  assert.match(sections.spouseMismatch[0]?.explanation ?? '', /сәйкес/i);
});
