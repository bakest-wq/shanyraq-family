import type { Relative } from '@/types/relative';

export type FamilyLinkField = 'fatherId' | 'motherId' | 'spouseId';

export type FamilyLinkSnapshot = {
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
};

export type GraphIntegritySeverity = 'error' | 'warning';

export type GraphIntegrityCode =
  | 'self_link'
  | 'ancestor_cycle'
  | 'broken_link'
  | 'spouse_mismatch'
  | 'same_parent_pair'
  | 'parent_spouse_conflict'
  | 'gender_parent_mismatch';

export type GraphIntegrityIssue = {
  code: GraphIntegrityCode;
  severity: GraphIntegritySeverity;
  relativeId: string;
  field?: FamilyLinkField;
  relatedId?: string;
  message: string;
};

export type GraphIntegrityReport = {
  issues: GraphIntegrityIssue[];
  isValid: boolean;
  errorCount: number;
  warningCount: number;
};

export type DuplicateSignal = 'name' | 'birthday' | 'phone' | 'relationship';

export type DuplicateCandidate = {
  leftId: string;
  rightId: string;
  score: number;
  signals: DuplicateSignal[];
  reason: string;
};

export type SafeDeleteImpact = {
  childrenLosingParentLink: Relative[];
  spouseToClear: Relative | null;
  descendantCount: number;
};

export type SafeDeletePlan = {
  relativeId: string;
  canDelete: boolean;
  blockingIssues: GraphIntegrityIssue[];
  impact: SafeDeleteImpact;
  preDeletePatches: Array<{
    personId: string;
    patch: Partial<FamilyLinkSnapshot>;
  }>;
};

export type FamilyGraphDerived = {
  childrenById: Map<string, Relative[]>;
  parentIdsById: Map<string, { fatherId?: string; motherId?: string }>;
  spouseById: Map<string, Relative | null>;
  unlinkedIds: string[];
  roots: Relative[];
};

export type GraphRepairPatch = {
  personId: string;
  patch: Partial<FamilyLinkSnapshot>;
  reason: string;
};

export type AgeOrder = 'older' | 'younger' | 'same' | 'unknown';
