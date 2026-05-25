import { kk, FAMILY_LANGUAGE } from '@/content/family-language';

export const EMPTY_STATE_COPY = {
  sectionIncomplete: kk(FAMILY_LANGUAGE.empty.sectionIncomplete),
  startFirstRelative: kk(FAMILY_LANGUAGE.empty.startFirstRelative),
  startFamilyHistory: kk(FAMILY_LANGUAGE.empty.startFamilyHistory),
  startFirstMemory: kk(FAMILY_LANGUAGE.empty.startFirstMemory),
  backAction: kk(FAMILY_LANGUAGE.empty.backAction),
  relatives: {
    title: kk(FAMILY_LANGUAGE.empty.relatives),
    hint: kk(FAMILY_LANGUAGE.empty.relativesHint),
    action: kk(FAMILY_LANGUAGE.empty.relativesAction),
  },
  familyTree: {
    title: kk(FAMILY_LANGUAGE.empty.familyTree),
    hint: kk(FAMILY_LANGUAGE.empty.familyTreeHint),
    action: kk(FAMILY_LANGUAGE.empty.relativesAction),
    partialHint: kk(FAMILY_LANGUAGE.empty.familyTreePartialHint),
  },
  timeline: {
    title: kk(FAMILY_LANGUAGE.empty.timeline),
    hint: kk(FAMILY_LANGUAGE.empty.timelineHint),
    action: kk(FAMILY_LANGUAGE.empty.timelineAction),
  },
  memories: {
    title: kk(FAMILY_LANGUAGE.empty.memories),
    hint: kk(FAMILY_LANGUAGE.empty.memoriesHint),
    action: kk(FAMILY_LANGUAGE.empty.memoriesAction),
    filteredTitle: kk(FAMILY_LANGUAGE.empty.memoriesFiltered),
    filteredHint: kk(FAMILY_LANGUAGE.empty.memoriesFilteredHint),
  },
  birthdays: {
    title: kk(FAMILY_LANGUAGE.empty.birthdays),
    hint: kk(FAMILY_LANGUAGE.empty.birthdaysHint),
    action: kk(FAMILY_LANGUAGE.empty.relativesAction),
    today: kk(FAMILY_LANGUAGE.empty.birthdaysTodayEmpty),
    upcoming: kk(FAMILY_LANGUAGE.empty.birthdaysUpcomingEmpty),
    month: kk(FAMILY_LANGUAGE.empty.birthdaysMonthEmpty),
  },
  relationship: {
    title: kk(FAMILY_LANGUAGE.empty.relationship),
    hint: kk(FAMILY_LANGUAGE.empty.relationshipHint),
  },
  relationshipNoRelatives: {
    title: kk(FAMILY_LANGUAGE.empty.relationshipNoRelatives),
    action: kk(FAMILY_LANGUAGE.empty.relativesAction),
  },
  memorial: {
    title: kk(FAMILY_LANGUAGE.empty.memorial),
    hint: kk(FAMILY_LANGUAGE.empty.memorialHint),
  },
  relativeNotFound: {
    title: kk(FAMILY_LANGUAGE.empty.relativeNotFound),
    hint: kk(FAMILY_LANGUAGE.empty.relativeNotFoundHint),
  },
  relativeProfileFailed: {
    title: kk(FAMILY_LANGUAGE.empty.relativeProfileFailed),
    hint: kk(FAMILY_LANGUAGE.empty.relativeProfileFailedHint),
  },
  searchNoMatch: {
    title: kk(FAMILY_LANGUAGE.empty.searchNoMatch),
    hint: kk(FAMILY_LANGUAGE.empty.searchNoMatchHint),
  },
  pickerNoMatch: {
    title: kk(FAMILY_LANGUAGE.empty.pickerNoMatch),
    hint: kk(FAMILY_LANGUAGE.empty.pickerNoMatchHint),
  },
  pickerNoRelatives: {
    title: kk(FAMILY_LANGUAGE.empty.pickerNoRelatives),
    hint: kk(FAMILY_LANGUAGE.empty.pickerNoRelativesHint),
  },
  notes: {
    title: kk(FAMILY_LANGUAGE.empty.notesEmpty),
    hint: kk(FAMILY_LANGUAGE.empty.notesEmptyHint),
  },
  children: {
    title: kk(FAMILY_LANGUAGE.empty.childrenEmpty),
    hint: kk(FAMILY_LANGUAGE.empty.childrenEmptyHint),
  },
  ruPicker: {
    listEmpty: kk(FAMILY_LANGUAGE.empty.ruListEmpty),
    listEmptyHint: kk(FAMILY_LANGUAGE.empty.ruListEmptyHint),
    noMatch: kk(FAMILY_LANGUAGE.empty.searchNoMatch),
    noMatchHint: kk(FAMILY_LANGUAGE.empty.searchNoMatchHint),
  },
  onboarding: {
    title: kk(FAMILY_LANGUAGE.empty.onboardingTitle),
    subtitle: kk(FAMILY_LANGUAGE.empty.onboardingSubtitle),
  },
} as const;
