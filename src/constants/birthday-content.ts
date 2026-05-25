import { familyText, FAMILY_LANGUAGE } from '@/content/family-text';

export const BIRTHDAY_MILESTONE_AGES = [1, 5, 18, 25, 50, 60, 70, 80] as const;

export const BIRTHDAY_SECTIONS = {
  today: {
    icon: '🎉',
    title: 'Бүгін туған күн',
    subtitle: 'Бүгін құттықтау керек',
  },
  upcoming: {
    icon: '⏳',
    title: 'Жақын туған күндер',
    subtitle: 'Келесі 30 күн',
  },
  thisMonth: {
    icon: '📅',
    title: 'Осы ай',
    subtitle: 'Ай ішіндегі туған күндер',
  },
  all: {
    icon: '📚',
    title: 'Барлық туған күндер',
    subtitle: 'Толық тізім · жиынтық',
  },
} as const;

export const BIRTHDAY_UX = {
  showDeceased: 'Марқұмдарды көрсету',
  showDeceasedHint: 'Еске алу және дұға үшін',
  remindersLink: 'Еске салулар',
  remindersHint: familyText(FAMILY_LANGUAGE.home.remindersHint),
  emptyToday: familyText(FAMILY_LANGUAGE.empty.birthdaysTodayEmpty),
  emptyUpcoming: familyText(FAMILY_LANGUAGE.empty.birthdaysUpcomingEmpty),
  emptyThisMonth: familyText(FAMILY_LANGUAGE.empty.birthdaysMonthEmpty),
  smartReminderSoon: 'Туған күн жақындап қалды',
  smartReminderToday: 'Ұмытпаңыз',
  milestoneLabel: (age: number) => `${age} жас · ерекше`,
  expandAll: 'Барлығын көрсету',
  collapseAll: 'Жасыру',
} as const;

export const BIRTHDAY_UPCOMING_DAYS = 30;
