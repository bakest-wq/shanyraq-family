import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { sharesLinkedParentWithRoot } from '@/utils/family-sibling-links';
import {
  dedupeRelativesById,
  linksFromRelative,
  normalizeRelativeList,
  resolveLinkTarget,
} from '@/utils/family-graph/normalize';
import type { AgeOrder, FamilyGraphDerived } from '@/utils/family-graph/types';

export class FamilyGraph {
  readonly relatives: Relative[];

  readonly byId: Map<string, Relative>;

  readonly derived: FamilyGraphDerived;

  constructor(relatives: Relative[]) {
    this.relatives = normalizeRelativeList(dedupeRelativesById(relatives));
    this.byId = new Map(this.relatives.map((relative) => [relative.id, relative]));
    this.derived = buildDerivedIndices(this);
  }

  get size(): number {
    return this.relatives.length;
  }

  getById(id?: string | null): Relative | null {
    return resolveLinkTarget(this.relatives, id);
  }

  getParents(relative: Relative): Relative[] {
    return [relative.fatherId, relative.motherId]
      .map((id) => this.getById(id))
      .filter((person): person is Relative => Boolean(person));
  }

  getChildren(relative: Relative): Relative[] {
    return this.derived.childrenById.get(relative.id) ?? [];
  }

  getChildrenById(relativeId: string): Relative[] {
    const person = this.getById(relativeId);
    return person ? this.getChildren(person) : [];
  }

  getSiblings(relative: Relative): Relative[] {
    return this.relatives.filter(
      (candidate) =>
        !relativeLinkIdsMatch(candidate.id, relative.id) &&
        sharesLinkedParentWithRoot(relative, candidate),
    );
  }

  getGrandparents(relative: Relative): Relative[] {
    const grandparents = this.getParents(relative).flatMap((parent) => this.getParents(parent));
    return dedupeRelativesById(grandparents);
  }

  getGrandchildren(relative: Relative): Relative[] {
    return this.getChildren(relative).flatMap((child) => this.getChildren(child));
  }

  getFather(relative: Relative): Relative | null {
    return this.getById(relative.fatherId);
  }

  getMother(relative: Relative): Relative | null {
    return this.getById(relative.motherId);
  }

  areSpouses(left: Relative, right: Relative): boolean {
    return (
      relativeLinkIdsMatch(left.spouseId, right.id) ||
      relativeLinkIdsMatch(right.spouseId, left.id)
    );
  }

  getEffectiveSpouse(relative: Relative): Relative | null {
    if (relative.spouseId) {
      const forward = this.getById(relative.spouseId);
      if (forward) {
        return forward;
      }
    }

    return (
      this.relatives.find((candidate) => relativeLinkIdsMatch(candidate.spouseId, relative.id)) ??
      null
    );
  }

  isChildOf(child: Relative, parent: Relative): boolean {
    return (
      relativeLinkIdsMatch(child.fatherId, parent.id) ||
      relativeLinkIdsMatch(child.motherId, parent.id)
    );
  }

  areSiblings(left: Relative, right: Relative): boolean {
    return this.getSiblings(left).some((sibling) => relativeLinkIdsMatch(sibling.id, right.id));
  }

  hasParentLinks(relative: Relative): boolean {
    return Boolean(relative.fatherId || relative.motherId);
  }

  getAncestorIds(relativeId: string): Set<string> {
    const ancestors = new Set<string>();

    const visit = (personId: string, visiting: Set<string>) => {
      if (visiting.has(personId)) {
        return;
      }

      const person = this.getById(personId);
      if (!person) {
        return;
      }

      const nextVisiting = new Set(visiting);
      nextVisiting.add(personId);

      for (const parentId of [person.fatherId, person.motherId]) {
        if (!parentId) {
          continue;
        }

        const normalizedParentId = String(parentId).trim();
        const alreadyVisited = [...ancestors].some((id) =>
          relativeLinkIdsMatch(id, normalizedParentId),
        );

        if (alreadyVisited) {
          continue;
        }

        ancestors.add(normalizedParentId);
        visit(normalizedParentId, nextVisiting);
      }
    };

    visit(relativeId, new Set());
    return ancestors;
  }

