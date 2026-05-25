import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import { runFamilyIntelligenceHealthCheck } from '@/services/family-intelligence-health-check.service';
import { runShezhireHealthCheck } from '@/services/graph-integrity.service';
import { formatHealthCheckEntrySubtitle } from '@/utils/family-intelligence-health-check';
import { buildHealthCheckIssueSections } from '@/utils/health-check-issues';

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

test('runFamilyIntelligenceHealthCheck delegates to graph integrity scan', () => {
  const child = mockRelative('c', 'Бала', { fatherId: 'missing' });

  const report = runFamilyIntelligenceHealthCheck([child]);
  const baseline = runShezhireHealthCheck([child]);

  assert.deepEqual(report.brokenParentLinks, baseline.brokenParentLinks);
  assert.ok(report.brokenParentLinks.length >= 1);
});

test('formatHealthCheckEntrySubtitle stays calm and non-technical', () => {
  assert.match(formatHealthCheckEntrySubtitle(0), /дұрыс/i);
  assert.match(formatHealthCheckEntrySubtitle(3), /3/);
  assert.doesNotMatch(formatHealthCheckEntrySubtitle(3), /broken|cycle|orphan/i);
});

test('same parent pair surfaces in broken links section', () => {
  const person = mockRelative('p', 'Адам', {
    gender: 'male',
    fatherId: 'same',
    motherId: 'same',
  });
  const same = mockRelative('same', 'Бір', { gender: 'female' });
  const relatives = [person, same];

  const report = runFamilyIntelligenceHealthCheck(relatives);
  const sections = buildHealthCheckIssueSections(report, relatives, []);

  assert.ok(sections.brokenLinks.length >= 1);
  assert.match(sections.brokenLinks[0]?.explanation ?? '', /бір адам/i);
});
