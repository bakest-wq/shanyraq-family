import assert from 'node:assert/strict';
import test from 'node:test';

import { CALM_UX } from '@/constants/calm-ux';
import { createCalmThemeTokens } from '@/utils/calm-theme';

test('calm theme exposes soft spacing and touch targets', () => {
  const standard = createCalmThemeTokens(false);
  const elder = createCalmThemeTokens(true);

  assert.ok(standard.screenGap >= standard.sectionGap);
  assert.ok(elder.minTouchHeight >= standard.minTouchHeight);
  assert.equal(elder.maxPrimaryActions, CALM_UX.elderMaxPrimaryActions);
});

test('calm section copy stays non-technical', () => {
  const copy = Object.values(CALM_UX.sections)
    .map((section) => `${section.title} ${section.subtitle}`)
    .join(' ');

  assert.doesNotMatch(copy, /dashboard|graph|BFS|API|debug/i);
});
