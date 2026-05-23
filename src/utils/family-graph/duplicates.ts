import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';
import type { FamilyGraph } from '@/utils/family-graph/graph';
import type { DuplicateCandidate, DuplicateSignal } from '@/utils/family-graph/types';

export type DuplicateDetectionOptions = {
  minScore?: number;
  excludeDeceased?: boolean;
};

const DEFAULT_MIN_SCORE = 3;

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizePhone(value?: string): string | null {
  if (!value?.trim()) {
    return null;
  }

  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 ? digits : null;
}

function birthdayKey(relative: Relative): string | null {
  if (relative.birthdayYear != null) {
    const month = relative.birthdayMonth ?? 0;
    const day = relative.birthdayDay ?? 0;
    return `${relative.birthdayYear}-${month}-${day}`;
  }

  if (relative.birthday?.trim()) {
    return normalizeName(relative.birthday);
  }

  return null;
}

function comparePair(
  left: Relative,
  right: Relative,
): { score: number; signals: DuplicateSignal[]; reason: string } | null {
  if (relativeLinkIdsMatch(left.id, right.id)) {
    return null;
  }

  const signals: DuplicateSignal[] = [];
  let score = 0;

  const leftName = normalizeName(getRelativeDisplayName(left));
  const rightName = normalizeName(getRelativeDisplayName(right));

  if (leftName && leftName === rightName) {
    signals.push('name');
    score += 2;
  }

  const leftBirthday = birthdayKey(left);
  const rightBirthday = birthdayKey(right);
  if (leftBirthday && rightBirthday && leftBirthday === rightBirthday) {
    signals.push('birthday');
    score += 2;
  }

  const leftPhone = normalizePhone(left.phone);
  const rightPhone = normalizePhone(right.phone);
  if (leftPhone && rightPhone && leftPhone === rightPhone) {
    signals.push('phone');
    score += 3;
  }

  if (
    left.relationship.trim() === right.relationship.trim() &&
    leftName === rightName
  ) {
    signals.push('relationship');
    score += 1;
  }

  if (score < DEFAULT_MIN_SCORE) {
    return null;
  }

  const reasonParts: string[] = [];
  if (signals.includes('name')) {
    reasonParts.push('бірдей аты');
  }
  if (signals.includes('birthday')) {
    reasonParts.push('бірдей туған күні');
  }
  if (signals.includes('phone')) {
    reasonParts.push('бірдей телефон');
  }

  return {
    score,
    signals,
    reason: reasonParts.join(', ') || 'ұқсас профиль',
  };
}

export function findDuplicateCandidates(
  graph: FamilyGraph,
  options: DuplicateDetectionOptions = {},
): DuplicateCandidate[] {
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
  const relatives = options.excludeDeceased
    ? graph.relatives.filter((relative) => !relative.isDeceased)
    : graph.relatives;

  const candidates: DuplicateCandidate[] = [];

  for (let index = 0; index < relatives.length; index += 1) {
    for (let inner = index + 1; inner < relatives.length; inner += 1) {
      const left = relatives[index];
      const right = relatives[inner];
      const match = comparePair(left, right);

      if (!match || match.score < minScore) {
        continue;
      }

      candidates.push({
        leftId: left.id,
        rightId: right.id,
        score: match.score,
        signals: match.signals,
        reason: match.reason,
      });
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}

export function findDuplicatesForRelative(
  graph: FamilyGraph,
  relativeId: string,
  options?: DuplicateDetectionOptions,
): DuplicateCandidate[] {
  return findDuplicateCandidates(graph, options).filter(
    (candidate) =>
      relativeLinkIdsMatch(candidate.leftId, relativeId) ||
      relativeLinkIdsMatch(candidate.rightId, relativeId),
  );
}
