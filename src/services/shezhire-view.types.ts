import type { FamilyRing, JurtGroupsTree, ShezhireRootGraph } from '@/services/family-graph.types';

export type KinshipLabelMap = ReadonlyMap<string, string>;

export type ShezhireTreePreparedView = {
  rootGraph: ShezhireRootGraph;
  threeJurtGroups: JurtGroupsTree;
  kinshipLabels: KinshipLabelMap;
};

export type ProfileFamilyPreparedView = {
  familyRing: FamilyRing;
  kinshipLabels: KinshipLabelMap;
};

export type RelativesListPreparedView = {
  kinshipLabels: KinshipLabelMap;
};
