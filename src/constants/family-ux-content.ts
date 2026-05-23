export type EmptyStatePreset = {
  icon: string;
  title: string;
  subtitle: string;
  hint?: string;
  actionLabel?: string;
};

export const EMPTY_STATE_PRESETS = {
  relatives: {
    icon: '🌿',
    title: 'Әлі туыс қосылмаған 🌿',
    subtitle: 'Отбасыңызды толықтыра бастаңыз',
    hint: 'Алдымен өзіңізді қосыңыз — содан кейін жақындарды',
    actionLabel: 'Туыс қосу · Add relative',
  },
  familyTree: {
    icon: '🌳',
    title: 'Шежіре әлі құрылмаған 🌳',
    subtitle: 'Әке, ана және балаларды байланыстырыңыз',
    hint: 'Жұбайыңызды байланыстырып, отбасы блоктарын құрыңыз',
    actionLabel: 'Туыс қосу · Add relative',
  },
  familyTreePartial: {
    icon: '🌿',
    title: 'Шежіре әлі құрылмаған 🌳',
    subtitle: 'Әке, ана және балаларды байланыстырыңыз',
    hint: 'Байланыстар қосылған сайын отбасы блоктары автоматты түрде пайда болады',
  },
  timeline: {
    icon: '📜',
    title: 'Отбасы тарихы осында жиналады 📜',
    subtitle: 'Туған күн, үйлену, естеліктер — маңызды сәттер',
    hint: 'Туыс қоссаңыз, оқиғалар автоматты түрде жиналады',
    actionLabel: 'Оқиға қосу · Add event',
  },
  memories: {
    icon: '📸',
    title: 'Естеліктер осында сақталады 📸',
    subtitle: 'Фото, тарих, насихат, дауыс және құжаттар',
    hint: 'Отбасыңыздың жылы естеліктерін сақтаңыз',
    actionLabel: 'Естелік қосу · Add memory',
  },
  birthdays: {
    icon: '🎂',
    title: 'Туған күндер осында көрінеді 🎂',
    subtitle: 'Туыс қосып, туған күнін жазыңыз',
    hint: 'Жақын туған күндерге еске салу жібереміз',
    actionLabel: 'Туыс қосу · Add relative',
  },
  relationship: {
    icon: '🤝',
    title: 'Екі туыс таңдаңыз 🤝',
    subtitle: 'Туыстық байланысты жылы сөзбен түсіндіреміз',
    hint: 'Әke/ana байланыстары неғұрлым толық болса, нәтиже нақтырақ',
  },
  relationshipNoRelatives: {
    icon: '🌿',
    title: 'Алдымен туыс қосыңыз 🌿',
    subtitle: 'Содан кейін туыстықты анықтауға болады',
    actionLabel: 'Туыс қосу · Add relative',
  },
} as const satisfies Record<string, EmptyStatePreset>;

export const ONBOARDING_HINTS = [
  {
    icon: '👤',
    text: 'Алдымен өзіңізді қосыңыз',
    subtext: 'Add yourself first · отбасының орталығы',
  },
  {
    icon: '💍',
    text: 'Жұбайыңызды байланыстырыңыз',
    subtext: 'Link your spouse · жұбай жұбы',
  },
  {
    icon: '👶',
    text: 'Балаларды қосыңыз',
    subtext: 'Add children · шежіре толығады',
  },
] as const;

export const SECTION_HELPER_TEXT = {
  familyLinks: {
    text: 'Байланыстар автоматты түрде синхрондалады 🌿',
    subtext: 'Әke, аna, жұбай — шежіре автоматты түрде құрылады · Parents & spouse build the tree',
  },
  ruSelection: {
    text: 'Ру — отбасыңыздың тамыры. Міндетті емес, бірақ шежіре үшін қадірлі.',
    subtext: 'Жүз → ру → атadan тараған тармақ · Optional shezhire depth',
  },
  relationshipExplanation: {
    text: 'Байланыс жылы, адамзат тілінде түсіндіріледі — техникалық емес.',
    subtext: 'Kazakh first · Russian second · add parent links for accuracy',
  },
  childrenLinks: {
    text: 'Балаларды таңдағаннан кейін сақтау батырмасын басыңыз.',
    subtext: 'Children appear under parents in the family tree',
  },
  parentLinks: {
    text: 'Бір ата-ана бірнеше балаға байланыса алады',
    subtext: 'Existing parents stay selectable for every child and sibling',
  },
  siblingParentInheritanceMissing: {
    text: 'Алдымен өз ата-анаңызды байланыстырсаңыз, бауырларыңыз автоматты түрде қосылады.',
    subtext: 'Link your own parents first, then siblings inherit the same parents',
  },
} as const;

