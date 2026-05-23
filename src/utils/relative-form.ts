import { CreateRelativeInput, Relative } from '@/types/relative';

export function relativeToFormInput(relative: Relative): CreateRelativeInput {
  return {
    fullName: relative.fullName,
    relationship: relative.relationship,
    birthday: relative.birthday,
    phone: relative.phone,
    avatarColor: relative.avatarColor,
    isDeceased: relative.isDeceased,
    deathYear: relative.deathYear,
    duaText: relative.duaText ?? '',
    notes: relative.notes ?? '',
  };
}

export const EMPTY_RELATIVE_FORM: CreateRelativeInput = {
  relationship: 'Ата',
  fullName: '',
  birthday: '',
  phone: '',
  isDeceased: false,
  deathYear: undefined,
  duaText: '',
  notes: '',
};
