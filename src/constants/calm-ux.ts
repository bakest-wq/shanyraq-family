/** Premium Calm UX — design tokens and copy. Powerful inside, simple outside. */
export const CALM_UX = {
  /** Soft vertical rhythm between major screen blocks. */
  screenGapScale: 1,
  sectionGapScale: 1,
  /** Minimum pressable height for calm, elder-friendly targets. */
  minTouchHeight: 44,
  elderMinTouchHeight: 52,
  /** Cap visible primary actions before progressive disclosure. */
  maxPrimaryActions: 3,
  elderMaxPrimaryActions: 2,
  sections: {
    homeMore: {
      title: 'Тағы',
      subtitle: 'Естеліктер мен тынш еске салулар',
    },
    profileMore: {
      title: 'Қосымша',
      subtitle: 'Жазба, марқұм естелігі, өзгерістер',
    },
    shezhireSiblings: {
      title: 'Бауырлар',
      subtitle: 'Аға-іні, апке-сіңлі',
    },
    managementCare: {
      title: 'Қамқорлық',
      subtitle: 'Сақтық көшірме және қосымша',
    },
  },
  motion: {
    /** Never exceed this for screen transitions. */
    screenFadeMs: 300,
    /** Expand/collapse for disclosure groups. */
    disclosureMs: 280,
  },
  /** Shared visual rhythm for cards and lists — premium calm polish. */
  polish: {
    cardBorder: '#E8E2D6',
    sectionBorder: '#ECE6DA',
    mutedTextOpacity: 0.9,
    comfortableTouch: 48,
    elderComfortableTouch: 56,
  },
  performance: {
    virtualizeListThreshold: 24,
    jurtGridColumns: 2,
  },
} as const;

export type CalmUxSectionKey = keyof typeof CALM_UX.sections;
