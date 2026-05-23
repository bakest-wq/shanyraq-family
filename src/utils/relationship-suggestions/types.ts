import type { ConnectParentsInput } from '@/types/relative';

export type SuggestionKind =
  | 'link_spouse_from_coparents'
  | 'link_missing_parent_from_spouse'
  | 'link_child_to_parent'
  | 'link_spouse_reciprocal'
  | 'note_shared_parents';

export type RelationshipSuggestionAction =
  | {
      type: 'patch_links';
      personId: string;
      patch: Partial<ConnectParentsInput>;
    }
  | {
      type: 'patch_links_pair';
      primaryId: string;
      primaryPatch: Partial<ConnectParentsInput>;
      secondaryId: string;
      secondaryPatch: Partial<ConnectParentsInput>;
    };

export type RelationshipSuggestion = {
  id: string;
  kind: SuggestionKind;
  /** Short missing-link context, e.g. «Ана байланысы жоқ» */
  contextKz: string;
  /** Compact action prompt, e.g. «Мадинаны ана ретінде байланыстыру?» */
  promptKz: string;
  /** @deprecated Use promptKz — kept for internal compatibility */
  messageKz: string;
  messageRu: string;
  subjectId?: string;
  relatedIds: string[];
  action: RelationshipSuggestionAction;
  priority: number;
};

export type RelationshipBadge = {
  id: string;
  labelKz: string;
  labelRu: string;
  tone: 'gold' | 'green' | 'cream';
};

export type AnalyzeSuggestionsContext = {
  subjectId?: string;
  draftFatherId?: string | null;
  draftMotherId?: string | null;
  draftSpouseId?: string | null;
};
