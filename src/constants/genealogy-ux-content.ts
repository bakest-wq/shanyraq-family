import { kk, FAMILY_LANGUAGE } from '@/content/family-language';

/** Calm genealogy-inspired copy — Kazakh-first, no vendor complexity. */
export const GENEALOGY_UX_COPY = {
  viewInShezhire: kk(FAMILY_LANGUAGE.health.actionOpenInShezhire),
  viewInShezhireHint: {
    kk: 'Осы адамды орталыққа қойып шежіреді көру',
    ru: 'Открыть шежире с этим человеком в центре',
  },
  homeMyShezhire: {
    kk: 'Менің шежірем',
    ru: 'Моё шежире',
  },
  homeMyShezhireHint: {
    kk: 'Отбасы ағашын бір басумен ашу',
    ru: 'Открыть семейное дерево одним нажатием',
  },
  unplacedShowMore: (count: number) => `Тағы ${count} →`,
  lineageAncestors: (count: number) => `Жоғары буын (${count})`,
  lineageDescendants: (count: number) => `Төменгі буын (${count})`,
} as const;
