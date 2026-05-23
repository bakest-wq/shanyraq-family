import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canDeleteFamilyData,
  canEditFamilyData,
  canSuggestFamilyEdits,
  isFamilyOwner,
} from '@/utils/family-permissions';

test('owner can edit and delete', () => {
  assert.equal(isFamilyOwner('owner'), true);
  assert.equal(canEditFamilyData('owner'), true);
  assert.equal(canDeleteFamilyData('owner'), true);
  assert.equal(canSuggestFamilyEdits('owner'), false);
});

test('member can view and suggest but not mutate', () => {
  assert.equal(isFamilyOwner('member'), false);
  assert.equal(canEditFamilyData('member'), false);
  assert.equal(canDeleteFamilyData('member'), false);
  assert.equal(canSuggestFamilyEdits('member'), true);
});
