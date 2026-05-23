import type { Relative } from '@/types/relative';

export type KinshipCategory =
  | 'self'
  | 'direct'
  | 'sibling'
  | 'grand'
  | 'in_law'
  | 'nagashy'
  | 'paternal'
  | 'extended'
  | 'kuda'
  | 'unknown';

export type KinshipType =
  | 'self'
  | 'father'
  | 'mother'
  | 'son'
  | 'daughter'
  | 'spouse'
  | 'husband'
  | 'wife'
  | 'aga'
  | 'ini'
  | 'apke'
  | 'singli'
  | 'sibling_neutral'
  | 'grandfather'
  | 'grandmother'
  | 'nemere'
  | 'shobere'
  | 'jenge'
  | 'jezde'
  | 'kelin'
  | 'kuyeu_bala'
  | 'kayin_ata'
  | 'kayin_ene'
  | 'kayin_aga'
  | 'kayin_ini'
  | 'kayin_apke'
  | 'kayin_singli'
  | 'kayin_neutral'
  | 'kayin_jurt'
  | 'abysyn'
  | 'kayin_jezde'
  | 'nagashy_ata'
  | 'nagashy_aje'
  | 'nagashy_aga'
  | 'nagashy_ini'
  | 'nagashy_apke'
  | 'nagashy_singli'
  | 'nagashy_neutral'
  | 'paternal_aga'
  | 'paternal_ini'
  | 'paternal_apke'
  | 'paternal_singli'
  | 'paternal_neutral'
  | 'zhien'
  | 'bole'
  | 'tuas'
  | 'kuda'
  | 'kudagi'
  | 'kuda_neutral'
  | 'relative_neutral'
  | 'unknown';

export type KinshipLabel = {
  kazakh: string;
  russian: string;
  subtitle?: string;
};

export type KinshipPathStep = {
  person: Relative;
  stepLabel: string;
};

export type KinshipResult = {
  type: KinshipType;
  category: KinshipCategory;
  label: KinshipLabel;
  uncertain: boolean;
  missingGenderHint: boolean;
  pathSteps: KinshipPathStep[];
  resolved: boolean;
  confidenceHint?: string;
};

export type KinshipExplanation = {
  title: string;
  summary: string;
  pathText: string;
  hint?: string;
  result: KinshipResult;
};
