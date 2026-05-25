import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';

import {
  buildShezhireRootGraph,
  buildShezhireMainTreeExcludeIds,
  buildThreeJurtGroups,
  resolveFamilyRing,
} from '@/services/family-graph.service';
import type { FamilyRing, JurtGroupsTree, ShezhireRootGraph } from '@/services/family-graph.types';
import { buildKinshipCardLineMap, getKinshipCardLine } from '@/services/kinship/kinship.service';
import type {
  KinshipLabelMap,
  ProfileFamilyPreparedView,
  RelativesListPreparedView,
  ShezhireTreePreparedView,
} from '@/services/shezhire-view.types';

function uniqueRelatives(people: Array<Relative | null | undefined>): Relative[] {
  const seen = new Set<string>();
  const result: Relative[] = [];

  for (const person of people) {
    if (!person || seen.has(person.id)) {
      continue;
    }

    seen.add(person.id);
    result.push(person);
  }

  return result;
}

function collectFamilyRingMembers(ring: FamilyRing): Relative[] {
  return uniqueRelatives([
    ring.father,
    ring.mother,
    ring.spouse,
    ...ring.children,
    ...ring.siblings,
  ]);
}

function collectShezhireTreeMembers(
  rootGraph: ShezhireRootGraph,
  threeJurtGroups: JurtGroupsTree,
): Relative[] {
  const people: Array<Relative | null | undefined> = [
    rootGraph.root,
    ...rootGraph.parents,
    ...rootGraph.siblings,
    rootGraph.spouse,
    ...rootGraph.children,
  ];

  for (const group of [threeJurtGroups.oz, threeJurtGroups.nagashy, threeJurtGroups.kayin]) {
    if (group.subgroups) {
      for (const subgroup of group.subgroups) {
        for (const entry of subgroup.entries) {
          people.push(entry.person, ...entry.children);
        }

        people.push(...subgroup.extraRelatives);
      }
    }

    for (const entry of group.entries) {
      people.push(entry.person, ...entry.children);
    }

    people.push(...group.extraRelatives);
  }

  return uniqueRelatives(people);
}

/** Prepared shezhire tree data — screens render only, no graph math. */
export function prepareShezhireTreeView(
  rootPerson: Relative,
  relatives: Relative[],
  options: { excludeIds?: Set<string>; log?: boolean } = {},
): ShezhireTreePreparedView {
  const rootGraph = buildShezhireRootGraph(rootPerson, relatives, { log: options.log });
  const excludeIds = options.excludeIds ?? buildShezhireMainTreeExcludeIds(rootGraph);
  const threeJurtGroups = buildThreeJurtGroups(rootPerson, relatives, excludeIds);
  const members = collectShezhireTreeMembers(rootGraph, threeJurtGroups);
  const kinshipLabels = buildKinshipCardLineMap(rootPerson, members, relatives);

  return {
    rootGraph,
    threeJurtGroups,
    kinshipLabels,
  };
}

/** Prepared profile family ring + kinship labels from anchor root. */
export function prepareProfileFamilyView(
  person: Relative,
  relatives: Relative[],
  anchorPerson: Relative | null,
): ProfileFamilyPreparedView {
  const familyRing = resolveFamilyRing(person, relatives);

  if (!anchorPerson) {
    return { familyRing, kinshipLabels: new Map() };
  }

  const kinshipLabels = buildKinshipCardLineMap(
    anchorPerson,
    collectFamilyRingMembers(familyRing),
    relatives,
  );

  return { familyRing, kinshipLabels };
}

/** Prepared kinship labels for the relatives list. */
export function prepareRelativesListView(
  anchorPerson: Relative | null,
  relatives: Relative[],
): RelativesListPreparedView {
  if (!anchorPerson) {
    return { kinshipLabels: new Map() };
  }

  const targets = relatives.filter(
    (relative) => !relativeLinkIdsMatch(relative.id, anchorPerson.id),
  );

  return {
    kinshipLabels: buildKinshipCardLineMap(anchorPerson, targets, relatives),
  };
}

export function getPreparedKinshipLabel(
  kinshipLabels: KinshipLabelMap,
  rootPerson: Relative,
  relative: Relative,
): string {
  if (relativeLinkIdsMatch(rootPerson.id, relative.id)) {
    return '';
  }

  return kinshipLabels.get(relative.id) ?? '';
}

export type PreparedKinshipCardProps = {
  kinshipLine: string;
  kinshipAboveName?: boolean;
  hideRelationship?: boolean;
};

/** Shared kinship props for FamilyTreeCard — always from prepared label map. */
export function buildPreparedKinshipCardProps(
  kinshipLabels: KinshipLabelMap,
  rootPerson: Relative,
  relative: Relative,
  options: Pick<PreparedKinshipCardProps, 'kinshipAboveName' | 'hideRelationship'> = {},
): PreparedKinshipCardProps {
  return {
    kinshipLine: getPreparedKinshipLabel(kinshipLabels, rootPerson, relative),
    ...options,
  };
}

/** Confidence-safe card line for Shezhire cards — always from central kinship service. */
export function resolveShezhireKinshipCardLine(
  rootPerson: Relative,
  relative: Relative,
  allRelatives: Relative[],
): string {
  if (relativeLinkIdsMatch(rootPerson.id, relative.id)) {
    return '';
  }

  return getKinshipCardLine(rootPerson, relative, allRelatives);
}

/** Alias kept for jurt panel imports. */
export const resolveJurtKinshipCardLine = resolveShezhireKinshipCardLine;