  getDescendantIds(relativeId: string): Set<string> {
    const descendants = new Set<string>();
    const queue = [String(relativeId).trim()];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      for (const relative of this.relatives) {
        if (
          !relativeLinkIdsMatch(relative.fatherId, currentId) &&
          !relativeLinkIdsMatch(relative.motherId, currentId)
        ) {
          continue;
        }

        if (descendants.has(relative.id)) {
          continue;
        }

        descendants.add(relative.id);
        queue.push(relative.id);
      }
    }

    return descendants;
  }

  getDescendantDepth(ancestor: Relative, descendant: Relative): number | null {
    if (relativeLinkIdsMatch(ancestor.id, descendant.id)) {
      return 0;
    }

    const visited = new Set<string>();
    const queue: Array<{ personId: string; depth: number }> = [{ personId: ancestor.id, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || visited.has(current.personId)) {
        continue;
      }

      visited.add(current.personId);
      const person = this.getById(current.personId);
      if (!person) {
        continue;
      }

      for (const child of this.getChildren(person)) {
        if (relativeLinkIdsMatch(child.id, descendant.id)) {
          return current.depth + 1;
        }

        if (!visited.has(child.id)) {
          queue.push({ personId: child.id, depth: current.depth + 1 });
        }
      }
    }

    return null;
  }

  wouldCreateAncestorCycle(relativeId: string, proposedParentId: string): boolean {
    if (relativeLinkIdsMatch(relativeId, proposedParentId)) {
      return true;
    }

    return this.getDescendantIds(relativeId).has(proposedParentId);
  }

  hasAncestorCycle(relativeId: string): boolean {
    const ancestors = this.getAncestorIds(relativeId);
    return [...ancestors].some((ancestorId) => relativeLinkIdsMatch(ancestorId, relativeId));
  }

  isUnlinked(relative: Relative): boolean {
    return (
      !this.hasParentLinks(relative) &&
      !this.getEffectiveSpouse(relative) &&
      this.getChildren(relative).length === 0
    );
  }

  withRelatives(nextRelatives: Relative[]): FamilyGraph {
    return new FamilyGraph(nextRelatives);
  }

  withPatchedLinks(
    relativeId: string,
    patch: Partial<ReturnType<typeof linksFromRelative>>,
  ): FamilyGraph {
    return this.withRelatives(
      this.relatives.map((relative) => {
        if (!relativeLinkIdsMatch(relative.id, relativeId)) {
          return relative;
        }

        return {
          ...relative,
          fatherId: patch.fatherId !== undefined ? (patch.fatherId ?? undefined) : relative.fatherId,
          motherId: patch.motherId !== undefined ? (patch.motherId ?? undefined) : relative.motherId,
          spouseId: patch.spouseId !== undefined ? (patch.spouseId ?? undefined) : relative.spouseId,
        };
      }),
    );
  }
}

export function buildFamilyGraph(relatives: Relative[]): FamilyGraph {
  return new FamilyGraph(relatives);
}

function resolveEffectiveSpouse(graph: FamilyGraph, relative: Relative): Relative | null {
  if (relative.spouseId) {
    const forward = graph.getById(relative.spouseId);
    if (forward) {
      return forward;
    }
  }

  return (
    graph.relatives.find((candidate) => relativeLinkIdsMatch(candidate.spouseId, relative.id)) ??
    null
  );
}

function buildDerivedIndices(graph: FamilyGraph): FamilyGraphDerived {
  const childrenById = new Map<string, Relative[]>();
  const parentIdsById = new Map<string, { fatherId?: string; motherId?: string }>();
  const spouseById = new Map<string, Relative | null>();
  const unlinkedIds: string[] = [];
  const roots: Relative[] = [];

  for (const relative of graph.relatives) {
    parentIdsById.set(relative.id, {
      fatherId: relative.fatherId,
      motherId: relative.motherId,
    });

    for (const parentId of [relative.fatherId, relative.motherId]) {
      if (!parentId) {
        continue;
      }

      const siblings = childrenById.get(parentId) ?? [];
      siblings.push(relative);
      childrenById.set(parentId, siblings);
    }

    if (!relative.fatherId && !relative.motherId) {
      roots.push(relative);
    }
  }

  for (const relative of graph.relatives) {
    spouseById.set(relative.id, resolveEffectiveSpouse(graph, relative));

    const hasParents = Boolean(relative.fatherId || relative.motherId);
    const hasSpouse = spouseById.get(relative.id) != null;
    const hasChildren = (childrenById.get(relative.id) ?? []).length > 0;

    if (!hasParents && !hasSpouse && !hasChildren) {
      unlinkedIds.push(relative.id);
    }
  }

  return {
    childrenById,
    parentIdsById,
    spouseById,
    unlinkedIds,
    roots,
  };
}

