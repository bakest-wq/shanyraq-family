import type { Relative } from '@/types/relative';

export type {
  JurtGroupsTree,
  JurtKind,
  JurtRelativeEntry,
  JurtSideGroup,
  OzJurtSubgroup,
  OzJurtSubgroupId,
  KayinJurtSubgroup,
  KayinJurtSubgroupId,
} from '@/utils/jurt-grouping';

export type {
  ShezhireGraphDisplaySections,
  ShezhireGraphParentSlots,
  ShezhireRootGraph,
} from '@/utils/shezhire/debugGraph';

/** Direct family ring around one person — structural only, no kinship labels. */
export type FamilyRing = {
  father: Relative | null;
  mother: Relative | null;
  spouse: Relative | null;
  children: Relative[];
  siblings: Relative[];
};
