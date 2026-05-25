import { FAMILY_SEARCH_COPY } from '@/constants/family-search-content';
import { Relative } from '@/types/relative';
import {
  daysUntilBirthdayForRelative,
  hasBirthdayDayMonth,
} from '@/utils/birthday-parts';
import {
  RelativeSearchContext,
  searchRelatives,
  sortRelativesForDisplay,
} from '@/utils/relative-search';

export type RelativeFilter = 'all' | 'birthday' | 'deceased';

const UPCOMING_BIRTHDAY_WINDOW_DAYS = 31;

export function filterRelatives(
  relatives: Relative[],
  searchQuery: string,
  filter: RelativeFilter,
  referenceDate = new Date(),
  searchContext?: RelativeSearchContext,
): Relative[] {
  const query = searchQuery.trim();

  if (query) {
    return searchRelatives(relatives, query, searchContext);
  }

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

  return sortRelativesForDisplay(result, referenceDate, searchContext);
}

export const RELATIVE_FILTERS: { id: RelativeFilter; label: string }[] = [
  { id: 'all', label: FAMILY_SEARCH_COPY.filterAll },
  { id: 'birthday', label: FAMILY_SEARCH_COPY.filterBirthday },
  { id: 'deceased', label: FAMILY_SEARCH_COPY.filterDeceased },
];
