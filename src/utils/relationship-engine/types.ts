export type CoreRelationshipType =
  | 'father'
  | 'mother'
  | 'son'
  | 'daughter'
  | 'brother'
  | 'sister'
  | 'grandfather'
  | 'grandmother'
  | 'grandson'
  | 'granddaughter'
  | 'spouse'
  | 'self'
  | 'unknown';

/** Culturally important Kazakh kinship terms (MVP graph rules). */
export type AdvancedRelationshipType =
  | 'zhien'
  | 'bole'
  | 'nemere'
  | 'nagashy'
  | 'kayin_jurt'
  | 'kelin'
  | 'kuyeu_bala';

export type RelationshipType = CoreRelationshipType | AdvancedRelationshipType;

export type RelationshipLabel = {
  kazakh: string;
  russian: string;
};

export type RelationshipResult = {
  type: RelationshipType;
  category: 'core' | 'advanced';
  label: RelationshipLabel;
  /** Full sentence path, e.g. «Ерлан — әкеңіздің әпкесінің ұлы». */
  path?: RelationshipLabel;
  /** Shown when links are missing or relation is only partially inferred. */
  hint?: RelationshipLabel;
  resolved: boolean;
};
