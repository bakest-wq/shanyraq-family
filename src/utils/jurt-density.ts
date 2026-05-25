import type { OzJurtSubgroupId } from '@/utils/oz-jurt-subgroups';
import type { KayinJurtSubgroupId } from '@/utils/kayin-jurt-subgroups';

/** Side-level groups outside öz/kayin subgroups (flat fallback when subgroups are absent). */
export type JurtSideDensityGroupId = 'oz' | 'nagashy' | 'kayin';

export type JurtDensityGroupId = OzJurtSubgroupId | KayinJurtSubgroupId | JurtSideDensityGroupId;

export type JurtDensityTier = 'primary' | 'secondary' | 'extended';

/** Closest relatives — always visible in Үш жұрт. */
const ALWAYS_EXPANDED_GROUPS = new Set<JurtDensityGroupId>(['siblings']);

/** Collapsed until the user opens them (secondary + extended). */
const COLLAPSED_BY_DEFAULT_GROUPS = new Set<JurtDensityGroupId>([
  'kelinler',
  'jengeler',
  'jezdelder',
  'brotherChildren',
  'paternalRelatives',
  'niecesNephews',
  'kuda',
  'kayin_ata_ene',
  'kayin_siblings',
  'oz',
  'nagashy',
  'kayin',
]);

const GROUP_TIER: Record<JurtDensityGroupId, JurtDensityTier> = {
  siblings: 'primary',
  kelinler: 'secondary',
  jengeler: 'secondary',
  jezdelder: 'secondary',
  brotherChildren: 'extended',
  niecesNephews: 'extended',
  paternalRelatives: 'extended',
  kuda: 'extended',
  kayin_ata_ene: 'secondary',
  kayin_siblings: 'secondary',
  oz: 'extended',
  nagashy: 'extended',
  kayin: 'extended',
};

const sessionExpandState = new Map<string, boolean>();

export function buildJurtGroupSessionKey(rootPersonId: string, groupId: JurtDensityGroupId): string {
  return `${rootPersonId}:${groupId}`;
}

export function isJurtGroupAlwaysExpanded(groupId: JurtDensityGroupId): boolean {
  return ALWAYS_EXPANDED_GROUPS.has(groupId);
}

export function isJurtGroupCollapsedByDefault(groupId: JurtDensityGroupId): boolean {
  return COLLAPSED_BY_DEFAULT_GROUPS.has(groupId);
}

export function getDefaultJurtGroupExpanded(groupId: JurtDensityGroupId): boolean {
  if (isJurtGroupAlwaysExpanded(groupId)) {
    return true;
  }

  if (isJurtGroupCollapsedByDefault(groupId)) {
    return false;
  }

  return false;
}

export function isJurtGroupCollapsible(groupId: JurtDensityGroupId): boolean {
  return !isJurtGroupAlwaysExpanded(groupId);
}

export function getJurtGroupDensityTier(groupId: JurtDensityGroupId): JurtDensityTier {
  return GROUP_TIER[groupId];
}

export function readJurtGroupExpanded(sessionKey: string, defaultExpanded: boolean): boolean {
  const stored = sessionExpandState.get(sessionKey);
  return stored ?? defaultExpanded;
}

export function writeJurtGroupExpanded(sessionKey: string, expanded: boolean): void {
  sessionExpandState.set(sessionKey, expanded);
}

export function clearJurtExpandSession(): void {
  sessionExpandState.clear();
}
