import type { FamilyPhrase } from '@/content/family-language';
import { bilingual, kk, ru, FAMILY_LANGUAGE } from '@/content/family-language';

export type EmptyStatePreset = {
  icon: string;
  title: string;
  subtitle: string;
  hint?: string;
  actionLabel?: string;
};

function emptyPreset(
  icon: string,
  title: FamilyPhrase,
  options?: {
    subtitle?: FamilyPhrase;
    hint?: FamilyPhrase;
    action?: FamilyPhrase;
  },
): EmptyStatePreset {
  return {
    icon,
    title: kk(title),
    subtitle: options?.subtitle ? kk(options.subtitle) : kk(FAMILY_LANGUAGE.empty.sectionIncomplete),
    hint: options?.hint ? kk(options.hint) : undefined,
    actionLabel: options?.action ? kk(options.action) : undefined,
  };
}

export const EMPTY_STATE_PRESETS = {
  relatives: emptyPreset('🌿', FAMILY_LANGUAGE.empty.relatives, {
    subtitle: FAMILY_LANGUAGE.empty.relativesHint,
    action: FAMILY_LANGUAGE.empty.relativesAction,
  }),
  familyTree: emptyPreset('🌳', FAMILY_LANGUAGE.empty.familyTree, {
    subtitle: FAMILY_LANGUAGE.empty.familyTreeHint,
    action: FAMILY_LANGUAGE.empty.relativesAction,
  }),
  familyTreePartial: {
    icon: '🌿',
    title: kk(FAMILY_LANGUAGE.empty.familyTree),
    subtitle: kk(FAMILY_LANGUAGE.empty.familyTreePartialHint),
    hint: kk(FAMILY_LANGUAGE.empty.startFirstRelative),
  },
  timeline: emptyPreset('📜', FAMILY_LANGUAGE.empty.timeline, {
    subtitle: FAMILY_LANGUAGE.empty.timelineHint,
    action: FAMILY_LANGUAGE.empty.timelineAction,
  }),
  memories: emptyPreset('📸', FAMILY_LANGUAGE.empty.memories, {
    subtitle: FAMILY_LANGUAGE.empty.memoriesHint,
    action: FAMILY_LANGUAGE.empty.memoriesAction,
  }),
  memoriesFiltered: emptyPreset('🌿', FAMILY_LANGUAGE.empty.memoriesFiltered, {
    subtitle: FAMILY_LANGUAGE.empty.memoriesFilteredHint,
    action: FAMILY_LANGUAGE.empty.memoriesAction,
  }),
  birthdays: emptyPreset('🎂', FAMILY_LANGUAGE.empty.birthdays, {
    subtitle: FAMILY_LANGUAGE.empty.birthdaysHint,
    action: FAMILY_LANGUAGE.empty.relativesAction,
  }),
  memorial: emptyPreset('🕊️', FAMILY_LANGUAGE.empty.memorial, {
    subtitle: FAMILY_LANGUAGE.empty.memorialHint,
    action: FAMILY_LANGUAGE.empty.relativesAction,
  }),
  relationship: emptyPreset('🤝', FAMILY_LANGUAGE.empty.relationship, {
    subtitle: FAMILY_LANGUAGE.empty.relationshipHint,
  }),
  relationshipNoRelatives: emptyPreset('🌿', FAMILY_LANGUAGE.empty.relationshipNoRelatives, {
    subtitle: FAMILY_LANGUAGE.empty.startFirstRelative,
    action: FAMILY_LANGUAGE.empty.relativesAction,
  }),
  relativeNotFound: emptyPreset('👤', FAMILY_LANGUAGE.empty.relativeNotFound, {
    subtitle: FAMILY_LANGUAGE.empty.relativeNotFoundHint,
    action: FAMILY_LANGUAGE.empty.backAction,
  }),
  relativeProfileFailed: emptyPreset('🌿', FAMILY_LANGUAGE.empty.relativeProfileFailed, {
    subtitle: FAMILY_LANGUAGE.empty.relativeProfileFailedHint,
    action: FAMILY_LANGUAGE.empty.backAction,
  }),
} as const satisfies Record<string, EmptyStatePreset>;

export const ONBOARDING_HINTS = [
  {
    icon: '👤',
    text: kk(FAMILY_LANGUAGE.helpers.onboardingSelf),
    subtext: bilingual(FAMILY_LANGUAGE.helpers.onboardingSelfSub),
  },
  {
    icon: '💍',
    text: kk(FAMILY_LANGUAGE.helpers.onboardingSpouse),
    subtext: bilingual(FAMILY_LANGUAGE.helpers.onboardingSpouseSub),
  },
  {
    icon: '👶',
    text: kk(FAMILY_LANGUAGE.helpers.onboardingChildren),
    subtext: bilingual(FAMILY_LANGUAGE.helpers.onboardingChildrenSub),
  },
] as const;

