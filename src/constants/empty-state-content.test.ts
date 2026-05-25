import assert from 'node:assert/strict';

import { EMPTY_STATE_COPY } from '@/constants/empty-state-content';
import { EMPTY_STATE_PRESETS } from '@/constants/family-ux-content';
import { FAMILY_SEARCH_COPY } from '@/constants/family-search-content';
import { BIRTHDAY_UX } from '@/constants/birthday-content';
import { kk, FAMILY_LANGUAGE } from '@/content/family-language';

function testEmptyPresetsUseWarmKazakhCopy() {
  assert.match(EMPTY_STATE_PRESETS.relatives.title, /Шаңырақ/u);
  assert.match(EMPTY_STATE_PRESETS.relatives.subtitle, /Алғашқы/);
  assert.equal(EMPTY_STATE_PRESETS.relatives.actionLabel, kk(FAMILY_LANGUAGE.empty.relativesAction));
  assert.match(EMPTY_STATE_PRESETS.memoriesFiltered.title, /естелік/);
  assert.match(EMPTY_STATE_PRESETS.memorial.subtitle, /Марқұм/);
}

function testEmptyStateCopyMatchesLanguageSource() {
  assert.equal(EMPTY_STATE_COPY.startFirstRelative, kk(FAMILY_LANGUAGE.empty.startFirstRelative));
  assert.equal(EMPTY_STATE_COPY.searchNoMatch.title, kk(FAMILY_LANGUAGE.empty.searchNoMatch));
  assert.equal(FAMILY_SEARCH_COPY.noResultsTitle, kk(FAMILY_LANGUAGE.empty.searchNoMatch));
  assert.equal(BIRTHDAY_UX.emptyToday, kk(FAMILY_LANGUAGE.empty.birthdaysTodayEmpty));
}

function testOnboardingSubtitleIsKazakh() {
  assert.match(EMPTY_STATE_COPY.onboarding.subtitle, /қадам/);
  assert.match(EMPTY_STATE_COPY.onboarding.subtitle, /туыс/);
}

testEmptyPresetsUseWarmKazakhCopy();
testEmptyStateCopyMatchesLanguageSource();
testOnboardingSubtitleIsKazakh();

console.log('empty-state-content.test.ts: all tests passed');
