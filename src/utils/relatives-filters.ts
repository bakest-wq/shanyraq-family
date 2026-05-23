import { Relative } from '@/types/relative';
import { daysUntilBirthday, hasBirthday } from '@/utils/dates';

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
        hasBirthday(relative.birthday) &&
        daysUntilBirthday(relative.birthday, referenceDate) <= UPCOMING_BIRTHDAY_WINDOW_DAYS,
    );
  }

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    result = result.filter((relative) => relative.fullName.toLowerCase().includes(query));
  }

  return sortRelatives(result, referenceDate);
}

function sortRelatives(relatives: Relative[], referenceDate: Date): Relative[] {
  return [...relatives].sort((a, b) => {
    if (a.isDeceased !== b.isDeceased) {
      return a.isDeceased ? 1 : -1;
    }

    const daysA = hasBirthday(a.birthday) ? daysUntilBirthday(a.birthday, referenceDate) : 9999;
    const daysB = hasBirthday(b.birthday) ? daysUntilBirthday(b.birthday, referenceDate) : 9999;

    if (daysA !== daysB) {
      return daysA - daysB;
    }

    return a.fullName.localeCompare(b.fullName, 'ru');
  });
}

export const RELATIVE_FILTERS: { id: RelativeFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'birthday', label: 'Туған күн' },
  { id: 'deceased', label: 'Марқұм' },
];
