import assert from 'node:assert/strict';

import {
  FAMILY_LANGUAGE,
  familyText,
  familyTextCount,
  familyTextWithName,
} from '@/content/family-text';

function testFamilyTextReturnsKazakhFirst() {
  assert.equal(familyText(FAMILY_LANGUAGE.common.close), 'Жабу');
  assert.equal(familyText(FAMILY_LANGUAGE.empty.relatives), FAMILY_LANGUAGE.empty.relatives.kk);
}

function testFamilyTextWithName() {
  assert.equal(
    familyTextWithName(FAMILY_LANGUAGE.home.greetingPersonalLine, 'Айгерим'),
    'Айгерим, бүгін де отбасы орны сізбен',
  );
}

function testFamilyTextCount() {
  assert.equal(familyTextCount(FAMILY_LANGUAGE.home.summaryRelatives, 5), '5 туыс');
}

function testBackupCopyAvoidsTechnicalTerms() {
  const json = familyText(FAMILY_LANGUAGE.backup.exportJson);
  const restore = familyText(FAMILY_LANGUAGE.backup.restoreHint);
  assert.doesNotMatch(json, /JSON/i);
  assert.doesNotMatch(restore, /JSON/i);
  assert.match(json, /файл/);
}

testFamilyTextReturnsKazakhFirst();
testFamilyTextWithName();
testFamilyTextCount();
testBackupCopyAvoidsTechnicalTerms();

console.log('family-text.test.ts: all tests passed');
