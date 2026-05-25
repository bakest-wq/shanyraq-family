import assert from 'node:assert/strict';
import test from 'node:test';

import type { Href } from 'expo-router';

import { APP_HOME_HREF, safeGoBack } from '@/utils/safe-navigation';

function createMockRouter(options: { canGoBack: boolean; backCalls?: number; replaceHref?: Href }) {
  let backCalls = 0;
  let replaceHref: Href | null = null;

  const router = {
    canGoBack: () => options.canGoBack,
    back: () => {
      backCalls += 1;
    },
    replace: (href: Href) => {
      replaceHref = href;
    },
  };

  return {
    router,
    get backCalls() {
      return backCalls;
    },
    get replaceHref() {
      return replaceHref;
    },
  };
}

test('safeGoBack calls back when history exists', () => {
  const mock = createMockRouter({ canGoBack: true });

  safeGoBack(mock.router);

  assert.equal(mock.backCalls, 1);
  assert.equal(mock.replaceHref, null);
});

test('safeGoBack replaces with home when stack is empty', () => {
  const mock = createMockRouter({ canGoBack: false });

  safeGoBack(mock.router);

  assert.equal(mock.backCalls, 0);
  assert.equal(mock.replaceHref, APP_HOME_HREF);
});

test('safeGoBack uses custom fallback when stack is empty', () => {
  const mock = createMockRouter({ canGoBack: false });
  const fallback = '/(tabs)/relatives' as Href;

  safeGoBack(mock.router, { fallback });

  assert.equal(mock.replaceHref, fallback);
});
