import assert from 'node:assert/strict';
import test from 'node:test';

import type { Relative } from '@/types/relative';
import { pickDefaultRootId } from '@/utils/focused-family-tree';
import { resolveMyRelative, resolveMyRelativeId } from '@/utils/current-user-relative';

function mockRelative(id: string, firstName: string, relationship = 'Туысы'): Relative {
  return {
    id,
    fullName: firstName,
    firstName,
    displayName: firstName,
    relationship,
    birthday: '',
    phone: '',
    avatarColor: '#2C4A3E',
    isDeceased: false,
  };
}

test('pickDefaultRootId prefers linked current user relative', () => {
  const me = mockRelative('me', 'Бауыржан', 'Мен');
  const other = mockRelative('other', 'Серік', 'Бала');
  other.fatherId = 'me';

  assert.equal(pickDefaultRootId([me, other], 'me'), 'me');
});

test('resolveMyRelative falls back to relationship anchor', () => {
  const me = mockRelative('me', 'Бауыржан', 'Мен');
  const other = mockRelative('other', 'Серік');

  assert.equal(resolveMyRelativeId([me, other], null), 'me');
  assert.equal(resolveMyRelative([me, other], 'missing')?.id, 'me');
});
