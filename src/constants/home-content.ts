import { kk, FAMILY_LANGUAGE } from '@/content/family-language';

export const HOME_COPY = {
  greetingSalam: kk(FAMILY_LANGUAGE.home.greetingSalam),
  wisdomQuote: kk(FAMILY_LANGUAGE.home.wisdomQuote),
  birthdaysTitle: kk(FAMILY_LANGUAGE.home.birthdaysTitle),
  birthdaysHint: kk(FAMILY_LANGUAGE.home.birthdaysHint),
  birthdaysToday: kk(FAMILY_LANGUAGE.home.birthdaysToday),
  birthdaysSeeAll: kk(FAMILY_LANGUAGE.home.birthdaysSeeAll),
  birthdaysEmpty: kk(FAMILY_LANGUAGE.empty.homeBirthdays),
  memoriesTitle: kk(FAMILY_LANGUAGE.home.memoriesTitle),
  memoriesHint: kk(FAMILY_LANGUAGE.home.memoriesHint),
  memoriesEmpty: kk(FAMILY_LANGUAGE.home.memoriesEmpty),
  memoriesSeeAll: kk(FAMILY_LANGUAGE.home.memoriesSeeAll),
  remindersTitle: kk(FAMILY_LANGUAGE.home.remindersTitle),
  remindersHint: kk(FAMILY_LANGUAGE.home.remindersHint),
  reminderEmpty: kk(FAMILY_LANGUAGE.home.reminderEmpty),
  seeMore: kk(FAMILY_LANGUAGE.home.seeMore),
  summaryGrowing: kk(FAMILY_LANGUAGE.home.summaryGrowing),
  summaryEmpty: kk(FAMILY_LANGUAGE.home.summaryEmpty),
} as const;

export function homeSummaryRelatives(count: number): string {
  return kk(FAMILY_LANGUAGE.home.summaryRelatives).replace('{count}', String(count));
}

export function homeSummaryMemories(count: number): string {
  return kk(FAMILY_LANGUAGE.home.summaryMemories).replace('{count}', String(count));
}

export function homeSummaryDeceased(count: number): string {
  return kk(FAMILY_LANGUAGE.home.summaryDeceased).replace('{count}', String(count));
}

export function homeReminderBirthdayToday(name: string): string {
  return kk(FAMILY_LANGUAGE.home.reminderBirthdayToday).replace('{name}', name);
}

export function homeReminderIncompleteLink(name: string): string {
  return kk(FAMILY_LANGUAGE.home.reminderIncompleteLink).replace('{name}', name);
}

export function homeReminderMemorial(count: number): string {
  return kk(FAMILY_LANGUAGE.home.reminderMemorial).replace('{count}', String(count));
}
