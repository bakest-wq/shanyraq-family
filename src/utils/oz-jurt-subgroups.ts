import type { Relative } from '@/types/relative';
import { isCoreFamilyRelation } from '@/utils/core-family-relation';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import {
  formatDisplayLabel,
  resolveKinshipResult,
} from '@/services/kinship/kinship-labels';
import { classifyOzJurtSubgroupByPrimaryLabel } from '@/services/kinship/kinship-priority';
import type { KinshipResult } from '@/utils/kinship/types';
import { isBrotherChildKinshipType } from '@/services/kinship/age-aware-kinship';
import { getRelationshipPathHopCount } from '@/services/kinship/relationship-path.engine';
import { getEffectiveSpouse, getSiblings, isFemale, isMale } from '@/utils/kinship/graph';
import { sortRelativesBySmartPriority } from '@/services/relative-priority-sort';

export type OzJurtSubgroupId =
  | 'siblings'
  | 'kelinler'
  | 'jengeler'
  | 'jezdelder'
  | 'brotherChildren'
  | 'niecesNephews'
  | 'paternalRelatives'
  | 'kuda';

export type OzJurtRelativeEntry = {
  person: Relative;
  children: Relative[];
};

export type OzJurtSubgroup = {
  id: OzJurtSubgroupId;
  entries: OzJurtRelativeEntry[];
  extraRelatives: Relative[];
};

export const OZ_JURT_SUBGROUP_ORDER: OzJurtSubgroupId[] = [
  'siblings',
  'kelinler',
  'jengeler',
  'jezdelder',
  'brotherChildren',
  'kuda',
  'niecesNephews',
  'paternalRelatives',
];

const SIBLING_TYPES = new Set<KinshipResult['type']>([
  'aga',
  'ini',
  'apke',
  'singli',
  'sibling_neutral',
]);

function resolveOzJurtDisplayLabel(
  rootPerson: Relative,
  person: Relative,
  relatives: Relative[],
): string {
  const result = resolveKinshipResult(rootPerson, person, relatives);
  const structuralPathLength = getRelationshipPathHopCount(rootPerson, person, relatives);

  return formatDisplayLabel(result, structuralPathLength);
}

function classifySiblingInLawSubgroup(
  result: KinshipResult,
  person: Relative,
  displayLabel: string,
): OzJurtSubgroupId {
  const labelGroup = classifyOzJurtSubgroupByPrimaryLabel(displayLabel, person);
  if (labelGroup) {
    return labelGroup;
  }

  if (result.type === 'kelin' || displayLabel === 'Келін') {
    return 'kelinler';
  }

  if (result.type === 'jezde' || displayLabel === 'Жезде') {
    if (isFemale(person)) {
      return 'jengeler';
    }

    return 'jezdelder';
  }

  if (isMale(person)) {
    return 'jezdelder';
  }

  return 'jengeler';
}

const KUDA_TYPES = new Set<KinshipResult['type']>(['kuda', 'kudagi', 'kuda_neutral']);

function sortRelatives(
  rootPerson: Relative,
  relatives: Relative[],
  allRelatives: Relative[],
): Relative[] {
  return sortRelativesBySmartPriority(rootPerson, relatives, { allRelatives });
}

function sortEntries(
  rootPerson: Relative,
  entries: OzJurtRelativeEntry[],
  allRelatives: Relative[],
): void {
  const sortedPeople = sortRelativesBySmartPriority(
    rootPerson,
    entries.map((entry) => entry.person),
    { allRelatives },
  );
  const entryById = new Map(entries.map((entry) => [entry.person.id, entry]));
  entries.length = 0;
  for (const person of sortedPeople) {
    const entry = entryById.get(person.id);
    if (entry) {
      entries.push(entry);
    }
  }
}

function isLiving(relative: Relative): boolean {
  return !relative.isDeceased;
}

function isExcluded(relative: Relative, excludeIds: Set<string>): boolean {
  return [...excludeIds].some((id) => relativeLinkIdsMatch(id, relative.id));
}