export const SHEZHIRE_NAME_WARNING =
  'Аты-жөні шежіре байланысын өзгертпейді. Байланыс тек әke/ана/жұбай арқылы құрылады.';

export const SHEZHIRE_SIBLINGS_HELPER =
  'Бұл адамдар орталық тұлғамен ортақ ата-анадан';

export const SHEZHIRE_FOCUSED_ROOT = {
  contextSubtitle: 'Сіз осы адамның шежіресін көріп тұрсыз',
  backToMyTree: 'Менің ағашыма қайту',
  parentMissing: 'Дерек табылмады',
  fatherNotFound: 'Әке табылмады',
  motherNotFound: 'Ана табылмады',
  parentUnlinked: 'Байланыстырылмаған',
  addChild: 'Баланы қосу',
  childrenEmpty: 'Балалар әлі қосылмаған',
  childrenCount: (count: number) => `${count} бала`,
  siblingsCount: (count: number) => `${count} бауыр`,
  coreBadge: 'Орталық',
  sections: {
    parents: 'Ата-ана',
    siblings: 'Бауырлар',
    coreFamily: 'Орталық тұлға + жұбайы',
    children: 'Балалары',
    fatherSide: "Әke жағынан туыстар · Father's side",
    motherSide: "Ana жағынан туыстар · Mother's side",
  },
  parentSide: {
    fatherSubtitle: "Father's side · әke туысқаны және олардың балалары",
    motherSubtitle: "Mother's side · ana туысқаны және олардың балалары",
    fatherMissing: 'Әke жағынан туыстар әлі байланыстырылмаған',
    motherMissing: 'Ana жағынан туыстар әлі байланыстырылмаған',
    fatherEmpty: 'Әke жағынан туыс әлі қосылмаған',
    motherEmpty: 'Ana жағынан туыс әлі қосылмаған',
    relativesCount: (count: number) => `${count} туыс`,
    childrenCount: (count: number) => `${count} бала`,
    expandChildren: 'Балаларын көрсету',
    collapseChildren: 'Жасыру',
    addFatherSibling: 'Әкемнің бауырын қосу',
    addMotherSibling: 'Анамның бауырын қосу',
    grandparentsMissingFather: 'Алдымен әкеңіздің/анаңыздың ата-анасын қосыңыз.',
    grandparentsMissingMother: 'Алдымен әкеңіздің/анаңыздың ата-анасын қосыңыз.',
    kinshipAutoCalculated: 'Туыстық атаулар автоматты түрде есептеледі.',
    helperFatherSibling: 'Бұл адам әкеңізбен бір ата-анадан туған болуы керек.',
    helperMotherSibling: 'Бұл адам анаңызбен бір ата-анадан туған болуы керек.',
  },
  helper: {
    title: 'Шежіре сіз таңдаған орталық тұлға арқылы көрсетіледі',
    subtitle: 'Басу — басқа туыс · Ұзақ басу — өңдеу',
  },
  unlinkedSection: {
    title: 'Байланысын толықтыру керек',
    subtitle: 'Шежіреде орны анықталмаған',
    helper: 'Бұл туыстарға әке, ана немесе жұбай байланысын қосу керек.',
    cardHint: 'Туысты шежіре орталығына қойып, байланыстарын бірге толықтыра аласыз.',
  },
} as const;

/** @deprecated Use parentUnlinked */
export const SHEZHIRE_PARENT_UNSELECTED = SHEZHIRE_FOCUSED_ROOT.parentUnlinked;

export function formatShezhireFocusedRootTitle(fullName: string): string {
  return `Орталық тұлға: ${fullName}`;
}