export const SECTION_HELPER_TEXT = {
  familyLinks: {
    text: kk(FAMILY_LANGUAGE.helpers.familyLinks),
    subtext: kk(FAMILY_LANGUAGE.helpers.familyLinksSub),
  },
  ruSelection: {
    text: kk(FAMILY_LANGUAGE.helpers.ruSelection),
    subtext: kk(FAMILY_LANGUAGE.helpers.ruSelection),
  },
  relationshipExplanation: {
    text: kk(FAMILY_LANGUAGE.helpers.relationshipExplanation),
    subtext: kk(FAMILY_LANGUAGE.helpers.relationshipExplanation),
  },
  childrenLinks: {
    text: kk(FAMILY_LANGUAGE.helpers.childrenLinks),
    subtext: kk(FAMILY_LANGUAGE.helpers.childrenLinks),
  },
  parentLinks: {
    text: kk(FAMILY_LANGUAGE.helpers.parentLinks),
    subtext: kk(FAMILY_LANGUAGE.helpers.parentLinks),
  },
  siblingParentInheritanceMissing: {
    text: kk(FAMILY_LANGUAGE.helpers.siblingParentInheritance),
    subtext: kk(FAMILY_LANGUAGE.helpers.siblingParentInheritance),
  },
} as const;

export const SHEZHIRE_NAME_WARNING = kk(FAMILY_LANGUAGE.helpers.shezhireNameWarning);

export const SHEZHIRE_SIBLINGS_HELPER = kk(FAMILY_LANGUAGE.helpers.shezhireSiblings);

export const SHEZHIRE_FOCUSED_ROOT = {
  contextSubtitle: bilingual({
    kk: 'Осы адамның шежіресі — отбасыңздың бір бөлшегі',
    ru: 'Шежире этого человека — часть вашей семьи',
  }),
  backToMyTree: 'Менің ағашыма қайту',
  parentMissing: kk(FAMILY_LANGUAGE.empty.sectionIncomplete),
  fatherNotFound: kk(FAMILY_LANGUAGE.health.brokenFatherLink),
  motherNotFound: kk(FAMILY_LANGUAGE.health.brokenMotherLink),
  parentUnlinked: kk(FAMILY_LANGUAGE.unlinked.parentUnlinked),
  ancestorsCount: (count: number) => `${count} ата-баба`,
  descendantsCount: (count: number) => `${count} ұрпақ`,
  addChild: 'Баланы қосу',
  childrenEmpty: kk(FAMILY_LANGUAGE.empty.childrenEmpty),
  childrenCount: (count: number) => `${count} бала`,
  siblingsCount: (count: number) => `${count} бауыр`,
  coreBadge: 'Орталық',
  sections: {
    parents: 'Ата-ана',
    siblings: 'Бауырлар',
    coreFamily: 'Орталық тұлға',
    spouse: 'Жұбай',
    children: 'Балалар',
    ancestors: 'Жоғары буын',
    descendants: 'Төменгі буын',
    fatherSide: bilingual({
      kk: 'Әке жағынан туыстар',
      ru: 'Родня по отцу',
    }),
    motherSide: bilingual({
      kk: 'Ана жағынан туыстар',
      ru: 'Родня по матери',
    }),
  },
  parentSide: {
    fatherSubtitle: bilingual({
      kk: 'Әке туыстары және олардың балалары',
      ru: 'Родня отца и их дети',
    }),
    motherSubtitle: bilingual({
      kk: 'Ана туыстары және олардың балалары',
      ru: 'Родня матери и их дети',
    }),
    fatherMissing: 'Алдымен әкеңізді қосыңыз.',
    motherMissing: 'Алдымен анаңызды қосыңыз.',
    fatherEmpty: 'Үке жағынан туыс әлі жоқ — қосуға болады',
    motherEmpty: 'Ана жағынан туыс әлі жоқ — қосуға болады',
    relativesCount: (count: number) => `${count} туыс`,
    childrenCount: (count: number) => `${count} бала`,
    expandChildren: 'Балаларын көрсету',
    collapseChildren: 'Жасыру',
    addFatherSibling: 'Әкемнің бауырын қосу',
    addMotherSibling: 'Анамның бауырын қосу',
    grandparentsMissingFather: 'Алдымен әкеңіздің ата-анасын қосыңыз.',
    grandparentsMissingMother: 'Алдымен анаңыздың ата-анасын қосыңыз.',
    kinshipAutoCalculated: 'Туыстық атаулар шежіре құрылымына сай көрсетіледі.',
    helperFatherSibling: 'Бұл адам әкеңізбен бір ата-анадан туған болуы керек.',
    helperMotherSibling: 'Бұл адам анаңызбен бір ата-анадан туған болуы керек.',
  },
  helper: {
    title: kk(FAMILY_LANGUAGE.helpers.shezhireFocused),
    subtitle: bilingual(FAMILY_LANGUAGE.helpers.shezhireFocused),
  },
  unlinkedSection: {
    title: kk(FAMILY_LANGUAGE.unlinked.sectionTitle),
    subtitle: kk(FAMILY_LANGUAGE.unlinked.sectionSubtitle),
    helper: kk(FAMILY_LANGUAGE.unlinked.sectionHelper),
    cardHint: kk(FAMILY_LANGUAGE.unlinked.cardHint),
  },
} as const;

