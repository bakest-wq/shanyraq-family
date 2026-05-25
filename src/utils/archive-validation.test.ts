import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeMemoryType } from '@/types/archive';
import { hasMemoryFormErrors, validateMemoryForm } from '@/utils/archive-validation';

test('normalizeMemoryType maps legacy categories to photo, story, note', () => {
  assert.equal(normalizeMemoryType('photo'), 'photo');
  assert.equal(normalizeMemoryType('story'), 'story');
  assert.equal(normalizeMemoryType('note'), 'note');
  assert.equal(normalizeMemoryType('stories'), 'story');
  assert.equal(normalizeMemoryType('memorial'), 'story');
  assert.equal(normalizeMemoryType('advice'), 'note');
  assert.equal(normalizeMemoryType('voice'), 'note');
  assert.equal(normalizeMemoryType('document'), 'note');
  assert.equal(normalizeMemoryType('documents'), 'note');
});

test('validateMemoryForm requires photo for photo memories', () => {
  const errors = validateMemoryForm({
    title: 'Сурет',
    relativeId: 'r1',
    relativeName: 'Айгүл',
    year: '2020',
    story: '',
    category: 'photo',
    pendingPhotoUri: null,
  });

  assert.equal(errors.photo, 'Фото таңдаңыз');
  assert.equal(hasMemoryFormErrors(errors), true);
});

test('validateMemoryForm requires story text for story memories', () => {
  const errors = validateMemoryForm({
    title: 'Естелік',
    relativeId: 'r1',
    relativeName: 'Айгүл',
    year: '1998',
    story: '',
    category: 'story',
  });

  assert.equal(errors.story, 'Естелік мәтінін жазыңыз');
});

test('validateMemoryForm accepts note with short text', () => {
  const errors = validateMemoryForm({
    title: 'Жазба',
    relativeId: 'r1',
    relativeName: 'Айгүл',
    year: '',
    story: 'Қысқа еске салу',
    category: 'note',
  });

  assert.deepEqual(errors, {});
  assert.equal(hasMemoryFormErrors(errors), false);
});
