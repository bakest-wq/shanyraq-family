import assert from 'node:assert/strict';
import test from 'node:test';

import { KINSHIP_LAB_CATEGORIES } from '@/services/kinship/lab/kinship-lab.types';
import { buildBauyrzhanLabFamily } from '@/services/kinship/lab/kinship-lab.fixtures';
import {
  getKinshipLabMatrixByCategory,
  KINSHIP_LAB_MATRIX,
} from '@/services/kinship/lab/kinship-lab.matrix';
import {
  assertKinshipLabReport,
  runKinshipLab,
  runKinshipLabMatrix,
  runKinshipLabMatrixByCategory,
  runKinshipLabRootSwitching,
} from '@/services/kinship/lab/kinship-lab.runner';

test('kinship lab fixtures build a connected family graph', () => {
  const family = buildBauyrzhanLabFamily();

  assert.ok(family.members.bauyrzhan);
  assert.ok(family.members.annaFather);
  assert.equal(family.relatives.length, Object.keys(family.members).length);
  assert.ok(family.relatives.some((relative) => relative.id === 'bole'));
});

test('kinship lab matrix covers all target categories', () => {
  for (const category of KINSHIP_LAB_CATEGORIES) {
    const rows = getKinshipLabMatrixByCategory(category);
    assert.ok(rows.length >= 1, `Missing lab matrix rows for ${category}`);
  }

  assert.equal(KINSHIP_LAB_MATRIX.length, 8);
});

for (const category of KINSHIP_LAB_CATEGORIES) {
  test(`kinship lab matrix: ${category}`, () => {
    const report = runKinshipLabMatrixByCategory(category);
    assertKinshipLabReport(report, `kinship lab ${category}`);
    assert.equal(report.failed, 0);
  });
}

test('kinship lab root switching recalculates relationship meaning', () => {
  const report = runKinshipLabRootSwitching();
  assertKinshipLabReport(report, 'kinship lab root switching');
  assert.equal(report.failed, 0);
});

test('kinship lab full regression sweep', () => {
  const report = runKinshipLab();
  assertKinshipLabReport(report, 'kinship lab full sweep');
  assert.ok(report.passed >= 14);
  assert.equal(report.failed, 0);
});