/** @deprecated Use parentUnlinked */
export const SHEZHIRE_PARENT_UNSELECTED = SHEZHIRE_FOCUSED_ROOT.parentUnlinked;

export function formatShezhireFocusedRootTitle(fullName: string): string {
  return `Орталық тұлға: ${fullName}`;
}

export const SHEZHIRE_JURT = {
  sectionTitle: 'Үш жұрт',
  sectionHint: 'Әке, ана, жұбай — отбасыңыздың үш бағаны',
  tabs: {
    oz: 'Өз жұрты',
    nagashy: 'Нағашылар',
    kayin: 'Қайын жұрты',
  } as const,
  explanations: {
    oz: bilingual({
      kk: 'Әке жағынан · өз руымыз мен тіке шежіре',
      ru: 'По отцу · наш род и прямая линия',
    }),
    nagashy: bilingual({
      kk: 'Ана жағынан · нағашы жақ',
      ru: 'По матери · родня со стороны мамы',
    }),
    kayin: bilingual({
      kk: 'Жұбай жағы · жұбай отбасы',
      ru: 'Со стороны супруга',
    }),
  } as const,
  contextHeaders: {
    oz: bilingual({
      kk: 'Әке жағыңыз бен өз әулетіңіз',
      ru: 'Родня по отцу и ваша семья',
    }),
    nagashy: bilingual({
      kk: 'Ана жағыңыздың туыстары',
      ru: 'Родственники со стороны мамы',
    }),
    kayin: bilingual({
      kk: 'Жұбайыңыздың туыстары',
      ru: 'Родственники вашего супруга',
    }),
    kuda: bilingual({
      kk: 'Құдалық арқылы байланысқан туыстар',
      ru: 'Родня, связанная через қудалық',
    }),
  } as const,
  empty: {
    oz: 'Өз жүрты әлі бос — туыс қосуға болады',
    nagashy: 'Ана жағынан туыс әлі қосылмаған',
    kayin: 'Қайын жүрт әлі бос — туыс қосуға болады',
  } as const,
  relativesCount: (count: number) => `${count} туыс`,
  peopleCount: (count: number) => `${count} адам`,
  groupHeader: (title: string, count: number) => `${title} · ${count} адам`,
  groupTitleOnly: (title: string) => title,
  groupCountQuiet: (count: number) => `${count}`,
  showMorePeople: (count: number) => `+ Тағы ${count} адам`,
  previewLimit: 3,
  sideGroups: {
    nagashy: 'Нағашылар',
    kayin: 'Қайын жұрт',
    kuda: 'Құдалық',
  } as const,
  kayinSubgroups: {
    kayin_ata_ene: 'Қайын ата-ене',
    kayin_siblings: 'Қайын аға/апа/іні/сіңлі',
    kuda: 'Құдалық',
  } as const,
  ozSubgroups: {
    siblings: 'Бауырлар',
    kelinler: 'Келіндер',
    jengeler: 'Жеңгелер',
    jezdelder: 'Жезделер',
    niecesNephews: 'Жиендер',
    brotherChildren: 'Бауырының балалары',
    paternalRelatives: 'Әке жағынан туыстар',
    kuda: 'Құдалық',
  } as const,
  descendants: 'Үрпақтары',
  addKayinRelative: 'Қайын туыс қосу',
  kayinSpouseMissing: 'Алдымен жұбайыңызды қосыңыз.',
  profileJurtSummaries: {
    nagashy: 'Нағашы жақ өкілі',
    kayin: 'Қайын жақ өкілі',
    kuda: 'Құдалық байланыс',
  } as const,
  contextHelper: {
    fatherSideSibling: 'Бұл туыс әкеңізбен бір ата-анадан туған болуы керек.',
    motherSideSibling: 'Бұл туыс анаңызбен бір ата-анадан туған болуы керек.',
    kayin: 'Бұл туыс жұбайыңыз отбасынан. Жұбай байланысы арқылы шежіре дұрыс құрылады.',
  },
} as const;

export type ShezhireJurtContextHeaderKey = keyof typeof SHEZHIRE_JURT.contextHeaders;

/** Kazakh-only context line shown above Үш жұрт tabs and kuda subgroup. */
export function getShezhireJurtContextHeaderKk(key: ShezhireJurtContextHeaderKey): string {
  return SHEZHIRE_JURT.contextHeaders[key].split(' · ')[0]?.trim() ?? '';
}

export { FAMILY_LANGUAGE, bilingual, kk, ru } from '@/content/family-language';
