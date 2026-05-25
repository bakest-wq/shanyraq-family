import type { Relative } from '@/types/relative';

/** Fields that affect kinship classification and structural paths. */
export type KinshipStructuralFields = Pick<
  Relative,
  'id' | 'fatherId' | 'motherId' | 'spouseId' | 'gender' | 'birthdayYear'
>;

/** Extra visibility field for үш жұрт tree grouping. */
export type JurtGraphFields = KinshipStructuralFields & Pick<Relative, 'isDeceased'>;

function normalizeLinkId(value: string | undefined): string {
  return value?.trim() ?? '';
}

function serializeKinshipSlice(relative: Relative): string {
  return [
    relative.id,
    normalizeLinkId(relative.fatherId),
    normalizeLinkId(relative.motherId),
    normalizeLinkId(relative.spouseId),
    relative.gender ?? '',
    relative.birthdayYear ?? '',
  ].join('|');
}

function serializeJurtSlice(relative: Relative): string {
  return `${serializeKinshipSlice(relative)}|${relative.isDeceased ? '1' : '0'}`;
}

function buildFingerprint(
  relatives: Relative[],
  serialize: (relative: Relative) => string,
): string {
  return relatives
    .map(serialize)
    .sort((left, right) => left.localeCompare(right))
    .join('\n');
}

/** Fingerprint for labels, paths, explanations, and pair-level үш жұрт. */
export function buildKinshipStructuralFingerprint(relatives: Relative[]): string {
  return buildFingerprint(relatives, serializeKinshipSlice);
}

/** Fingerprint for full jurt tree — includes living/deceased visibility. */
export function buildJurtGraphFingerprint(relatives: Relative[]): string {
  return buildFingerprint(relatives, serializeJurtSlice);
}

export function hashExcludeIds(excludeIds: Set<string>): string {
  return [...excludeIds].sort().join(',') || '_';
}

/** True when any kinship-structural edge or gender changed between snapshots. */
export function hasStructuralKinshipChange(
  before: Relative[],
  after: Relative[],
): boolean {
  return buildKinshipStructuralFingerprint(before) !== buildKinshipStructuralFingerprint(after);
}

/** True when jurt tree membership could change (structural or deceased flag). */
export function hasJurtGraphChange(before: Relative[], after: Relative[]): boolean {
  return buildJurtGraphFingerprint(before) !== buildJurtGraphFingerprint(after);
}
