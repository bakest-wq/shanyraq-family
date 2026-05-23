import { Relative } from '@/types/relative';
import {
  daysUntilBirthdayForRelative,
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

const UPCOMING_HIGHLIGHT_DAYS = 14;

export function getLivingWithBirthdays(relatives: Relative[]): Relative[] {
  return relatives.filter(
    (relative) => !relative.isDeceased && hasBirthdayDayMonth(relative),
  );
}

export function buildBirthdayEntries(
  relatives: Relative[],
  referenceDate = new Date(),
): BirthdayEntry[] {
  return getLivingWithBirthdays(relatives)
    .map((relative) => ({
      relative,
      daysUntil: daysUntilBirthdayForRelative(relative, referenceDate),
    }))
    .sort((a, b) => {
      if (a.daysUntil !== b.daysUntil) {
        return a.daysUntil - b.daysUntil;
      }

      return a.relative.fullName.localeCompare(b.relative.fullName, 'ru');
    });
}

export function getUpcomingBirthdayEntries(
  entries: BirthdayEntry[],
  maxDays = UPCOMING_HIGHLIGHT_DAYS,
): BirthdayEntry[] {
  return entries.filter((entry) => entry.daysUntil <= maxDays);
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

export function hasBirthdayData(relatives: Relative[]): boolean {
  return getLivingWithBirthdays(relatives).length > 0;
}
