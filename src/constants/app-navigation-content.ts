import { bilingual, familyText, FAMILY_LANGUAGE } from '@/content/family-text';

export const APP_TABS = {
  home: {
    emoji: '🏠',
    label: 'Басты',
    title: 'Басты',
    subtitle: 'Отбасы орны',
  },
  shezhire: {
    emoji: '🌳',
    label: 'Шежіре',
    title: 'Шежіре',
    subtitle: 'Ата-баба мен ұрпақ',
  },
  relatives: {
    emoji: '👨‍👩‍👧‍👦',
    label: 'Туыстар',
    title: 'Туыстар',
    subtitle: 'Жақындар мен туыс профильдері',
  },
  memories: {
    emoji: '📚',
    label: 'Естеліктер',
    title: 'Естеліктер',
    subtitle: 'Отбасы мұрасы',
  },
  management: {
    emoji: '⚙️',
    label: 'Басқару',
    title: 'Басқару',
    subtitle: 'Қамқорлық пен баптау',
  },
} as const;

export const HOME_SECTIONS = {
  birthdays: {
    title: 'Жақын туған күндер',
    subtitle: 'Келесі 30 күн',
    empty: familyText(FAMILY_LANGUAGE.empty.homeBirthdays),
    seeAll: 'Барлық туған күндер',
  },
  links: {
    title: familyText(FAMILY_LANGUAGE.unlinked.sectionTitle),
    subtitle: familyText(FAMILY_LANGUAGE.unlinked.sectionSubtitle),
    empty: familyText(FAMILY_LANGUAGE.empty.homeLinks),
    action: 'Шежіреге өту',
  },
  activity: {
    title: 'Жақын сәттер',
    subtitle: bilingual({
      kk: 'Естеліктер мен жақын сәттер',
      ru: 'Воспоминания и недавние моменты',
    }),
    empty: familyText(FAMILY_LANGUAGE.empty.homeActivity),
    seeTimeline: 'Хронология',
  },
} as const;

export const MEMORIES_SECTIONS = {
  archive: {
    title: 'Отбасы мұрасы',
    subtitle: 'Фото · естеліктер · жазба',
  },
  photos: {
    title: 'Фото',
    subtitle: 'Отбасы суреттері',
  },
  stories: {
    title: 'Естеліктер',
    subtitle: 'Тарих пен оқиғалар',
  },
  notes: {
    title: 'Жазбалар',
    subtitle: 'Қысқа жазба мен еске салулар',
  },
  memorial: {
    title: 'Марқұм естеліктері',
    subtitle: 'Еске алу және дұға',
  },
} as const;

export const MANAGEMENT_SECTIONS = {
  family: {
    title: 'Отбасы',
    subtitle: 'Атауы және мүшелер',
  },
  invite: {
    title: 'Шақыру коды',
    subtitle: 'Туыстарды қосу',
  },
  health: {
    title: familyText(FAMILY_LANGUAGE.health.title),
    subtitle: familyText(FAMILY_LANGUAGE.health.subtitle),
  },
  archive: {
    title: 'Архив',
    subtitle: 'Естеліктер мен хронология',
  },
  identity: {
    title: 'Сіз кімсіз?',
    subtitle: 'Шежіредегі орныңыз',
  },
  permissions: {
    title: 'Рұқсаттар',
    subtitle: 'Кім не өзгерте алады',
  },
  reminders: {
    title: 'Еске салулар',
    subtitle: 'Туған күн · дұға',
  },
  backup: {
    title: familyText(FAMILY_LANGUAGE.backup.sectionTitle),
    subtitle: familyText(FAMILY_LANGUAGE.backup.openSettingsHint),
  },
  editHistory: {
    title: 'Өзгерістер тарихы',
    subtitle: 'Қалпына келтіру · кім өзгертті',
  },
} as const;
