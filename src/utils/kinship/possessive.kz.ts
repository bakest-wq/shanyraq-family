import type { KinshipType } from '@/utils/kinship/types';

const SIBLING_POSSESSIVE: Record<string, string> = {
  аға: 'ағаңыздың',
  іні: 'ініңіздің',
  әпке: 'әпкеңіздің',
  сіңлі: 'сіңліңіздің',
  қарындас: 'қарындасыңыздың',
  бауыр: 'бауырыңыздың',
};

export function siblingPossessivePhrase(stepLabel: string, siblingName?: string): string {
  const normalized = stepLabel.trim().toLowerCase();
  const possessive = SIBLING_POSSESSIVE[normalized] ?? `${normalized}ңыздың`;

  if (siblingName) {
    return `${siblingName} ${possessive}`;
  }

  return possessive;
}

export function siblingRoleLabel(type: KinshipType): string {
  const map: Partial<Record<KinshipType, string>> = {
    aga: 'аға',
    ini: 'іні',
    apke: 'әпке',
    singli: 'қарындас',
    sibling_neutral: 'бауыр',
  };

  return map[type] ?? 'бауыр';
}

export function childRoleWord(gender?: 'male' | 'female' | null): string {
  if (gender === 'male') {
    return 'ұлы';
  }

  if (gender === 'female') {
    return 'қызы';
  }

  return 'баласы';
}
