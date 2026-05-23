import { CreateRelativeInput } from '@/types/relative';

export type RelativeFormErrors = Partial<
  Record<keyof CreateRelativeInput | 'deathYear', string>
>;

const BIRTHDAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

function isValidBirthday(value: string): boolean {
  if (!BIRTHDAY_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function validateRelativeForm(input: CreateRelativeInput): RelativeFormErrors {
  const errors: RelativeFormErrors = {};

  if (!input.fullName.trim()) {
    errors.fullName = 'Введите полное имя · Толық атын жазыңыз';
  }

  if (!input.relationship.trim()) {
    errors.relationship = 'Выберите родство · Туыстықты таңдаңыз';
  }

  if (input.birthday.trim()) {
    if (!BIRTHDAY_PATTERN.test(input.birthday.trim())) {
      errors.birthday = 'Формат: YYYY-MM-DD (например 1990-05-23)';
    } else if (!isValidBirthday(input.birthday.trim())) {
      errors.birthday = 'Некорректная дата';
    }
  }

  if (input.phone?.trim() && !isValidKazakhPhone(input.phone)) {
    errors.phone = 'Формат: +77001234567';
  }

  if (input.isDeceased) {
    if (!input.deathYear) {
      errors.deathYear = 'Укажите год смерти · 4 цифры';
    } else if (!/^\d{4}$/.test(String(input.deathYear))) {
      errors.deathYear = 'Год смерти — 4 цифры (например 2015)';
    } else if (input.birthday.trim()) {
      const birthYear = Number(input.birthday.trim().slice(0, 4));
      if (input.deathYear < birthYear) {
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
  return {
    ...input,
    fullName: input.fullName.trim(),
    relationship: input.relationship.trim(),
    birthday: input.birthday.trim(),
    phone: input.phone?.trim() ? normalizeKazakhPhone(input.phone) : '',
    duaText: input.duaText?.trim() || '',
    notes: input.notes?.trim() || '',
  };
}
