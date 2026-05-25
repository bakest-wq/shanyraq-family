import { useMemo } from 'react';

import { useShezhireHealthCheck } from '@/hooks/useShezhireHealthCheck';
import { useRelativesContext } from '@/providers/RelativesProvider';
import type { FamilyIntelligenceHealthReport } from '@/services/family-intelligence-health-check.service';
import {
  buildHealthCheckIssueSections,
  countHealthCheckIssues,
  countRepairableIssues,
  type HealthCheckIssueSections,
} from '@/utils/health-check-issues';

export type FamilyIntelligenceHealthSnapshot = {
  sections: HealthCheckIssueSections;
  issueCount: number;
  repairableCount: number;
  isHealthy: boolean;
};

/** Health-check hook with pre-built issue sections for UI entry points. */
export function useFamilyIntelligenceHealthCheck() {
  const { relatives } = useRelativesContext();
  const base = useShezhireHealthCheck();

  const sections = useMemo(
    () => buildHealthCheckIssueSections(base.report, relatives, base.unplacedRelatives),
    [base.report, base.unplacedRelatives, relatives],
  );

  const issueCount = useMemo(() => countHealthCheckIssues(sections), [sections]);
  const repairableCount = useMemo(() => countRepairableIssues(base.report), [base.report]);

  return {
    ...base,
    report: base.report as FamilyIntelligenceHealthReport,
    sections,
    issueCount,
    repairableCount,
    isHealthy: issueCount === 0,
  };
}