function findChildrenOf(
  rootPerson: Relative,
  relative: Relative,
  relatives: Relative[],
): Relative[] {
  return sortRelatives(
    rootPerson,
    relatives.filter(
      (child) =>
        isLiving(child) &&
        (relativeLinkIdsMatch(child.fatherId, relative.id) ||
          relativeLinkIdsMatch(child.motherId, relative.id)),
    ),
    relatives,
  );
}

function createEmptyBuckets(): Record<
  OzJurtSubgroupId,
  { entries: OzJurtRelativeEntry[]; extraRelatives: Relative[]; seen: Set<string> }
> {
  return {
    siblings: { entries: [], extraRelatives: [], seen: new Set<string>() },
    kelinler: { entries: [], extraRelatives: [], seen: new Set<string>() },
    jengeler: { entries: [], extraRelatives: [], seen: new Set<string>() },
    jezdelder: { entries: [], extraRelatives: [], seen: new Set<string>() },
    brotherChildren: { entries: [], extraRelatives: [], seen: new Set<string>() },
    niecesNephews: { entries: [], extraRelatives: [], seen: new Set<string>() },
    paternalRelatives: { entries: [], extraRelatives: [], seen: new Set<string>() },
    kuda: { entries: [], extraRelatives: [], seen: new Set<string>() },
  };
}

export function classifyOzJurtSubgroup(
  result: KinshipResult,
  person?: Relative,
  displayLabel?: string,
): OzJurtSubgroupId {
  if (SIBLING_TYPES.has(result.type)) {
    return 'siblings';
  }

  const siblingInLawTypes = new Set<KinshipResult['type']>([
    'jenge',
    'brother_wife_neutral',
    'jezde',
    'kelin',
  ]);

  if (siblingInLawTypes.has(result.type)) {
    if (!person || !displayLabel) {
      return classifySiblingInLawSubgroup(result, person ?? ({ gender: undefined } as Relative), displayLabel ?? result.label.kazakh);
    }

    return classifySiblingInLawSubgroup(result, person, displayLabel);
  }

  if (KUDA_TYPES.has(result.type)) {
    return 'kuda';
  }

  if (result.type === 'zhien') {
    return 'niecesNephews';
  }

  if (isBrotherChildKinshipType(result.type)) {
    return 'brotherChildren';
  }

  return 'paternalRelatives';
}

function pushEntry(
  buckets: ReturnType<typeof createEmptyBuckets>,
  rootPerson: Relative,
  relatives: Relative[],
  subgroupId: OzJurtSubgroupId,
  entry: OzJurtRelativeEntry,
) {
  if (isCoreFamilyRelation(rootPerson, entry.person, relatives)) {
    return;
  }

  const bucket = buckets[subgroupId];

  if (bucket.seen.has(entry.person.id)) {
    return;
  }

  bucket.seen.add(entry.person.id);

  const visibleChildren = entry.children.filter(
    (child) => !isCoreFamilyRelation(rootPerson, child, relatives),
  );
  visibleChildren.forEach((child) => bucket.seen.add(child.id));
  bucket.entries.push({ person: entry.person, children: visibleChildren });
}

function pushExtra(
  buckets: ReturnType<typeof createEmptyBuckets>,
  rootPerson: Relative,
  relatives: Relative[],
  person: Relative,
) {
  if (isCoreFamilyRelation(rootPerson, person, relatives)) {
    return;
  }

  if (buckets.siblings.seen.has(person.id)) {
    return;
  }

  for (const bucket of Object.values(buckets)) {
    if (bucket.seen.has(person.id)) {
      return;
    }
  }

  const result = resolveKinshipResult(rootPerson, person, relatives);
  const displayLabel = resolveOzJurtDisplayLabel(rootPerson, person, relatives);
  const subgroupId = classifyOzJurtSubgroup(result, person, displayLabel);
  const bucket = buckets[subgroupId];
  bucket.seen.add(person.id);
  bucket.extraRelatives.push(person);
}

