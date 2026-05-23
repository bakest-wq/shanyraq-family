import { Relative } from '@/types/relative';
import { getDescendantIds } from '@/utils/family-link-validation';
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
    if (!relative.spouseId || relative.spouseId === relative.id) {
      continue;
    }

    spouseMap.set(relative.id, relative.spouseId);
    spouseMap.set(relative.spouseId, relative.id);
  }

  return spouseMap;
}

function isInvalidParentCandidate(
  childId: string,
  parentId: string | null,
  relatives: Relative[],
): boolean {
  if (!parentId) {
    return false;
  }

  if (parentId === childId) {
    return true;
  }

  return getDescendantIds(childId, relatives).has(parentId);
}

/** Put parents in father/mother slots using gender when known. */
function normalizeParentIds(
  fatherId: string | null,
  motherId: string | null,
  byId: Map<string, Relative>,
): ParentIds {
  const father = fatherId ? byId.get(fatherId) ?? null : null;
  const mother = motherId ? byId.get(motherId) ?? null : null;

  if (father && !mother) {
    if (father.gender === 'female') {
      return { fatherId: null, motherId: father.id };
    }

    return { fatherId: father.id, motherId: null };
  }

  if (!father && mother) {
    if (mother.gender === 'male') {
      return { fatherId: mother.id, motherId: null };
    }

    return { fatherId: null, motherId: mother.id };
  }

  if (father && mother) {
    if (father.gender === 'female' && mother.gender === 'male') {
      return { fatherId: mother.id, motherId: father.id };
    }

    return { fatherId: father.id, motherId: mother.id };
  }

  return { fatherId, motherId };
}

/**
 * Resolve parent ids strictly from child.father_id / child.mother_id only.
 * Spouse links do not fill missing parent slots for child grouping.
 */
