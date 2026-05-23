import { CreateRelativeInput, Relative } from '@/types/relative';
import { relativeToBirthdayFormParts } from '@/utils/birthday-parts';
import { syncNameFields } from '@/utils/relative-names';

export function relativeToFormInput(relative: Relative): CreateRelativeInput {
  const birthdayFields = relativeToBirthdayFormParts(relative);

  return {
    fullName: relative.fullName,
    firstName: relative.firstName,
    middleName: relative.middleName ?? '',
    birthSurname: relative.birthSurname ?? '',
    currentSurname: relative.currentSurname ?? '',
    displayName: relative.displayName,
    relationship: relative.relationship,
    ...birthdayFields,
    phone: relative.phone,
    avatarColor: relative.avatarColor,
    photoUrl: relative.photoUrl,
    isDeceased: relative.isDeceased,
    deathYear: relative.deathYear,
    duaText: relative.duaText ?? '',
    notes: relative.notes ?? '',
    fatherId: relative.fatherId ?? null,
    motherId: relative.motherId ?? null,
    spouseId: relative.spouseId ?? null,
    gender: relative.gender,
    maritalStatus: relative.maritalStatus,
    zhuz: relative.zhuz ?? '',
    ru: relative.ru ?? '',
    ataLine: relative.ataLine ?? '',
    tribeBranch: relative.tribeBranch ?? '',
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
  birthdayDay: null,
  birthdayMonth: null,
  birthdayYear: null,
  birthdayYearUnknown: false,
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
  zhuz: '',
  ru: '',
  ataLine: '',
  tribeBranch: '',
};

export function prepareFormFromInput(input: CreateRelativeInput): CreateRelativeInput {
  return syncNameFields(input);
}
