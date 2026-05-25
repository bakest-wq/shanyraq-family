import type { Relative } from '@/types/relative';
import { isCoreFamilyRelation } from '@/utils/core-family-relation';
import { resolveKinshipResult } from '@/services/kinship/kinship-labels';
import type { KinshipResult } from '@/services/kinship/types';
import type { JurtRelativeEntry } from '@/utils/jurt-grouping';
import { sortRelativesBySmartPriority } from '@/services/relative-priority-sort';

export type KayinJurtSubgroupId = 'kayin_ata_ene' | 'kayin_siblings' | 'kuda';

export type KayinJurtSubgroup = {
  id: KayinJurtSubgroupId;
  entries: JurtRelativeEntry[];
  extraRelatives: Relative[];
};

export const KAYIN_JURT_SUBGROUP_ORDER: KayinJurtSubgroupId[] = [
  'kayin_ata_ene',
  'kayin_siblings',
  'kuda',
];

const KAYIN_ATA_ENE_TYPES = new Set<KinshipResult['type']>(['kayin_ata', 'kayin_ene']);

const KAYIN_SIBLING_TYPES = new Set<KinshipResult['type']>([
  'kayin_aga',
  'kayin_ini',
  'kayin_apke',
  'kayin_singli',
  'kayin_neutral',
  'kayin_jezde',
  'abysyn',
  'kayin_jurt',
]);

const KUDA_TYPES = new Set<KinshipResult['type']>(['kuda', 'kudagi', 'kuda_neutral']);

export function classifyKayinJurtSubgroup(result: KinshipResult): KayinJurtSubgroupId {
  if (KAYIN_ATA_ENE_TYPES.has(result.type)) {
    return 'kayin_ata_ene';
  }

  if (KUDA_TYPES.has(result.type)) {
    return 'kuda';
  }

  if (KAYIN_SIBLING_TYPES.has(result.type)) {
    return 'kayin_siblings';
  }

  return 'kayin_siblings';
}

function sortEntries(
  rootPerson: Relative,
  entries: JurtRelativeEntry[],
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

function sortRelatives(
  rootPerson: Relative,
  relatives: Relative[],
  allRelatives: Relative[],
): Relative[] {
  return sortRelativesBySmartPriority(rootPerson, relatives, { allRelatives });
}

function createEmptyBuckets(): Record<
  KayinJurtSubgroupId,
  { entries: JurtRelativeEntry[]; extraRelatives: Relative[]; seen: Set<string> }
> {
  return {
    kayin_ata_ene: { entries: [], extraRelatives: [], seen: new Set<string>() },
    kayin_siblings: { entries: [], extraRelatives: [], seen: new Set<string>() },
    kuda: { entries: [], extraRelatives: [], seen: new Set<string>() },
  };
}

function pushEntry(
  buckets: ReturnType<typeof createEmptyBuckets>,
  rootPerson: Relative,
  relatives: Relative[],
  subgroupId: KayinJurtSubgroupId,
  entry: JurtRelativeEntry,
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

  for (const bucket of Object.values(buckets)) {
    if (bucket.seen.has(person.id)) {
      return;
    }
  }

  const result = resolveKinshipResult(rootPerson, person, relatives);
  const subgroupId = classifyKayinJurtSubgroup(result);
  const bucket = buckets[subgroupId];
  bucket.seen.add(person.id);
  bucket.extraRelatives.push(person);
}

export function buildKayinJurtSubgroups(
  rootPerson: Relative,
  relatives: Relative[],
  entries: JurtRelativeEntry[],
  extraRelatives: Relative[],
): KayinJurtSubgroup[] {
  const buckets = createEmptyBuckets();

  for (const entry of entries) {
    const result = resolveKinshipResult(rootPerson, entry.person, relatives);
    pushEntry(buckets, rootPerson, relatives, classifyKayinJurtSubgroup(result), entry);
  }

  for (const person of extraRelatives) {
    pushExtra(buckets, rootPerson, relatives, person);
  }

  for (const bucket of Object.values(buckets)) {
    sortEntries(rootPerson, bucket.entries, relatives);
    bucket.extraRelatives = sortRelatives(rootPerson, bucket.extraRelatives, relatives);
  }

  return KAYIN_JURT_SUBGROUP_ORDER.map((id) => ({
    id,
    entries: buckets[id].entries,
    extraRelatives: buckets[id].extraRelatives,
  }));
}

export function countKayinJurtSubgroup(subgroup: KayinJurtSubgroup): number {
  const entryCount = subgroup.entries.reduce(
    (total, entry) => total + 1 + entry.children.length,
    0,
  );

  return entryCount + subgroup.extraRelatives.length;
}

export function filterVisibleKayinJurtSubgroups(subgroups: KayinJurtSubgroup[]): KayinJurtSubgroup[] {
  return subgroups.filter((subgroup) => countKayinJurtSubgroup(subgroup) > 0);
}

export function countKayinJurtSubgroups(subgroups: KayinJurtSubgroup[]): number {
  return subgroups.reduce((total, subgroup) => total + countKayinJurtSubgroup(subgroup), 0);
}

export function flattenKayinJurtSubgroups(subgroups: KayinJurtSubgroup[]): {
  entries: JurtRelativeEntry[];
  extraRelatives: Relative[];
} {
  const seen = new Set<string>();
  const entries: JurtRelativeEntry[] = [];
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

export function kayinJurtHasPerson(subgroups: KayinJurtSubgroup[], personId: string): boolean {
  return subgroups.some(
    (subgroup) =>
      subgroup.entries.some((entry) => entry.person.id === personId) ||
      subgroup.extraRelatives.some((person) => person.id === personId) ||
      subgroup.entries.some((entry) => entry.children.some((child) => child.id === personId)),
  );
}
