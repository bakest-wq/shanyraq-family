import { CreateRelativeInput, Relative } from '@/types/relative';
import { syncNameFields } from '@/utils/relative-names';

export function relativeToFormInput(relative: Relative): CreateRelativeInput {
  return {
    fullName: relative.fullName,
    firstName: relative.firstName,
    middleName: relative.middleName ?? '',
    birthSurname: relative.birthSurname ?? '',
    currentSurname: relative.currentSurname ?? '',
    displayName: relative.displayName,
    relationship: relative.relationship,
    birthday: relative.birthday,
    phone: relative.phone,
    avatarColor: relative.avatarColor,
    isDeceased: relative.isDeceased,
    deathYear: relative.deathYear,
    duaText: relative.duaText ?? '',
    notes: relative.notes ?? '',
    fatherId: relative.fatherId ?? null,
    motherId: relative.motherId ?? null,
    spouseId: relative.spouseId ?? null,
    gender: relative.gender,
    maritalStatus: relative.maritalStatus,
  };
}

export const EMPTY_RELATIVE_FORM: CreateRelativeInput = {
  relationship: 'Бала',
  firstName: '',
  middleName: '',
  birthSurname: '',
  currentSurname: '',
  displayName: '',
  fullName: '',
  birthday: '',
  phone: '',
  isDeceased: false,
  deathYear: undefined,
  duaText: '',
  notes: '',
  fatherId: null,
  motherId: null,
  spouseId: null,
  gender: undefined,
  maritalStatus: undefined,
};

export function prepareFormFromInput(input: CreateRelativeInput): CreateRelativeInput {
  return syncNameFields(input);
}
