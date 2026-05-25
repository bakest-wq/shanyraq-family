export type DuplicateRelativeSignal =
  | 'full_name'
  | 'birth_year'
  | 'parent_link'
  | 'spouse_link';

export type DuplicateRelativeConfidence = 'high' | 'medium' | 'low';

export type DuplicateRelativeMatch = {
  relativeId: string;
  displayName: string;
  confidence: DuplicateRelativeConfidence;
  score: number;
  signals: DuplicateRelativeSignal[];
  reason: string;
};

export type DuplicateRelativeDetectionResult = {
  matches: DuplicateRelativeMatch[];
  hasHighConfidence: boolean;
  topMatch: DuplicateRelativeMatch | null;
};

export const DUPLICATE_RELATIVE_HIGH_CONFIDENCE_THRESHOLD = 6;
