import { CreateRelativeInput } from '@/types/relative';
import {
  getBirthYearForValidation,
  syncBirthdayFields,
  validateBirthdayPartsInput,
} from '@/utils/birthday-parts';
import { syncNameFields } from '@/utils/relative-names';

export type RelativeFormErrors = Partial<
  Record<keyof CreateRelativeInput | 'deathYear', string>
>;

export function normalizeKazakhPhone(input: string): string {
  const digits = input.replace(/\D/g, '');

  if (digits.startsWith('8') && digits.length === 11) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.startsWith('7') && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+7${digits}`;
  }

  return input.trim();
}

export function isValidKazakhPhone(phone: string): boolean {
  if (!phone.trim()) {
    return true;
  }

  return /^\+7\d{10}$/.test(normalizeKazakhPhone(phone));
}

export function validateRelativeForm(input: CreateRelativeInput): RelativeFormErrors {
  const errors: RelativeFormErrors = {};
  const synced = syncNameFields(input);
  const birthdayFields = syncBirthdayFields(input);

  if (!synced.firstName.trim() && !synced.fullName.trim()) {
    errors.firstName = 'Введите имя · Атын жазыңыз';
  }

  if (!input.relationship.trim()) {
    errors.relationship = 'Выберите родство · Туыстықты таңдаңыз';
  }

  const birthdayError = validateBirthdayPartsInput(birthdayFields);
  if (birthdayError) {
    errors.birthday = birthdayError;
  }

  if (input.phone?.trim() && !isValidKazakhPhone(input.phone)) {
    errors.phone = 'Формат: +77001234567';
  }

  if (input.isDeceased) {
    if (!input.deathYear) {
      errors.deathYear = 'Укажите год смерти · 4 цифры';
    } else if (!/^\d{4}$/.test(String(input.deathYear))) {
      errors.deathYear = 'Год смерти — 4 цифры (например 2015)';
    } else {
      const birthYear = getBirthYearForValidation(birthdayFields);
      if (birthYear && input.deathYear < birthYear) {
        errors.deathYear = 'Год смерти не может быть раньше рождения';
      }
    }
  }

  return errors;
}

export function hasFormErrors(errors: RelativeFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function prepareRelativeInput(input: CreateRelativeInput): CreateRelativeInput {
  const synced = syncNameFields(input);
  const birthdayFields = syncBirthdayFields(input);

  return {
    ...synced,
    ...birthdayFields,
    phone: synced.phone?.trim() ? normalizeKazakhPhone(synced.phone) : '',
    duaText: synced.duaText?.trim() || '',
    notes: synced.notes?.trim() || '',
    middleName: synced.middleName?.trim() || '',
    birthSurname: synced.birthSurname?.trim() || '',
    currentSurname: synced.currentSurname?.trim() || '',
    displayName: synced.displayName?.trim() || synced.fullName,
    zhuz: synced.zhuz?.trim() || '',
    ru: synced.ru?.trim() || '',
    ataLine: synced.ataLine?.trim() || '',
    tribeBranch: synced.tribeBranch?.trim() || '',
  };
}
