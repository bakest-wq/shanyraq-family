import type { CreateRelativeInput, Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { composeDisplayName, composeFullName, getRelativeDisplayName } from '@/utils/relative-names';

import type {
  DuplicateRelativeConfidence,
  DuplicateRelativeMatch,
  DuplicateRelativeSignal,
} from '@/services/duplicate-relative.types';
import { DUPLICATE_RELATIVE_HIGH_CONFIDENCE_THRESHOLD } from '@/services/duplicate-relative.types';

const NAME_SIMILAR_THRESHOLD = 0.85;
const NAME_PARTIAL_THRESHOLD = 0.72;

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function tokenSet(value: string): Set<string> {
  return new Set(
    normalizeName(value)
      .split(' ')
      .map((token) => token.trim())
      .filter(Boolean),
  );
}

/** Token Jaccard similarity — lightweight full-name comparison. */
export function fullNameSimilarity(left: string, right: string): number {
  const normalizedLeft = normalizeName(left);
  const normalizedRight = normalizeName(right);

  if (!normalizedLeft || !normalizedRight) {
    return 0;
  }

  if (normalizedLeft === normalizedRight) {
    return 1;
  }

  const leftTokens = tokenSet(normalizedLeft);
  const rightTokens = tokenSet(normalizedRight);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = leftTokens.size + rightTokens.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function collectInputNames(input: CreateRelativeInput): string[] {
  const names = new Set<string>();

  for (const value of [
    input.fullName,
    input.firstName,
    input.displayName,
    composeFullName(input),
    composeDisplayName(input),
  ]) {
    if (value?.trim()) {
      names.add(value.trim());
    }
  }

  return [...names];
}

function collectExistingNames(relative: Relative): string[] {
  const names = new Set<string>();

  for (const value of [relative.fullName, relative.firstName, relative.displayName, getRelativeDisplayName(relative)]) {
    if (value?.trim()) {
      names.add(value.trim());
    }
  }

  return [...names];
}

function bestNameSimilarity(input: CreateRelativeInput, existing: Relative): number {
  const inputNames = collectInputNames(input);
  const existingNames = collectExistingNames(existing);

  if (inputNames.length === 0 || existingNames.length === 0) {
    return 0;
  }

  let best = 0;

  for (const left of inputNames) {
    for (const right of existingNames) {
      best = Math.max(best, fullNameSimilarity(left, right));
    }
  }

  return best;
}

function linksMatch(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  if (!left?.trim() || !right?.trim()) {
    return false;
  }

  return relativeLinkIdsMatch(left, right);
}

function scoreNameSimilarity(
  similarity: number,
  signals: DuplicateRelativeSignal[],
): number {
  if (similarity >= 1) {
    signals.push('full_name');
    return 3;
  }

  if (similarity >= NAME_SIMILAR_THRESHOLD) {
    signals.push('full_name');
    return 2;
  }

  if (similarity >= NAME_PARTIAL_THRESHOLD) {
    signals.push('full_name');
    return 1;
  }

  return 0;
}

function scoreBirthYear(
  input: CreateRelativeInput,
  existing: Relative,
  signals: DuplicateRelativeSignal[],
): number {
  if (input.birthdayYearUnknown || existing.birthdayYearUnknown) {
    return 0;
  }

  if (input.birthdayYear == null || existing.birthdayYear == null) {
    return 0;
  }

  if (input.birthdayYear !== existing.birthdayYear) {
    return 0;
  }

  signals.push('birth_year');
  return 3;
}

function scoreParentLinks(
  input: CreateRelativeInput,
  existing: Relative,
  signals: DuplicateRelativeSignal[],
): number {
  let score = 0;
  let fatherMatch = false;
  let motherMatch = false;

  if (linksMatch(input.fatherId, existing.fatherId)) {
    fatherMatch = true;
    score += 2;
  }

  if (linksMatch(input.motherId, existing.motherId)) {
    motherMatch = true;
    score += 2;
  }

  if (score > 0) {
    signals.push('parent_link');
  }

  if (fatherMatch && motherMatch) {
    score += 2;
  }

  return score;
}

function scoreSpouseLink(
  input: CreateRelativeInput,
  existing: Relative,
  signals: DuplicateRelativeSignal[],
): number {
  if (!linksMatch(input.spouseId, existing.spouseId)) {
    return 0;
  }

  signals.push('spouse_link');
  return 3;
}

function buildReason(signals: DuplicateRelativeSignal[]): string {
  const parts: string[] = [];

  if (signals.includes('full_name')) {
    parts.push('ұқсас аты');
  }

  if (signals.includes('birth_year')) {
    parts.push('бірдей туған жылы');
  }

  if (signals.includes('parent_link')) {
    parts.push('бірдей ата-ана байланысы');
  }

  if (signals.includes('spouse_link')) {
    parts.push('бірдей жұбай байланысы');
  }

  return parts.join(', ') || 'ұқсас профиль';
}

export function resolveDuplicateConfidence(
  score: number,
  signals: DuplicateRelativeSignal[],
  nameSimilarity: number,
): DuplicateRelativeConfidence {
  const hasName = signals.includes('full_name');
  const hasBirthYear = signals.includes('birth_year');
  const hasParents = signals.includes('parent_link');
  const hasSpouse = signals.includes('spouse_link');

  if (score >= DUPLICATE_RELATIVE_HIGH_CONFIDENCE_THRESHOLD) {
    return 'high';
  }

  if (hasName && hasBirthYear && nameSimilarity >= NAME_SIMILAR_THRESHOLD) {
    return 'high';
  }

  if (hasName && hasParents && nameSimilarity >= NAME_SIMILAR_THRESHOLD) {
    return 'high';
  }

  if (hasSpouse && (hasName || hasBirthYear)) {
    return 'high';
  }

  if (score >= 4) {
    return 'medium';
  }

  return 'low';
}

export function scoreDuplicateRelativePair(
  input: CreateRelativeInput,
  existing: Relative,
): DuplicateRelativeMatch | null {
  const signals: DuplicateRelativeSignal[] = [];
  const nameSimilarity = bestNameSimilarity(input, existing);

  let score = 0;
  score += scoreNameSimilarity(nameSimilarity, signals);
  score += scoreBirthYear(input, existing, signals);
  score += scoreParentLinks(input, existing, signals);
  score += scoreSpouseLink(input, existing, signals);

  if (score === 0) {
    return null;
  }

  const confidence = resolveDuplicateConfidence(score, signals, nameSimilarity);

  return {
    relativeId: existing.id,
    displayName: getRelativeDisplayName(existing),
    confidence,
    score,
    signals,
    reason: buildReason(signals),
  };
}

export function detectDuplicateRelatives(
  input: CreateRelativeInput,
  relatives: Relative[],
  options?: { excludeRelativeId?: string; minConfidence?: DuplicateRelativeConfidence },
): DuplicateRelativeMatch[] {
  const minConfidence = options?.minConfidence ?? 'low';
  const confidenceRank: Record<DuplicateRelativeConfidence, number> = {
    low: 0,
    medium: 1,
    high: 2,
  };

  const matches: DuplicateRelativeMatch[] = [];

  for (const relative of relatives) {
    if (
      options?.excludeRelativeId &&
      relativeLinkIdsMatch(relative.id, options.excludeRelativeId)
    ) {
      continue;
    }

    const match = scoreDuplicateRelativePair(input, relative);
    if (!match) {
      continue;
    }

    if (confidenceRank[match.confidence] < confidenceRank[minConfidence]) {
      continue;
    }

    matches.push(match);
  }

  return matches.sort((left, right) => right.score - left.score);
}

export function detectHighConfidenceDuplicateRelatives(
  input: CreateRelativeInput,
  relatives: Relative[],
  options?: { excludeRelativeId?: string },
): DuplicateRelativeMatch[] {
  return detectDuplicateRelatives(input, relatives, {
    ...options,
    minConfidence: 'high',
  });
}
