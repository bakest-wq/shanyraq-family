import { kk, FAMILY_LANGUAGE } from '@/content/family-language';

export const FAMILY_SEARCH_COPY = {
  placeholder: kk(FAMILY_LANGUAGE.search.placeholder),
  recentTitle: kk(FAMILY_LANGUAGE.search.recentTitle),
  recentHint: kk(FAMILY_LANGUAGE.search.recentHint),
  resultsTitle: kk(FAMILY_LANGUAGE.search.resultsTitle),
  allTitle: kk(FAMILY_LANGUAGE.search.allTitle),
  allHint: kk(FAMILY_LANGUAGE.search.allHint),
  noResultsTitle: kk(FAMILY_LANGUAGE.empty.searchNoMatch),
  noResultsHint: kk(FAMILY_LANGUAGE.empty.searchNoMatchHint),
  reset: kk(FAMILY_LANGUAGE.search.reset),
  openProfile: kk(FAMILY_LANGUAGE.search.openProfile),
  filterAll: kk(FAMILY_LANGUAGE.search.filterAll),
  filterBirthday: kk(FAMILY_LANGUAGE.search.filterBirthday),
  filterDeceased: kk(FAMILY_LANGUAGE.search.filterDeceased),
} as const;
