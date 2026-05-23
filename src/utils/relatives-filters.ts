import { Relative } from '@/types/relative';
import {
  daysUntilBirthdayForRelative,
  hasBirthdayDayMonth,
} from '@/utils/birthday-parts';
import { getRelativeDisplayName } from '@/utils/relative-names';

export type RelativeFilter = 'all' | 'birthday' | 'deceased';

const UPCOMING_BIRTHDAY_WINDOW_DAYS = 31;

export function filterRelatives(
  relatives: Relative[],
  searchQuery: string,
  filter: RelativeFilter,
  referenceDate = new Date(),
): Relative[] {
  let result = [...relatives];

  if (filter === 'deceased') {
    result = result.filter((relative) => relative.isDeceased);
  } else if (filter === 'birthday') {
    result = result.filter(
      (relative) =>
        !relative.isDeceased &&
        hasBirthdayDayMonth(relative) &&
        daysUntilBirthdayForRelative(relative, referenceDate) <= UPCOMING_BIRTHDAY_WINDOW_DAYS,
    );
  } else {
    result = result.filter((relative) => !relative.isDeceased);
  }

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    result = result.filter((relative) => {
      const haystack = [
        relative.fullName,
        relative.displayName,
        relative.firstName,
        relative.middleName,
        relative.currentSurname,
        relative.relationship,
        getRelativeDisplayName(relative),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  result.sort((a, b) => {
    const daysA = hasBirthdayDayMonth(a)
      ? daysUntilBirthdayForRelative(a, referenceDate)
      : 9999;
    const daysB = hasBirthdayDayMonth(b)
      ? daysUntilBirthdayForRelative(b, referenceDate)
      : 9999;

    if (daysA !== daysB) {
      return daysA - daysB;
    }

    return a.fullName.localeCompare(b.fullName, 'ru');
  });

  return result;
}

export const RELATIVE_FILTERS: { id: RelativeFilter; label: string }[] = [
  { id: 'all', label: 'Барлығы · Все' },
  { id: 'birthday', label: 'Туған күн · ДР' },
  { id: 'deceased', label: 'Марқұм · Умершие' },
];
