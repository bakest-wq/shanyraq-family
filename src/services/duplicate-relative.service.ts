import type { CreateRelativeInput, Relative } from '@/types/relative';

import {
  detectDuplicateRelatives,
  detectHighConfidenceDuplicateRelatives,
} from '@/services/duplicate-relative.engine';
import type {
  DuplicateRelativeDetectionResult,
  DuplicateRelativeMatch,
} from '@/services/duplicate-relative.types';

export type {
  DuplicateRelativeConfidence,
  DuplicateRelativeDetectionResult,
  DuplicateRelativeMatch,
  DuplicateRelativeSignal,
} from '@/services/duplicate-relative.types';

export {
  detectDuplicateRelatives,
  detectHighConfidenceDuplicateRelatives,
  fullNameSimilarity,
  resolveDuplicateConfidence,
  scoreDuplicateRelativePair,
} from '@/services/duplicate-relative.engine';

function toDetectionResult(matches: DuplicateRelativeMatch[]): DuplicateRelativeDetectionResult {
  const highMatches = matches.filter((match) => match.confidence === 'high');

  return {
    matches,
    hasHighConfidence: highMatches.length > 0,
    topMatch: highMatches[0] ?? matches[0] ?? null,
  };
}

export const duplicateRelativeService = {
  detect(input: CreateRelativeInput, relatives: Relative[], excludeRelativeId?: string) {
    return toDetectionResult(
      detectDuplicateRelatives(input, relatives, { excludeRelativeId }),
    );
  },

  detectHighConfidence(
    input: CreateRelativeInput,
    relatives: Relative[],
    excludeRelativeId?: string,
  ) {
    return toDetectionResult(
      detectHighConfidenceDuplicateRelatives(input, relatives, { excludeRelativeId }),
    );
  },
};

export function detectHighConfidenceDuplicates(
  input: CreateRelativeInput,
  relatives: Relative[],
  excludeRelativeId?: string,
): DuplicateRelativeDetectionResult {
  return duplicateRelativeService.detectHighConfidence(input, relatives, excludeRelativeId);
}
