import type { Relative } from '@/types/relative';

/** Structural edge used for graph traversal — internal only. */
export type RelationshipPathEdgeKind = 'parent' | 'child' | 'spouse';

export type RelationshipPathStep = {
  person: Relative;
  edgeKind: RelationshipPathEdgeKind;
  /** Semantic Kazakh label from the previous person in the chain. */
  stepLabel: string;
};

/** Shortest structural path snapshot — never shown raw to users. */
export type RelationshipPathResult = {
  steps: RelationshipPathStep[];
  hopCount: number;
  resolved: boolean;
  truncated: boolean;
};

export type RelationshipPathEngineOptions = {
  maxHops?: number;
};