export function isMale(relative: Relative): boolean {
  return relative.gender === 'male';
}

export function isFemale(relative: Relative): boolean {
  return relative.gender === 'female';
}

export function compareBirthYear(left: Relative, right: Relative): AgeOrder {
  const leftYear = left.birthdayYear ?? parseYearFromBirthday(left.birthday);
  const rightYear = right.birthdayYear ?? parseYearFromBirthday(right.birthday);

  if (leftYear == null || rightYear == null) {
    return 'unknown';
  }

  if (leftYear < rightYear) {
    return 'older';
  }

  if (leftYear > rightYear) {
    return 'younger';
  }

  return 'same';
}

function parseYearFromBirthday(birthday?: string): number | null {
  if (!birthday?.trim()) {
    return null;
  }

  const match = birthday.trim().match(/^(\d{4})/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  return Number.isFinite(year) ? year : null;
}

export function sortRelativesByName(relatives: Relative[]): Relative[] {
  return [...relatives].sort((left, right) =>
    (left.displayName || left.fullName || left.firstName).localeCompare(
      right.displayName || right.fullName || right.firstName,
      'ru',
    ),
  );
}

export function getPersonById(relatives: Relative[], id?: string | null): Relative | null {
  return buildFamilyGraph(relatives).getById(id);
}

export function getParents(relative: Relative, relatives: Relative[]): Relative[] {
  return buildFamilyGraph(relatives).getParents(relative);
}

export function getChildren(relative: Relative, relatives: Relative[]): Relative[] {
  return buildFamilyGraph(relatives).getChildren(relative);
}

export function getChildrenById(relativeId: string, relatives: Relative[]): Relative[] {
  return buildFamilyGraph(relatives).getChildrenById(relativeId);
}

export function getSiblings(relative: Relative, relatives: Relative[]): Relative[] {
  return buildFamilyGraph(relatives).getSiblings(relative);
}

export function getGrandparents(relative: Relative, relatives: Relative[]): Relative[] {
  return buildFamilyGraph(relatives).getGrandparents(relative);
}

export function getGrandchildren(relative: Relative, relatives: Relative[]): Relative[] {
  return buildFamilyGraph(relatives).getGrandchildren(relative);
}

export function getEffectiveSpouse(relative: Relative, relatives: Relative[]): Relative | null {
  return buildFamilyGraph(relatives).getEffectiveSpouse(relative);
}

export function areSpouses(a: Relative, b: Relative): boolean {
  return (
    relativeLinkIdsMatch(a.spouseId, b.id) || relativeLinkIdsMatch(b.spouseId, a.id)
  );
}

export function getDescendantIds(relativeId: string, relatives: Relative[]): Set<string> {
  return buildFamilyGraph(relatives).getDescendantIds(relativeId);
}

export function getAncestorIds(relativeId: string, relatives: Relative[]): Set<string> {
  return buildFamilyGraph(relatives).getAncestorIds(relativeId);
}

export function getDescendantDepth(
  ancestor: Relative,
  descendant: Relative,
  relatives: Relative[],
): number | null {
  return buildFamilyGraph(relatives).getDescendantDepth(ancestor, descendant);
}

export function areSiblings(left: Relative, right: Relative, relatives: Relative[]): boolean {
  return buildFamilyGraph(relatives).areSiblings(left, right);
}

export function hasParentLinks(relative: Relative): boolean {
  return Boolean(relative.fatherId || relative.motherId);
}

export function isChildOf(child: Relative, parent: Relative, _relatives: Relative[]): boolean {
  return (
    relativeLinkIdsMatch(child.fatherId, parent.id) ||
    relativeLinkIdsMatch(child.motherId, parent.id)
  );
}

export function getFather(relative: Relative, relatives: Relative[]): Relative | null {
  return buildFamilyGraph(relatives).getFather(relative);
}

export function getMother(relative: Relative, relatives: Relative[]): Relative | null {
  return buildFamilyGraph(relatives).getMother(relative);
}

export function getById(relatives: Relative[], id?: string | null): Relative | null {
  return getPersonById(relatives, id);
}
