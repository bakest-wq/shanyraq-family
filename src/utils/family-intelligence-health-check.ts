import { kk, FAMILY_LANGUAGE } from '@/content/family-language';

/** Calm entry subtitle for management — never technical. */
export function formatHealthCheckEntrySubtitle(issueCount: number): string {
  if (issueCount <= 0) {
    return kk(FAMILY_LANGUAGE.health.entryAllClear);
  }

  return kk(FAMILY_LANGUAGE.health.entryNeedsReview).replace('{count}', String(issueCount));
}
