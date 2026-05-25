import { kk, FAMILY_LANGUAGE } from '@/content/family-language';

export const TIMELINE_COPY = {
  screenTitle: kk(FAMILY_LANGUAGE.timeline.screenTitle),
  screenSubtitle: kk(FAMILY_LANGUAGE.timeline.screenSubtitle),
  momentsLabel: kk(FAMILY_LANGUAGE.timeline.momentsLabel),
  sectionTitle: kk(FAMILY_LANGUAGE.timeline.sectionTitle),
  sectionSubtitle: kk(FAMILY_LANGUAGE.timeline.sectionSubtitle),
  unknownYear: kk(FAMILY_LANGUAGE.timeline.unknownYear),
  loading: kk(FAMILY_LANGUAGE.timeline.loading),
  emptyAction: kk(FAMILY_LANGUAGE.timeline.emptyAction),
  types: {
    birth: kk(FAMILY_LANGUAGE.timeline.typeBirth),
    marriage: kk(FAMILY_LANGUAGE.timeline.typeMarriage),
    death: kk(FAMILY_LANGUAGE.timeline.typeDeath),
    anniversary: kk(FAMILY_LANGUAGE.timeline.typeAnniversary),
  },
} as const;

export const TIMELINE_MILESTONES = {
  jubileeAges: [50, 60, 70, 80, 90],
  memorialYears: [1, 5, 10, 25, 50],
  weddingAnniversaryYears: [1, 5, 10, 25, 50, 60],
} as const;
