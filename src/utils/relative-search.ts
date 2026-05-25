import type { Relative } from '@/types/relative';
import {
  daysUntilBirthdayForRelative,
  hasBirthdayDayMonth,
} from '@/utils/birthday-parts';
import { sortRelativesBySmartPriority } from '@/services/relative-priority-sort';
import { getKinshipCardLine } from '@/services/kinship.service';
import { getRelativeDisplayName } from '@/utils/relative-names';

export type RelativeSearchContext = {
  anchorPerson?: Relative | null;
  allRelatives?: Relative[];
  /** When provided, search uses the same prepared labels as list/tree screens. */
  kinshipLabels?: ReadonlyMap<string, string>;
};

function resolveKinshipSearchLabel(
  relative: Relative,
  context?: RelativeSearchContext,
): string {
  if (!context?.anchorPerson || !context?.allRelatives) {
    return '';
  }

  if (context.anchorPerson.id === relative.id) {
    return '';
  }

  const prepared = context.kinshipLabels?.get(relative.id);
  if (prepared !== undefined) {
    return prepared;
  }

  return getKinshipCardLine(context.anchorPerson, relative, context.allRelatives);
}

export function buildRelativeSearchHaystack(
  relative: Relative,
  context?: RelativeSearchContext,
): string {
  const parts = [
    relative.fullName,
    relative.firstName,
    relative.middleName,
    relative.currentSurname,
    relative.birthSurname,
    relative.displayName,
    relative.relationship,
    getRelativeDisplayName(relative),
  ];

  const kinshipLabel = resolveKinshipSearchLabel(relative, context);
  if (kinshipLabel) {
    parts.push(kinshipLabel);
  }

  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function getRelativeSearchMatchScore(
  relative: Relative,
  query: string,
  context?: RelativeSearchContext,
): number {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return 0;
  }

  const displayName = getRelativeDisplayName(relative).toLowerCase();
  const nickname = relative.displayName?.trim().toLowerCase() ?? '';
  const fullName = relative.fullName.trim().toLowerCase();
  const firstName = relative.firstName.trim().toLowerCase();

  if (displayName === normalized || fullName === normalized || firstName === normalized) {
    return 120;
  }

  if (displayName.startsWith(normalized) || firstName.startsWith(normalized)) {
    return 100;
  }

  if (nickname && nickname.startsWith(normalized)) {
    return 95;
  }

  if (displayName.includes(normalized) || fullName.includes(normalized)) {
    return 70;
  }

  if (nickname && nickname.includes(normalized)) {
    return 65;
  }

  const kinshipLabel = resolveKinshipSearchLabel(relative, context).toLowerCase();

  if (kinshipLabel && kinshipLabel.startsWith(normalized)) {
    return 60;
  }

  if (kinshipLabel && kinshipLabel.includes(normalized)) {
    return 45;
  }

  if (relative.relationship?.toLowerCase().includes(normalized)) {
    return 35;
  }

  return buildRelativeSearchHaystack(relative, context).includes(normalized) ? 20 : 0;
}

export function matchesRelativeSearch(
  relative: Relative,
  query: string,
  context?: RelativeSearchContext,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return getRelativeSearchMatchScore(relative, normalized, context) > 0;
}

export function sortRelativesForDisplay(
  relatives: Relative[],
  referenceDate = new Date(),
  context?: RelativeSearchContext,
): Relative[] {
  if (context?.anchorPerson && context.allRelatives) {
    return sortRelativesBySmartPriority(context.anchorPerson, relatives, {
      allRelatives: context.allRelatives,
    });
  }

  return [...relatives].sort((left, right) => {
    const daysLeft = hasBirthdayDayMonth(left)
      ? daysUntilBirthdayForRelative(left, referenceDate)
      : 9999;
    const daysRight = hasBirthdayDayMonth(right)
      ? daysUntilBirthdayForRelative(right, referenceDate)
      : 9999;

    if (daysLeft !== daysRight) {
      return daysLeft - daysRight;
    }

    return getRelativeDisplayName(left).localeCompare(getRelativeDisplayName(right), 'kk');
  });
}

export function sortRelativesForSearch(
  relatives: Relative[],
  query: string,
  context?: RelativeSearchContext,
): Relative[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return sortRelativesForDisplay(relatives, new Date(), context);
  }

  return [...relatives].sort((left, right) => {
    const scoreLeft = getRelativeSearchMatchScore(left, normalized, context);
    const scoreRight = getRelativeSearchMatchScore(right, normalized, context);

    if (scoreLeft !== scoreRight) {
      return scoreRight - scoreLeft;
    }

    if (context?.anchorPerson && context.allRelatives) {
      const [first] = sortRelativesBySmartPriority(context.anchorPerson, [left, right], {
        allRelatives: context.allRelatives,
      });
      if (first.id === left.id) {
        return -1;
      }
      if (first.id === right.id) {
        return 1;
      }
    }

    return getRelativeDisplayName(left).localeCompare(getRelativeDisplayName(right), 'kk');
  });
}

export function searchRelatives(
  relatives: Relative[],
  query: string,
  context?: RelativeSearchContext,
): Relative[] {
  const normalized = query.trim();
  if (!normalized) {
    return sortRelativesForDisplay(relatives, new Date(), context);
  }

  const matches = relatives.filter((relative) =>
    matchesRelativeSearch(relative, normalized, context),
  );

  return sortRelativesForSearch(matches, normalized, context);
}
