import { kk, FAMILY_LANGUAGE } from '@/content/family-language';

export const RELATIVE_PROFILE_COPY = {
  sections: {
    family: kk(FAMILY_LANGUAGE.profile.sectionFamily),
    familyHint: kk(FAMILY_LANGUAGE.profile.sectionFamilyHint),
    parents: kk(FAMILY_LANGUAGE.profile.sectionParents),
    spouse: kk(FAMILY_LANGUAGE.profile.sectionSpouse),
    children: kk(FAMILY_LANGUAGE.profile.sectionChildren),
    siblings: kk(FAMILY_LANGUAGE.profile.sectionSiblings),
    contact: kk(FAMILY_LANGUAGE.profile.sectionContact),
    kinship: kk(FAMILY_LANGUAGE.profile.sectionKinship),
    shezhire: kk(FAMILY_LANGUAGE.profile.sectionShezhire),
  },
  roles: {
    father: kk(FAMILY_LANGUAGE.profile.roleFather),
    mother: kk(FAMILY_LANGUAGE.profile.roleMother),
  },
  empty: {
    person: kk(FAMILY_LANGUAGE.profile.emptyPerson),
    children: kk(FAMILY_LANGUAGE.profile.emptyChildren),
    siblings: kk(FAMILY_LANGUAGE.profile.emptySiblings),
    birthday: kk(FAMILY_LANGUAGE.profile.emptyBirthday),
    familyInfo: kk(FAMILY_LANGUAGE.profile.emptyFamilyInfo),
    phone: kk(FAMILY_LANGUAGE.profile.emptyPhone),
    shezhire: kk(FAMILY_LANGUAGE.profile.emptyShezhire),
  },
  photo: {
    add: kk(FAMILY_LANGUAGE.profile.photoAdd),
    change: kk(FAMILY_LANGUAGE.profile.photoChange),
    remove: kk(FAMILY_LANGUAGE.profile.photoRemove),
  },
  deceased: kk(FAMILY_LANGUAGE.profile.deceased),
  ageSuffix: kk(FAMILY_LANGUAGE.profile.ageSuffix),
  familySlots: {
    father: kk(FAMILY_LANGUAGE.profile.familySlotFather),
    mother: kk(FAMILY_LANGUAGE.profile.familySlotMother),
    spouse: kk(FAMILY_LANGUAGE.profile.familySlotSpouse),
    children: kk(FAMILY_LANGUAGE.profile.familySlotChildren),
  },
  familySectionHint: kk(FAMILY_LANGUAGE.profile.familySectionHint),
  kinshipUnknownHint: kk(FAMILY_LANGUAGE.profile.kinshipUnknownHint),
  memoryEmptyTitle: kk(FAMILY_LANGUAGE.profile.memoryEmptyTitle),
  memoryEmptyHint: kk(FAMILY_LANGUAGE.profile.memoryEmptyHint),
} as const;
