import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildJurtGroupSessionKey,
  clearJurtExpandSession,
  getDefaultJurtGroupExpanded,
  getJurtGroupDensityTier,
  isJurtGroupAlwaysExpanded,
  isJurtGroupCollapsible,
  readJurtGroupExpanded,
  writeJurtGroupExpanded,
} from '@/utils/jurt-density';

test('density: siblings always expanded and not collapsible', () => {
  assert.equal(isJurtGroupAlwaysExpanded('siblings'), true);
  assert.equal(isJurtGroupCollapsible('siblings'), false);
  assert.equal(getDefaultJurtGroupExpanded('siblings'), true);
  assert.equal(getJurtGroupDensityTier('siblings'), 'primary');
});

test('density: in-law groups are secondary and collapsed by default', () => {
  assert.equal(getJurtGroupDensityTier('kelinler'), 'secondary');
  assert.equal(getJurtGroupDensityTier('jengeler'), 'secondary');
  assert.equal(getJurtGroupDensityTier('jezdelder'), 'secondary');
  assert.equal(getDefaultJurtGroupExpanded('kelinler'), false);
  assert.equal(getDefaultJurtGroupExpanded('jengeler'), false);
  assert.equal(getDefaultJurtGroupExpanded('jezdelder'), false);
});

test('density: extended groups collapsed by default', () => {
  assert.equal(getDefaultJurtGroupExpanded('brotherChildren'), false);
  assert.equal(getDefaultJurtGroupExpanded('paternalRelatives'), false);
  assert.equal(getDefaultJurtGroupExpanded('niecesNephews'), false);
  assert.equal(getDefaultJurtGroupExpanded('kuda'), false);
  assert.equal(getJurtGroupDensityTier('brotherChildren'), 'extended');
  assert.equal(getJurtGroupDensityTier('kuda'), 'extended');
  assert.equal(getDefaultJurtGroupExpanded('oz'), false);
  assert.equal(getDefaultJurtGroupExpanded('nagashy'), false);
  assert.equal(getDefaultJurtGroupExpanded('kayin'), false);
});

test('density: kayin subgroups are secondary or extended and collapsed by default', () => {
  assert.equal(getJurtGroupDensityTier('kayin_ata_ene'), 'secondary');
  assert.equal(getJurtGroupDensityTier('kayin_siblings'), 'secondary');
  assert.equal(getDefaultJurtGroupExpanded('kayin_ata_ene'), false);
  assert.equal(getDefaultJurtGroupExpanded('kayin_siblings'), false);
});

test('density: session remembers expand state per root and group', () => {
  clearJurtExpandSession();

  const sessionKey = buildJurtGroupSessionKey('root-1', 'kayin');
  assert.equal(readJurtGroupExpanded(sessionKey, false), false);

  writeJurtGroupExpanded(sessionKey, true);
  assert.equal(readJurtGroupExpanded(sessionKey, false), true);

  const otherRootKey = buildJurtGroupSessionKey('root-2', 'kayin');
  assert.equal(readJurtGroupExpanded(otherRootKey, false), false);

  clearJurtExpandSession();
});
