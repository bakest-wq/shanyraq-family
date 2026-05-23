import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';

export type FamilyUnitLayout = 'couple' | 'single-father' | 'single-mother';

export type FamilyUnit = {
  key: string;
  layout: FamilyUnitLayout;
  father: Relative | null;
  mother: Relative | null;
  children: Relative[];
};

export type FamilyTreeData = {
  units: FamilyUnit[];
  unlinked: Relative[];
};

type ParentIds = {
  fatherId: string | null;
  motherId: string | null;
};

type MutableUnit = ParentIds & {
  children: Relative[];
};

function compareNames(a: Relative, b: Relative): number {
  return getRelativeDisplayName(a).localeCompare(getRelativeDisplayName(b), 'ru');
}

function sortChildren(children: Relative[]): Relative[] {
  return [...children].sort(compareNames);
}

/** Family key from actual parent ids only. */
export function familyUnitKey(fatherId?: string | null, motherId?: string | null): string {
  return `${fatherId ?? 'none'}_${motherId ?? 'none'}`;
}

function buildSpouseMap(relatives: Relative[]): Map<string, string> {
  const spouseMap = new Map<string, string>();

  for (const relative of relatives) {
    if (!relative.spouseId) {
      continue;
    }

    spouseMap.set(relative.id, relative.spouseId);
    spouseMap.set(relative.spouseId, relative.id);
  }

  return spouseMap;
}

/**
 * Resolve parent ids strictly from child.father_id / child.mother_id.
 * spouse_id only fills the missing side for display grouping — never swaps roles.
 */
function resolveParentIds(
  child: Relative,
  spouseMap: Map<string, string>,
  byId: Map<string, Relative>,
): ParentIds | null {
  let fatherId = child.fatherId ?? null;
  let motherId = child.motherId ?? null;

  if (!fatherId && !motherId) {
    return null;
  }

  if (fatherId === child.id || motherId === child.id) {
    return null;
  }

  if (fatherId && !byId.has(fatherId)) {
    fatherId = null;
  }

  if (motherId && !byId.has(motherId)) {
    motherId = null;
  }

  if (!fatherId && !motherId) {
    return null;
  }

  if (fatherId && motherId) {
    return { fatherId, motherId };
  }

  if (fatherId && !motherId) {
    const spouseId = spouseMap.get(fatherId);
    if (spouseId && spouseId !== child.id && byId.has(spouseId)) {
      return { fatherId, motherId: spouseId };
    }

    return { fatherId, motherId: null };
  }

  if (!fatherId && motherId) {
    const spouseId = spouseMap.get(motherId);
    if (spouseId && spouseId !== child.id && byId.has(spouseId)) {
      return { fatherId: spouseId, motherId };
    }

    return { fatherId: null, motherId };
  }

  return null;
}

function addChildToUnit(unit: MutableUnit, child: Relative): void {
  if (child.id === unit.fatherId || child.id === unit.motherId) {
    return;
  }

  if (unit.children.some((existing) => existing.id === child.id)) {
    return;
  }

  unit.children.push(child);
}

function mergeUnits(target: MutableUnit, source: MutableUnit): void {
  for (const child of source.children) {
    addChildToUnit(target, child);
  }

  if (!target.fatherId && source.fatherId) {
    target.fatherId = source.fatherId;
  }

  if (!target.motherId && source.motherId) {
    target.motherId = source.motherId;
  }
}

function mergePartialUnits(unitsMap: Map<string, MutableUnit>): void {
  const keys = [...unitsMap.keys()];

  for (const key of keys) {
    const unit = unitsMap.get(key);
    if (!unit?.fatherId || !unit.motherId) {
      continue;
    }

    const coupleKey = familyUnitKey(unit.fatherId, unit.motherId);
    let coupleUnit = unitsMap.get(coupleKey);

    if (!coupleUnit) {
      coupleUnit = {
        fatherId: unit.fatherId,
        motherId: unit.motherId,
        children: [],
      };
      unitsMap.set(coupleKey, coupleUnit);
    }

    if (key !== coupleKey) {
      mergeUnits(coupleUnit, unit);
      unitsMap.delete(key);
    }

    const singleFatherKey = familyUnitKey(unit.fatherId, null);
    const singleMotherKey = familyUnitKey(null, unit.motherId);
    const singleFatherUnit = unitsMap.get(singleFatherKey);
    const singleMotherUnit = unitsMap.get(singleMotherKey);

    if (singleFatherUnit) {
      mergeUnits(coupleUnit, singleFatherUnit);
      unitsMap.delete(singleFatherKey);
    }

    if (singleMotherUnit) {
      mergeUnits(coupleUnit, singleMotherUnit);
      unitsMap.delete(singleMotherKey);
    }
  }
}

