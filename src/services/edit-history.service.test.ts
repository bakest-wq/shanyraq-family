import assert from 'node:assert/strict';

import { canRestoreEditEvent } from '@/utils/edit-history-restore';
import type { EditEvent } from '@/types/edit-history';
import { summarizeRelativeChanges } from '@/utils/edit-history-snapshot';

function mockEvent(overrides: Partial<EditEvent> = {}): EditEvent {
  return {
    id: 'e1',
    familyId: 'fam-1',
    entityType: 'relative',
    entityId: 'r1',
    entityLabel: 'Айгүл',
    action: 'update',
    actor: { displayName: 'Бауыржан' },
    at: new Date().toISOString(),
    summary: 'test',
    before: {
      fullName: 'Айгүл',
      displayName: 'Айгүл',
      relationship: 'Мен',
      birthday: '1990-01-01',
      phone: '',
      isDeceased: false,
    },
    ...overrides,
  };
}

function testCanRestoreRelativeUpdate() {
  assert.equal(canRestoreEditEvent(mockEvent()), true);
}

function testCannotRestoreRelativeDelete() {
  assert.equal(
    canRestoreEditEvent(mockEvent({ action: 'delete', before: undefined })),
    false,
  );
}

function testCanRestoreMemoryDelete() {
  assert.equal(
    canRestoreEditEvent(
      mockEvent({
        entityType: 'memory',
        action: 'delete',
        before: {
          id: 'm1',
          title: 'Естелік',
          relativeId: null,
          relativeName: '',
          year: '2020',
          story: '',
          category: 'story',
          hasPhoto: false,
          createdAt: new Date().toISOString(),
        },
      }),
    ),
    true,
  );
}

function testSummarizeRelativeChanges() {
  const summary = summarizeRelativeChanges(
    {
      fullName: 'Айгül',
      displayName: 'Айgül',
      relationship: 'Мен',
      birthday: '1990-01-01',
      phone: '',
      isDeceased: false,
    },
    {
      fullName: 'Айгерim',
      displayName: 'Айgül',
      relationship: 'Мен',
      birthday: '1990-01-01',
      phone: '',
      isDeceased: false,
    },
  );

  assert.match(summary, /Аты/);
}

testCanRestoreRelativeUpdate();
testCannotRestoreRelativeDelete();
testCanRestoreMemoryDelete();
testSummarizeRelativeChanges();

console.log('edit-history.service.test.ts: all tests passed');
