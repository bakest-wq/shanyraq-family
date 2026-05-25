import type { Relative } from '@/types/relative';

import {
  runShezhireHealthCheck,
  type ShezhireHealthCheckReport,
} from '@/services/graph-integrity.service';

/** Full-family intelligence report — quiet graph quality protection. */
export type FamilyIntelligenceHealthReport = ShezhireHealthCheckReport;

/** Scan the family graph for link quality issues. */
export function runFamilyIntelligenceHealthCheck(
  allRelatives: Relative[],
): FamilyIntelligenceHealthReport {
  return runShezhireHealthCheck(allRelatives);
}