function mergeSpouseSingleParentUnits(
  unitsMap: Map<string, MutableUnit>,
  spouseMap: Map<string, string>,
  byId: Map<string, Relative>,
): void {
  for (const [key, unit] of [...unitsMap.entries()]) {
    if (unit.fatherId && unit.motherId) {
      continue;
    }

    if (unit.fatherId && !unit.motherId) {
      const spouseId = spouseMap.get(unit.fatherId);
      if (!spouseId || !byId.has(spouseId)) {
        continue;
      }

      const coupleKey = familyUnitKey(unit.fatherId, spouseId);
      let coupleUnit = unitsMap.get(coupleKey);

      if (!coupleUnit) {
        coupleUnit = { fatherId: unit.fatherId, motherId: spouseId, children: [] };
        unitsMap.set(coupleKey, coupleUnit);
      }

      mergeUnits(coupleUnit, unit);

      const spouseOnlyKey = familyUnitKey(null, spouseId);
      const spouseOnlyUnit = unitsMap.get(spouseOnlyKey);
      if (spouseOnlyUnit) {
        mergeUnits(coupleUnit, spouseOnlyUnit);
        unitsMap.delete(spouseOnlyKey);
      }

      if (key !== coupleKey) {
        unitsMap.delete(key);
      }
      continue;
    }

    if (!unit.fatherId && unit.motherId) {
      const spouseId = spouseMap.get(unit.motherId);
      if (!spouseId || !byId.has(spouseId)) {
        continue;
      }

      const coupleKey = familyUnitKey(spouseId, unit.motherId);
      let coupleUnit = unitsMap.get(coupleKey);

      if (!coupleUnit) {
        coupleUnit = { fatherId: spouseId, motherId: unit.motherId, children: [] };
        unitsMap.set(coupleKey, coupleUnit);
      }

      mergeUnits(coupleUnit, unit);

      const spouseOnlyKey = familyUnitKey(spouseId, null);
      const spouseOnlyUnit = unitsMap.get(spouseOnlyKey);
      if (spouseOnlyUnit) {
        mergeUnits(coupleUnit, spouseOnlyUnit);
        unitsMap.delete(spouseOnlyKey);
      }

      if (key !== coupleKey) {
        unitsMap.delete(key);
      }
    }
  }
}

function pruneShadowUnits(unitsMap: Map<string, MutableUnit>): void {
  const coupleParentIds = new Set<string>();

  for (const unit of unitsMap.values()) {
    if (unit.fatherId && unit.motherId) {
      coupleParentIds.add(unit.fatherId);
      coupleParentIds.add(unit.motherId);
    }
  }

  for (const [key, unit] of [...unitsMap.entries()]) {
    const isSingleFather = Boolean(unit.fatherId && !unit.motherId);
    const isSingleMother = Boolean(!unit.fatherId && unit.motherId);

    if (isSingleFather && unit.fatherId && coupleParentIds.has(unit.fatherId)) {
      unitsMap.delete(key);
      continue;
    }

    if (isSingleMother && unit.motherId && coupleParentIds.has(unit.motherId)) {
      unitsMap.delete(key);
    }
  }
}

function toFamilyUnit(mutable: MutableUnit, byId: Map<string, Relative>): FamilyUnit | null {
  const father = mutable.fatherId ? byId.get(mutable.fatherId) ?? null : null;
  const mother = mutable.motherId ? byId.get(mutable.motherId) ?? null : null;
  const children = sortChildren(
    mutable.children.filter(
      (child) => child.id !== mutable.fatherId && child.id !== mutable.motherId,
    ),
  );

  if (children.length === 0 || (!father && !mother)) {
    return null;
  }

  const layout: FamilyUnitLayout =
    father && mother ? 'couple' : father ? 'single-father' : 'single-mother';

  return {
    key: familyUnitKey(father?.id, mother?.id),
    layout,
    father,
    mother,
    children,
  };
}

