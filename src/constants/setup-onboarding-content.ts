export type SetupOnboardingStepId = 'welcome' | 'step1' | 'step2' | 'step3';

export type SetupOnboardingStep = {
  id: SetupOnboardingStepId;
  icon: string;
  title: string;
  subtitle: string;
  subtitleRu: string;
  actionLabel: string;
  actionSublabel?: string;
  progress?: number;
  progressTotal?: number;
};

export const SETUP_ONBOARDING_STEPS: SetupOnboardingStep[] = [
  {
    id: 'welcome',
    icon: '🌿',
    title: 'Сіздің цифрлық шаңырағыңыз 🌿',
    subtitle: 'Туыстарды, туған күндерді және шежірені бірге сақтаңыз.',
    subtitleRu: 'Родственники, дни рождения и шежіре — в одном месте',
    actionLabel: 'Бастау',
    actionSublabel: 'Start · начнём вместе',
  },
  {
    id: 'step1',
    icon: '👤',
    title: 'Алдымен өзіңізді қосыңыз',
    subtitle: 'Отбасыңыздың орталығы — сіз. Аты-жөніңіз бен туған күніңізді жазыңыз.',
    subtitleRu: 'Add yourself · вы — центр семьи',
    actionLabel: 'Өзімді қосу',
    actionSublabel: 'Add myself · родство «Мен»',
    progress: 1,
    progressTotal: 3,
  },
  {
    id: 'step2',
    icon: '💍',
    title: 'Жұбайыңызды немесе ата-анаңызды қосыңыз',
    subtitle: 'Жақын туыс — шежіредің тамыры. Байланысты таңдау оңай.',
    subtitleRu: 'Spouse or parents · корень дерева',
    actionLabel: 'Туыс қосу',
    actionSublabel: 'Add relative · жұбай немесе ата-ана',
    progress: 2,
    progressTotal: 3,
  },
  {
    id: 'step3',
    icon: '🌳',
    title: 'Балаларды байланыстырыңыз',
    subtitle: 'Әke, ana және балалар — отбасы блоктары автоматты түрде құрылады.',
    subtitleRu: 'Link children · построить шежіре',
    actionLabel: 'Шежірені құру',
    actionSublabel: 'Build family tree · открыть шежіре',
    progress: 3,
    progressTotal: 3,
  },
];

export const SETUP_ONBOARDING_SKIP_LABEL = 'Кейінірек';
export const SETUP_ONBOARDING_NEXT_LABEL = 'Келесі';
export const SETUP_ONBOARDING_NEXT_SUBLABEL = 'Next step · следующий шаг';
