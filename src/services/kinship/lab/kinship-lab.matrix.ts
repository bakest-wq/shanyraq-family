import type {
  KinshipLabMatrixRow,
  KinshipLabRootSwitchRow,
} from '@/services/kinship/lab/kinship-lab.types';

/** Canonical relationship matrix — regression guard for the kinship engine. */
export const KINSHIP_LAB_MATRIX: KinshipLabMatrixRow[] = [
  // —— Қайын ——
  {
    id: 'kayin-ata-from-spouse-father',
    familyId: 'bauyrzhan',
    category: 'kayin',
    rootKey: 'bauyrzhan',
    targetKey: 'annaFather',
    expectedType: 'kayin_ata',
    expectedJurt: 'kaiyn_jurt',
    cardLinePattern: /Қайын ата/i,
    explanationPattern: /жұбай/i,
    minConfidence: 'high',
    note: 'Vision: spouse chain to father-in-law',
  },

  // —— Нағашы ——
  {
    id: 'nagashy-ata-from-mother-line',
    familyId: 'bauyrzhan',
    category: 'nagashy',
    rootKey: 'bauyrzhan',
    targetKey: 'nagAta',
    expectedType: 'nagashy_ata',
    expectedJurt: 'nagashy_jurt',
    cardLinePattern: /Нағашы ата/i,
    minConfidence: 'high',
  },
  {
    id: 'nagashy-ata-from-child-to-spouse-father',
    familyId: 'bauyrzhan',
    category: 'nagashy',
    rootKey: 'son',
    targetKey: 'annaFather',
    expectedType: 'nagashy_ata',
    expectedJurt: 'nagashy_jurt',
    explanationPattern: /нағашы ата/i,
    minConfidence: 'high',
    note: 'Vision: child sees mother-side grandfather through spouse line',
  },

  // —— Құда ——
  {
    id: 'kuda-brother-to-spouse-father',
    familyId: 'bauyrzhan',
    category: 'kuda',
    rootKey: 'brother',
    targetKey: 'annaFather',
    expectedType: 'kuda',
    expectedJurt: 'kuda_jurt',
    explanationPattern: /құда/i,
    minConfidence: 'high',
    note: 'Vision: sibling to spouse-side elder',
  },

  // —— Бөле ——
  {
    id: 'bole-maternal-aunt-child',
    familyId: 'bauyrzhan',
    category: 'bole',
    rootKey: 'bauyrzhan',
    targetKey: 'bole',
    expectedType: 'bole',
    expectedJurt: 'nagashy_jurt',
    cardLinePattern: /Бөле/i,
    minConfidence: 'high',
  },

  // —— Younger brother's wife (Келін) ——
  {
    id: 'kelin-younger-brother-wife',
    familyId: 'bauyrzhan',
    category: 'jenge',
    rootKey: 'bauyrzhan',
    targetKey: 'jenge',
    expectedType: 'kelin',
    expectedJurt: 'direct_family',
    cardLinePattern: /Келін/i,
    minConfidence: 'high',
  },

  // —— Жезде ——
  {
    id: 'jezde-sister-husband',
    familyId: 'bauyrzhan',
    category: 'jezde',
    rootKey: 'bauyrzhan',
    targetKey: 'jezde',
    expectedType: 'jezde',
    expectedJurt: 'direct_family',
    cardLinePattern: /Жезде/i,
    minConfidence: 'high',
  },

  // —— Жиен ——
  {
    id: 'zhien-sister-child',
    familyId: 'bauyrzhan',
    category: 'zhien',
    rootKey: 'bauyrzhan',
    targetKey: 'zhien',
    expectedType: 'zhien',
    expectedJurt: 'oz_jurt',
    cardLinePattern: /Жиен/i,
    minConfidence: 'high',
  },
];

/** Root switching matrix — same target, different roots, different kinship meaning. */
export const KINSHIP_LAB_ROOT_SWITCH_MATRIX: KinshipLabRootSwitchRow[] = [
  {
    id: 'root-switch-abdurashid',
    familyId: 'bauyrzhan',
    targetKey: 'annaFather',
    cases: [
      { rootKey: 'bauyrzhan', expectedType: 'kayin_ata', expectedJurt: 'kaiyn_jurt' },
      { rootKey: 'son', expectedType: 'nagashy_ata', expectedJurt: 'nagashy_jurt' },
      { rootKey: 'brother', expectedType: 'kuda', expectedJurt: 'kuda_jurt' },
      { rootKey: 'anna', expectedType: 'father', expectedJurt: 'direct_family' },
    ],
  },
  {
    id: 'root-switch-nagashy-ata',
    familyId: 'bauyrzhan',
    targetKey: 'nagAta',
    cases: [
      { rootKey: 'bauyrzhan', expectedType: 'nagashy_ata', expectedJurt: 'nagashy_jurt' },
      { rootKey: 'son', expectedType: 'unknown' },
      { rootKey: 'brother', expectedType: 'nagashy_ata', expectedJurt: 'nagashy_jurt' },
    ],
  },
];

export function getKinshipLabMatrixByCategory(category: KinshipLabMatrixRow['category']) {
  return KINSHIP_LAB_MATRIX.filter((row) => row.category === category);
}