export function isLinkedToTree(relative: Relative): boolean {
  return Boolean(relative.fatherId || relative.motherId);
}

export function buildFamilyTree(relatives: Relative[]): FamilyTreeData {
  const living = relatives.filter((relative) => !relative.isDeceased);
  const byId = new Map(living.map((relative) => [relative.id, relative]));
  const spouseMap = buildSpouseMap(living);
  const unitsMap = new Map<string, MutableUnit>();

  for (const child of living) {
    if (!child.fatherId && !child.motherId) {
      continue;
    }

    const parents = resolveParentIds(child, spouseMap, byId);
    if (!parents) {
      continue;
    }

    const key = familyUnitKey(parents.fatherId, parents.motherId);
    let unit = unitsMap.get(key);

    if (!unit) {
      unit = {
        fatherId: parents.fatherId,
        motherId: parents.motherId,
        children: [],
      };
      unitsMap.set(key, unit);
    }

    addChildToUnit(unit, child);
  }

  mergeSpouseSingleParentUnits(unitsMap, spouseMap, byId);
  mergePartialUnits(unitsMap);
  pruneShadowUnits(unitsMap);

  const renderedFamilyKeys = new Set<string>();
  const renderedPersonIds = new Set<string>();
  const units: FamilyUnit[] = [];

  const mutableUnits = [...unitsMap.values()]
    .map((mutable) => toFamilyUnit(mutable, byId))
    .filter((unit): unit is FamilyUnit => unit !== null)
    .sort((a, b) => {
      if (a.layout === 'couple' && b.layout !== 'couple') {
        return -1;
      }

      if (b.layout === 'couple' && a.layout !== 'couple') {
        return 1;
      }

      return compareNames(a.children[0], b.children[0]);
    });

  for (const unit of mutableUnits) {
    if (renderedFamilyKeys.has(unit.key)) {
      continue;
    }

    const parentIds = [unit.father?.id, unit.mother?.id].filter(Boolean) as string[];
    const isShadowSingle =
      unit.layout !== 'couple' &&
      parentIds.some((parentId) => renderedPersonIds.has(parentId));

    if (isShadowSingle) {
      continue;
    }

    renderedFamilyKeys.add(unit.key);

    if (unit.father) {
      renderedPersonIds.add(unit.father.id);
    }

    if (unit.mother) {
      renderedPersonIds.add(unit.mother.id);
    }

    for (const child of unit.children) {
      renderedPersonIds.add(child.id);
    }

    units.push(unit);
  }

  const unlinked = living
    .filter((relative) => !renderedPersonIds.has(relative.id))
    .sort(compareNames);

  return { units, unlinked };
}

export function getParentCandidates(
  relatives: Relative[],
  childId: string,
  role: 'father' | 'mother',
): Relative[] {
  return relatives
    .filter((relative) => {
      if (relative.id === childId) {
        return false;
      }

      if (relative.isDeceased) {
        return false;
      }

      const relationship = relative.relationship.toLowerCase();
      if (role === 'father') {
        return (
          /^(ата|әке|аға|іні|ұлы|бала|немере|күйеуі|күйеу бала|нағашы|бөле|жиен)/i.test(
            relative.relationship,
          ) ||
          relationship.includes('әke') ||
          relationship.includes('ата') ||
          relationship.includes('күйеу')
        );
      }

      return (
        /^(апа|ана|әпке|қарындас|қызы|бала|немере|жұбайы|келін|нағашы|бөле|жиен)/i.test(
          relative.relationship,
        ) ||
        relationship.includes('ана') ||
        relationship.includes('апа') ||
        relationship.includes('келін')
      );
    })
    .sort(compareNames);
}

/** Fallback: all relatives except self when no role match. */
export function getAllParentCandidates(relatives: Relative[], childId: string): Relative[] {
  return relatives
    .filter((relative) => relative.id !== childId && !relative.isDeceased)
    .sort(compareNames);
}