function resolveParentIds(
  child: Relative,
  _spouseMap: Map<string, string>,
  byId: Map<string, Relative>,
  relatives: Relative[],
): ParentIds | null {
  let fatherId = child.fatherId ?? null;
  let motherId = child.motherId ?? null;

  if (!fatherId && !motherId) {
    return null;
  }

  if (isInvalidParentCandidate(child.id, fatherId, relatives)) {
    fatherId = null;
  }

  if (isInvalidParentCandidate(child.id, motherId, relatives)) {
    motherId = null;
  }

  if (!fatherId && !motherId) {
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

  return normalizeParentIds(fatherId, motherId, byId);
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

function mergePartialUnits(unitsMap: Map<string, MutableUnit>, byId: Map<string, Relative>): void {
  const keys = [...unitsMap.keys()];

  for (const key of keys) {
    const unit = unitsMap.get(key);
    if (!unit?.fatherId || !unit.motherId) {
      continue;
    }

    const normalized = normalizeParentIds(unit.fatherId, unit.motherId, byId);
    const coupleKey = familyUnitKey(normalized.fatherId, normalized.motherId);
    let coupleUnit = unitsMap.get(coupleKey);

    if (!coupleUnit) {
      coupleUnit = {
        fatherId: normalized.fatherId,
        motherId: normalized.motherId,
        children: [],
      };
      unitsMap.set(coupleKey, coupleUnit);
    } else {
      coupleUnit.fatherId = normalized.fatherId;
      coupleUnit.motherId = normalized.motherId;
    }

    if (key !== coupleKey) {
      mergeUnits(coupleUnit, unit);
      unitsMap.delete(key);
    }

    const singleFatherKey = familyUnitKey(normalized.fatherId, null);
    const singleMotherKey = familyUnitKey(null, normalized.motherId);
    const singleFatherUnit = unitsMap.get(singleFatherKey);
    const singleMotherUnit = unitsMap.get(singleMotherKey);

    if (singleFatherUnit && singleFatherKey !== coupleKey) {
      mergeUnits(coupleUnit, singleFatherUnit);
      unitsMap.delete(singleFatherKey);
    }

    if (singleMotherUnit && singleMotherKey !== coupleKey) {
      mergeUnits(coupleUnit, singleMotherUnit);
      unitsMap.delete(singleMotherKey);
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

function collapseDuplicateUnits(
  unitsMap: Map<string, MutableUnit>,
  byId: Map<string, Relative>,
): Map<string, MutableUnit> {
  const collapsed = new Map<string, MutableUnit>();

  for (const unit of unitsMap.values()) {
    const normalized = normalizeParentIds(unit.fatherId, unit.motherId, byId);
    const key = familyUnitKey(normalized.fatherId, normalized.motherId);
    const existing = collapsed.get(key);

    if (!existing) {
      collapsed.set(key, {
        fatherId: normalized.fatherId,
        motherId: normalized.motherId,
        children: [...unit.children],
      });
      continue;
    }

    mergeUnits(existing, {
      fatherId: normalized.fatherId,
      motherId: normalized.motherId,
      children: unit.children,
    });
  }

  return collapsed;
}

function toFamilyUnit(
  mutable: MutableUnit,
  byId: Map<string, Relative>,
  options: { allowEmptyChildren?: boolean } = {},
): FamilyUnit | null {
  const normalized = normalizeParentIds(mutable.fatherId, mutable.motherId, byId);
  const father = normalized.fatherId ? byId.get(normalized.fatherId) ?? null : null;
  const mother = normalized.motherId ? byId.get(normalized.motherId) ?? null : null;
  const children = sortChildren(
    mutable.children.filter(
      (child) =>
        child.id !== normalized.fatherId &&
        child.id !== normalized.motherId &&
        !child.isDeceased,
    ),
  );

  if (!father && !mother) {
    return null;
  }

  if (children.length === 0 && !options.allowEmptyChildren) {
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

function couplePairKey(idA: string, idB: string): string {
  return [idA, idB].sort().join(':');
}

function getUnitSortName(unit: FamilyUnit): string {
  if (unit.father) {
    return getRelativeDisplayName(unit.father);
  }

  if (unit.mother) {
    return getRelativeDisplayName(unit.mother);
  }

  if (unit.children[0]) {
    return getRelativeDisplayName(unit.children[0]);
  }

  return '';
}

function addSpouseCoupleUnits(
  units: FamilyUnit[],
  renderedPersonIds: Set<string>,
  renderedFamilyKeys: Set<string>,
  living: Relative[],
  byId: Map<string, Relative>,
): void {
  const seenPairs = new Set<string>();

  for (const person of living) {
    if (!person.spouseId || person.spouseId === person.id) {
      continue;
    }

    const spouse = byId.get(person.spouseId);
    if (!spouse || spouse.isDeceased) {
      continue;
    }

    const pairKey = couplePairKey(person.id, spouse.id);
    if (seenPairs.has(pairKey)) {
      continue;
    }

    seenPairs.add(pairKey);

    const normalized = normalizeParentIds(person.id, spouse.id, byId);
    const key = familyUnitKey(normalized.fatherId, normalized.motherId);

    if (renderedFamilyKeys.has(key)) {
      continue;
    }

    const father = normalized.fatherId ? byId.get(normalized.fatherId) ?? null : null;
    const mother = normalized.motherId ? byId.get(normalized.motherId) ?? null : null;

    if (!father && !mother) {
      continue;
    }

    const fatherRendered = Boolean(father && renderedPersonIds.has(father.id));
    const motherRendered = Boolean(mother && renderedPersonIds.has(mother.id));

    if (fatherRendered || motherRendered) {
      continue;
    }

    const layout: FamilyUnitLayout =
      father && mother ? 'couple' : father ? 'single-father' : 'single-mother';

    units.push({
      key,
      layout,
      father,
      mother,
      children: [],
    });

    renderedFamilyKeys.add(key);

    if (father) {
      renderedPersonIds.add(father.id);
    }

    if (mother) {
      renderedPersonIds.add(mother.id);
    }
  }
}

export function getFamilyUnitAddChildParams(unit: FamilyUnit): {
  fatherId?: string;
  motherId?: string;
} {
  return {
    fatherId: unit.father?.id,
    motherId: unit.mother?.id,
  };
}

export function buildFamilyTree(relatives: Relative[]): FamilyTreeData {
  const living = relatives.filter((relative) => !relative.isDeceased);
  const byId = new Map(relatives.map((relative) => [relative.id, relative]));
  const spouseMap = buildSpouseMap(relatives);
  let unitsMap = new Map<string, MutableUnit>();

  for (const child of living) {
    if (!child.fatherId && !child.motherId) {
      continue;
    }

    const parents = resolveParentIds(child, spouseMap, byId, relatives);
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

  mergePartialUnits(unitsMap, byId);
  pruneShadowUnits(unitsMap);
  unitsMap = collapseDuplicateUnits(unitsMap, byId);

  const renderedFamilyKeys = new Set<string>();
  const renderedPersonIds = new Set<string>();
  const units: FamilyUnit[] = [];

  const childUnits = [...unitsMap.values()]
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

  for (const unit of childUnits) {
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

  addSpouseCoupleUnits(units, renderedPersonIds, renderedFamilyKeys, living, byId);

  units.sort((a, b) => {
    if (a.layout === 'couple' && b.layout !== 'couple') {
      return -1;
    }

    if (b.layout === 'couple' && a.layout !== 'couple') {
      return 1;
    }

    return getUnitSortName(a).localeCompare(getUnitSortName(b), 'ru');
  });

  const unlinked = living
    .filter((relative) => !renderedPersonIds.has(relative.id))
    .sort(compareNames);

  return { units, unlinked };
}

export function isLinkedToTree(relative: Relative): boolean {
  return Boolean(relative.fatherId || relative.motherId);
}

export function isShezhireTreeBuilt(tree: FamilyTreeData): boolean {
  return tree.units.length > 0;
}

/** @deprecated Use buildFamilyLinkCandidates from family-link-validation. */
export function getAllParentCandidates(relatives: Relative[], childId: string): Relative[] {
  return relatives
    .filter((relative) => relative.id !== childId && !relative.isDeceased)
    .sort(compareNames);
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
