import type { Relative } from '@/types/relative';
import type { KinshipConfidence, KinshipType, ThreeJurtGroup } from '@/services/kinship/types';

/** Lab category — maps to user-facing kinship families under test. */
export type KinshipLabCategory =
  | 'kayin'
  | 'nagashy'
  | 'kuda'
  | 'bole'
  | 'jenge'
  | 'jezde'
  | 'zhien';

export type KinshipLabFamily = {
  id: string;
  label: string;
  members: Record<string, Relative>;
  relatives: Relative[];
};

export type KinshipLabMatrixRow = {
  id: string;
  familyId: string;
  category: KinshipLabCategory;
  rootKey: string;
  targetKey: string;
  expectedType: KinshipType;
  expectedJurt?: ThreeJurtGroup;
  cardLinePattern?: RegExp;
  explanationPattern?: RegExp;
  minConfidence?: KinshipConfidence;
  note?: string;
};

export type KinshipLabRootSwitchRow = {
  id: string;
  familyId: string;
  targetKey: string;
  cases: Array<{
    rootKey: string;
    expectedType: KinshipType;
    expectedJurt?: ThreeJurtGroup;
  }>;
};

export type KinshipLabFailure = {
  rowId: string;
  message: string;
};

export type KinshipLabReport = {
  passed: number;
  failed: number;
  failures: KinshipLabFailure[];
};

export const KINSHIP_LAB_CATEGORIES: KinshipLabCategory[] = [
  'kayin',
  'nagashy',
  'kuda',
  'bole',
  'jenge',
  'jezde',
  'zhien',
];
