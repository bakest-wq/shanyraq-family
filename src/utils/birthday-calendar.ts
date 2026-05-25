import { Relative } from '@/types/relative';
import { BIRTHDAY_MILESTONE_AGES, BIRTHDAY_UPCOMING_DAYS } from '@/constants/birthday-content';
import {
  daysUntilBirthdayForRelative,
  getAgeTurningOnNextBirthdayForRelative,
  hasBirthdayDayMonth,
  resolveBirthdayParts,
} from '@/utils/birthday-parts';
import { getMonthLabel } from '@/utils/dates';

export type BirthdayEntry = {
  relative: Relative;
  daysUntil: number;
};

export type MonthBirthdayGroup = {
  monthIndex: number;
  monthLabel: string;
  entries: BirthdayEntry[];
};

export type BirthdaySections = {
  today: BirthdayEntry[];
  upcoming: BirthdayEntry[];
  thisMonth: BirthdayEntry[];
  all: BirthdayEntry[];
  monthGroups: MonthBirthdayGroup[];
};

function compareEntries(a: BirthdayEntry, b: BirthdayEntry): number {
  if (a.daysUntil !== b.daysUntil) {
    return a.daysUntil - b.daysUntil;
  }

  return a.relative.fullName.localeCompare(b.relative.fullName, 'ru');
}

export function getRelativesWithBirthdays(
  relatives: Relative[],
  includeDeceased: boolean,
): Relative[] {
  return relatives.filter((relative) => {
    if (!hasBirthdayDayMonth(relative)) {
      return false;
    }

    if (!includeDeceased && relative.isDeceased) {
      return false;
    }

    return true;
  });
}

export function buildBirthdayEntries(
  relatives: Relative[],
  options?: {
    includeDeceased?: boolean;
    referenceDate?: Date;
  },
): BirthdayEntry[] {
  const referenceDate = options?.referenceDate ?? new Date();
  const includeDeceased = options?.includeDeceased ?? false;

  return getRelativesWithBirthdays(relatives, includeDeceased)
    .map((relative) => ({
      relative,
      daysUntil: daysUntilBirthdayForRelative(relative, referenceDate),
    }))
    .sort(compareEntries);
}

export function buildBirthdaySections(
  relatives: Relative[],
  options?: {
    includeDeceased?: boolean;
    referenceDate?: Date;
    upcomingDays?: number;
  },
): BirthdaySections {
  const referenceDate = options?.referenceDate ?? new Date();
  const upcomingDays = options?.upcomingDays ?? BIRTHDAY_UPCOMING_DAYS;
  const entries = buildBirthdayEntries(relatives, {
    includeDeceased: options?.includeDeceased,
    referenceDate,
  });

  const today = entries.filter((entry) => entry.daysUntil === 0);
  const todayIds = new Set(today.map((entry) => entry.relative.id));

  const upcoming = entries.filter(
    (entry) => entry.daysUntil >= 1 && entry.daysUntil <= upcomingDays,
  );
  const upcomingIds = new Set(upcoming.map((entry) => entry.relative.id));

  const currentMonth = referenceDate.getMonth();

  const thisMonth = entries.filter((entry) => {
    if (todayIds.has(entry.relative.id) || upcomingIds.has(entry.relative.id)) {
      return false;
    }

    const parts = resolveBirthdayParts(entry.relative);
    return parts?.month === currentMonth + 1;
  });

  const sectionIds = new Set([
    ...todayIds,
    ...upcomingIds,
    ...thisMonth.map((entry) => entry.relative.id),
  ]);

  const all = entries.filter((entry) => !sectionIds.has(entry.relative.id));

  return {
    today,
    upcoming,
    thisMonth,
    all,
    monthGroups: groupBirthdaysByMonth(all, referenceDate),
  };
}

export function getUpcomingBirthdayEntries(
  entries: BirthdayEntry[],
  maxDays = BIRTHDAY_UPCOMING_DAYS,
): BirthdayEntry[] {
  return entries.filter((entry) => entry.daysUntil >= 0 && entry.daysUntil <= maxDays);
}

export function groupBirthdaysByMonth(
  entries: BirthdayEntry[],
  referenceDate = new Date(),
): MonthBirthdayGroup[] {
  const currentMonth = referenceDate.getMonth();
  const monthOrder = Array.from({ length: 12 }, (_, index) => (currentMonth + index) % 12);

  const grouped = new Map<number, BirthdayEntry[]>();

  for (const entry of entries) {
    const parts = resolveBirthdayParts(entry.relative);
    if (!parts) {
      continue;
    }

    const monthIndex = parts.month - 1;
    const bucket = grouped.get(monthIndex) ?? [];
    bucket.push(entry);
    grouped.set(monthIndex, bucket);
  }

  return monthOrder
    .filter((monthIndex) => grouped.has(monthIndex))
    .map((monthIndex) => ({
      monthIndex,
      monthLabel: getMonthLabel(monthIndex),
      entries: (grouped.get(monthIndex) ?? []).sort((a, b) => {
        if (a.daysUntil !== b.daysUntil) {
          return a.daysUntil - b.daysUntil;
        }

        const partsA = resolveBirthdayParts(a.relative);
        const partsB = resolveBirthdayParts(b.relative);

        return (partsA?.day ?? 0) - (partsB?.day ?? 0);
      }),
    }));
}

export function hasBirthdayData(
  relatives: Relative[],
  includeDeceased = false,
): boolean {
  return getRelativesWithBirthdays(relatives, includeDeceased).length > 0;
}

export function getAgeTurningForEntry(entry: BirthdayEntry): number | null {
  return getAgeTurningOnNextBirthdayForRelative(entry.relative);
}

export function getMilestoneAge(entry: BirthdayEntry): number | null {
  const turning = getAgeTurningForEntry(entry);
  if (turning === null) {
    return null;
  }

  return BIRTHDAY_MILESTONE_AGES.includes(turning as (typeof BIRTHDAY_MILESTONE_AGES)[number])
    ? turning
    : null;
}

export function isMilestoneBirthday(entry: BirthdayEntry): boolean {
  return getMilestoneAge(entry) !== null;
}

export function getSmartReminderHint(daysUntil: number): 'today' | 'soon' | null {
  if (daysUntil === 0) {
    return 'today';
  }

  if (daysUntil >= 1 && daysUntil <= 7) {
    return 'soon';
  }

  return null;
}

/** @deprecated Use getLivingWithBirthdays via buildBirthdayEntries */
export function getLivingWithBirthdays(relatives: Relative[]): Relative[] {
  return getRelativesWithBirthdays(relatives, false);
}

export const UPCOMING_HIGHLIGHT_DAYS = BIRTHDAY_UPCOMING_DAYS;
