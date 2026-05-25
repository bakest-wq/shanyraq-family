import { analyzeKinship } from '@/services/kinship/kinship.service';
import { getKinshipLabFamily } from '@/services/kinship/lab/kinship-lab.fixtures';
import type {
  KinshipLabCategory,
  KinshipLabFailure,
  KinshipLabMatrixRow,
  KinshipLabReport,
  KinshipLabRootSwitchRow,
} from '@/services/kinship/lab/kinship-lab.types';
import {
  KINSHIP_LAB_MATRIX,
  KINSHIP_LAB_ROOT_SWITCH_MATRIX,
} from '@/services/kinship/lab/kinship-lab.matrix';

const CONFIDENCE_RANK = {
  low: 0,
  medium: 1,
  high: 2,
} as const;

function confidenceAtLeast(
  actual: keyof typeof CONFIDENCE_RANK,
  minimum: keyof typeof CONFIDENCE_RANK,
): boolean {
  return CONFIDENCE_RANK[actual] >= CONFIDENCE_RANK[minimum];
}

function runMatrixRow(row: KinshipLabMatrixRow): KinshipLabFailure | null {
  const family = getKinshipLabFamily(row.familyId);
  const root = family.members[row.rootKey];
  const target = family.members[row.targetKey];

  if (!root || !target) {
    return {
      rowId: row.id,
      message: `Missing fixture member: root=${row.rootKey}, target=${row.targetKey}`,
    };
  }

  const intel = analyzeKinship(root, target, family.relatives);

  if (intel.label.type !== row.expectedType) {
    return {
      rowId: row.id,
      message: `Expected type ${row.expectedType}, got ${intel.label.type}${row.note ? ` (${row.note})` : ''}`,
    };
  }

  if (row.expectedJurt && intel.jurtGroup !== row.expectedJurt) {
    return {
      rowId: row.id,
      message: `Expected jurt ${row.expectedJurt}, got ${intel.jurtGroup}`,
    };
  }

  if (row.cardLinePattern && !row.cardLinePattern.test(intel.cardLine)) {
    return {
      rowId: row.id,
      message: `Card line "${intel.cardLine}" did not match ${row.cardLinePattern}`,
    };
  }

  if (row.explanationPattern && !row.explanationPattern.test(intel.explanation.summary)) {
    return {
      rowId: row.id,
      message: `Explanation did not match ${row.explanationPattern}`,
    };
  }

  if (row.minConfidence && !confidenceAtLeast(intel.confidence, row.minConfidence)) {
    return {
      rowId: row.id,
      message: `Expected confidence >= ${row.minConfidence}, got ${intel.confidence}`,
    };
  }

  return null;
}

function runRootSwitchRow(row: KinshipLabRootSwitchRow): KinshipLabFailure[] {
  const family = getKinshipLabFamily(row.familyId);
  const target = family.members[row.targetKey];

  if (!target) {
    return [
      {
        rowId: row.id,
        message: `Missing target fixture member: ${row.targetKey}`,
      },
    ];
  }

  const failures: KinshipLabFailure[] = [];

  for (const testCase of row.cases) {
    const root = family.members[testCase.rootKey];
    if (!root) {
      failures.push({
        rowId: `${row.id}:${testCase.rootKey}`,
        message: `Missing root fixture member: ${testCase.rootKey}`,
      });
      continue;
    }

    const intel = analyzeKinship(root, target, family.relatives);

    if (intel.label.type !== testCase.expectedType) {
      failures.push({
        rowId: `${row.id}:${testCase.rootKey}`,
        message: `Root ${testCase.rootKey} → ${row.targetKey}: expected ${testCase.expectedType}, got ${intel.label.type}`,
      });
    }

    if (testCase.expectedJurt && intel.jurtGroup !== testCase.expectedJurt) {
      failures.push({
        rowId: `${row.id}:${testCase.rootKey}:jurt`,
        message: `Root ${testCase.rootKey} → ${row.targetKey}: expected jurt ${testCase.expectedJurt}, got ${intel.jurtGroup}`,
      });
    }
  }

  return failures;
}

export function runKinshipLabMatrix(
  rows: KinshipLabMatrixRow[] = KINSHIP_LAB_MATRIX,
): KinshipLabReport {
  const failures: KinshipLabFailure[] = [];

  for (const row of rows) {
    const failure = runMatrixRow(row);
    if (failure) {
      failures.push(failure);
    }
  }

  return {
    passed: rows.length - failures.length,
    failed: failures.length,
    failures,
  };
}

export function runKinshipLabMatrixByCategory(category: KinshipLabCategory): KinshipLabReport {
  return runKinshipLabMatrix(KINSHIP_LAB_MATRIX.filter((row) => row.category === category));
}

export function runKinshipLabRootSwitching(
  rows: KinshipLabRootSwitchRow[] = KINSHIP_LAB_ROOT_SWITCH_MATRIX,
): KinshipLabReport {
  const failures = rows.flatMap((row) => runRootSwitchRow(row));

  const caseCount = rows.reduce((total, row) => total + row.cases.length, 0);

  return {
    passed: caseCount - failures.length,
    failed: failures.length,
    failures,
  };
}

export function runKinshipLab(): KinshipLabReport {
  const matrix = runKinshipLabMatrix();
  const rootSwitch = runKinshipLabRootSwitching();

  return {
    passed: matrix.passed + rootSwitch.passed,
    failed: matrix.failed + rootSwitch.failed,
    failures: [...matrix.failures, ...rootSwitch.failures],
  };
}

export function assertKinshipLabReport(report: KinshipLabReport, scope: string): void {
  if (report.failed === 0) {
    return;
  }

  const details = report.failures
    .map((failure) => `- ${failure.rowId}: ${failure.message}`)
    .join('\n');

  throw new Error(`${scope} failed (${report.failed}):\n${details}`);
}
