import assert from 'node:assert/strict';
import test from 'node:test';

import { FAMILY_BACKUP_VERSION } from '@/types/family-backup';
import {
  buildBackupFileName,
  validateFamilyBackup,
} from '@/utils/family-backup-format';
import { escapeHtml } from '@/utils/family-backup-html';

test('validateFamilyBackup accepts a minimal valid bundle', () => {
  const result = validateFamilyBackup({
    version: FAMILY_BACKUP_VERSION,
    exportedAt: '2026-05-23T10:00:00.000Z',
    familyId: 'fam-1',
    familyName: 'Нұр отбасы',
    relatives: [],
    memories: [],
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.bundle.familyName, 'Нұр отбасы');
    assert.deepEqual(result.bundle.members, []);
  }
});

test('validateFamilyBackup rejects unsupported version', () => {
  const result = validateFamilyBackup({
    version: 99,
    familyId: 'fam-1',
    relatives: [],
    memories: [],
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /нұсқасы/);
  }
});

test('validateFamilyBackup rejects missing relatives array', () => {
  const result = validateFamilyBackup({
    version: FAMILY_BACKUP_VERSION,
    familyId: 'fam-1',
  });

  assert.equal(result.ok, false);
});

test('buildBackupFileName creates a safe file stem', () => {
  const name = buildBackupFileName('Нұр отбасы!', '2026-05-23T10:00:00.000Z');
  assert.match(name, /^shanyraq-/);
  assert.match(name, /\.json$/);
});

test('escapeHtml sanitizes dangerous characters', () => {
  assert.equal(escapeHtml('<script>&"'), '&lt;script&gt;&amp;&quot;');
});