export function buildOzJurtSubgroups(
  rootPerson: Relative,
  relatives: Relative[],
  excludeIds: Set<string>,
  paternalEntries: OzJurtRelativeEntry[],
  ozExtra: Relative[],
): OzJurtSubgroup[] {
  const buckets = createEmptyBuckets();

  for (const sibling of getSiblings(rootPerson, relatives)) {
    if (!isLiving(sibling) || isExcluded(sibling, excludeIds)) {
      continue;
    }

    pushEntry(buckets, rootPerson, relatives, 'siblings', { person: sibling, children: [] });
  }

  for (const sibling of getSiblings(rootPerson, relatives)) {
    if (isExcluded(sibling, excludeIds)) {
      continue;
    }

    const siblingSpouse = getEffectiveSpouse(sibling, relatives);
    if (
      siblingSpouse &&
      isLiving(siblingSpouse) &&
      !isExcluded(siblingSpouse, excludeIds) &&
      !relativeLinkIdsMatch(siblingSpouse.id, rootPerson.id)
    ) {
      pushExtra(buckets, rootPerson, relatives, siblingSpouse);
    }

    for (const child of findChildrenOf(rootPerson, sibling, relatives)) {
      if (isExcluded(child, excludeIds)) {
        continue;
      }

      const childResult = resolveKinshipResult(rootPerson, child, relatives);
      if (isBrotherChildKinshipType(childResult.type) && isMale(sibling)) {
        const bucket = buckets.brotherChildren;
        if (!bucket.seen.has(child.id)) {
          bucket.seen.add(child.id);
          bucket.extraRelatives.push(child);
        }
        continue;
      }

      pushExtra(buckets, rootPerson, relatives, child);
    }
  }

  for (const entry of paternalEntries) {
    if (!isLiving(entry.person) || isExcluded(entry.person, excludeIds)) {
      continue;
    }

    const paternalChildren: Relative[] = [];

    for (const child of entry.children) {
      if (isExcluded(child, excludeIds)) {
        continue;
      }

      const childResult = resolveKinshipResult(rootPerson, child, relatives);
      if (childResult.type === 'zhien') {
        pushExtra(buckets, rootPerson, relatives, child);
        continue;
      }

      paternalChildren.push(child);
    }

    pushEntry(buckets, rootPerson, relatives, 'paternalRelatives', {
      person: entry.person,
      children: paternalChildren,
    });
  }

  for (const person of ozExtra) {
    if (!isLiving(person) || isExcluded(person, excludeIds)) {
      continue;
    }

    pushExtra(buckets, rootPerson, relatives, person);
  }

  for (const bucket of Object.values(buckets)) {
    sortEntries(rootPerson, bucket.entries, relatives);
    bucket.extraRelatives = sortRelatives(rootPerson, bucket.extraRelatives, relatives);
  }

  return OZ_JURT_SUBGROUP_ORDER.map((id) => ({
    id,
    entries: buckets[id].entries,
    extraRelatives: buckets[id].extraRelatives,
  }));
}

export function countOzJurtSubgroup(subgroup: OzJurtSubgroup): number {
  const entryCount = subgroup.entries.reduce(
    (total, entry) => total + 1 + entry.children.length,
    0,
  );

  return entryCount + subgroup.extraRelatives.length;
}

/** Subgroups with at least one relative — omit empty buckets (including kuda) from UI. */
export function filterVisibleOzJurtSubgroups(subgroups: OzJurtSubgroup[]): OzJurtSubgroup[] {
  return subgroups.filter((subgroup) => countOzJurtSubgroup(subgroup) > 0);
}

export function countOzJurtSubgroups(subgroups: OzJurtSubgroup[]): number {
  return subgroups.reduce((total, subgroup) => total + countOzJurtSubgroup(subgroup), 0);
}

export function flattenOzJurtSubgroups(subgroups: OzJurtSubgroup[]): {
  entries: OzJurtRelativeEntry[];
  extraRelatives: Relative[];
} {
  const seen = new Set<string>();
  const entries: OzJurtRelativeEntry[] = [];
  const extraRelatives: Relative[] = [];

  for (const subgroup of subgroups) {
    for (const entry of subgroup.entries) {
      if (seen.has(entry.person.id)) {
        continue;
      }

      seen.add(entry.person.id);
      entry.children.forEach((child) => seen.add(child.id));
      entries.push(entry);
    }

    for (const person of subgroup.extraRelatives) {
      if (seen.has(person.id)) {
        continue;
      }

      seen.add(person.id);
      extraRelatives.push(person);
    }
  }

  return { entries, extraRelatives };
}
