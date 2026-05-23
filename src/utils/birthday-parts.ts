import type { CreateRelativeInput, Relative } from '@/types/relative';
import { getMonthLabel, hasBirthday, parseBirthday, startOfDay } from '@/utils/dates';

export type BirthdayPartsInput = {
  birthday?: string;
  birthdayDay?: number | null;
  birthdayMonth?: number | null;
  birthdayYear?: number | null;
  birthdayYearUnknown?: boolean;
};

export type ResolvedBirthdayParts = {
  day: number;
  month: number;
  year: number | null;
};

export const BIRTHDAY_MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: getMonthLabel(index),
}));

const MIN_BIRTH_YEAR = 1900;

export function getMaxBirthYear(referenceDate = new Date()): number {
  return referenceDate.getFullYear();
}

export function getBirthYearOptions(referenceDate = new Date()): number[] {
  const maxYear = getMaxBirthYear(referenceDate);
  return Array.from({ length: maxYear - MIN_BIRTH_YEAR + 1 }, (_, index) => maxYear - index);
}

export function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

export function composeBirthdayIso(
  day: number,
  month: number,
  year: number,
): string {
  return `${year}-${padTwo(month)}-${padTwo(day)}`;
}

export function parseBirthdayIso(iso: string): ResolvedBirthdayParts | null {
  if (!hasBirthday(iso)) {
    return null;
  }

  const date = parseBirthday(iso);
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function resolveBirthdayParts(source: BirthdayPartsInput): ResolvedBirthdayParts | null {
  if (source.birthdayDay && source.birthdayMonth) {
    return {
      day: source.birthdayDay,
      month: source.birthdayMonth,
      year: source.birthdayYearUnknown ? null : source.birthdayYear ?? null,
    };
  }

  if (source.birthday?.trim()) {
    return parseBirthdayIso(source.birthday);
  }

  return null;
}

export function hasBirthdayDayMonth(source: BirthdayPartsInput): boolean {
  return Boolean(resolveBirthdayParts(source));
}

export function hasBirthdayYear(source: BirthdayPartsInput): boolean {
  const parts = resolveBirthdayParts(source);
  return Boolean(parts?.year);
}

export function getDaysInMonth(month: number, year?: number | null): number {
  if (year) {
    return new Date(year, month, 0).getDate();
  }

  return [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : month === 2 ? 29 : 30;
}

export function clampBirthdayDay(day: number, month: number, year?: number | null): number {
  const maxDay = getDaysInMonth(month, year);
  return Math.min(Math.max(day, 1), maxDay);
}

export function syncBirthdayFields<T extends BirthdayPartsInput>(input: T): T & {
  birthday: string;
  birthdayDay: number | null;
  birthdayMonth: number | null;
  birthdayYear: number | null;
  birthdayYearUnknown: boolean;
} {
  const yearUnknown = input.birthdayYearUnknown ?? false;
  let day = input.birthdayDay ?? null;
  let month = input.birthdayMonth ?? null;
  let year = yearUnknown ? null : input.birthdayYear ?? null;

  if (day && month) {
    day = clampBirthdayDay(day, month, year);
  } else if (day) {
    day = Math.min(Math.max(day, 1), 31);
  }

  const birthday =
    day && month && year ? composeBirthdayIso(day, month, year) : '';

  return {
    ...input,
    birthdayDay: day,
    birthdayMonth: month,
    birthdayYear: year,
    birthdayYearUnknown: yearUnknown,
    birthday,
  };
}

export function formatBirthdayDisplay(source: BirthdayPartsInput): string {
  const parts = resolveBirthdayParts(source);
  if (!parts) {
    return '—';
  }

  const monthLabel = getMonthLabel(parts.month - 1);

  if (parts.year) {
    return `${parts.day} ${monthLabel}, ${parts.year}`;
  }

  return `${parts.day} ${monthLabel} · Жыл белгісіз`;
}

/** Alias used across UI instead of raw ISO formatting. */
export function formatRelativeBirthday(source: BirthdayPartsInput): string {
  return formatBirthdayDisplay(source);
}

export function getNextBirthdayDateForParts(
  day: number,
  month: number,
  referenceDate = new Date(),
): Date {
  const next = new Date(referenceDate.getFullYear(), month - 1, day);
  if (next < startOfDay(referenceDate)) {
    next.setFullYear(referenceDate.getFullYear() + 1);
  }
  return next;
}

export function daysUntilBirthdayForRelative(
  relative: BirthdayPartsInput,
  referenceDate = new Date(),
): number {
  const parts = resolveBirthdayParts(relative);
  if (!parts) {
    return Number.MAX_SAFE_INTEGER;
  }

  const next = getNextBirthdayDateForParts(parts.day, parts.month, referenceDate);
  const diff = startOfDay(next).getTime() - startOfDay(referenceDate).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function isBirthdayTodayForRelative(
  relative: BirthdayPartsInput,
  referenceDate = new Date(),
): boolean {
  const parts = resolveBirthdayParts(relative);
  if (!parts) {
    return false;
  }

  return (
    parts.day === referenceDate.getDate() && parts.month === referenceDate.getMonth() + 1
  );
}

export function calculateAgeForRelative(
  relative: BirthdayPartsInput,
  referenceDate = new Date(),
): number | null {
  const parts = resolveBirthdayParts(relative);
  if (!parts?.year) {
    return null;
  }

  let age = referenceDate.getFullYear() - parts.year;
  const monthDiff = referenceDate.getMonth() + 1 - parts.month;
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < parts.day)) {
    age -= 1;
  }

  return age;
}

export function getAgeTurningOnNextBirthdayForRelative(
  relative: BirthdayPartsInput,
  referenceDate = new Date(),
): number | null {
  const parts = resolveBirthdayParts(relative);
  if (!parts?.year) {
    return null;
  }

  const next = getNextBirthdayDateForParts(parts.day, parts.month, referenceDate);
  let age = next.getFullYear() - parts.year;

  if (
    next.getMonth() + 1 < parts.month ||
    (next.getMonth() + 1 === parts.month && next.getDate() < parts.day)
  ) {
    age -= 1;
  }

  return age;
}

export function relativeToBirthdayFormParts(relative: Relative): Pick<
  CreateRelativeInput,
  'birthday' | 'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'birthdayYearUnknown'
> {
  const parts = resolveBirthdayParts(relative);

  if (!parts) {
    return {
      birthday: '',
      birthdayDay: null,
      birthdayMonth: null,
      birthdayYear: null,
      birthdayYearUnknown: false,
    };
  }

  return {
    birthdayDay: parts.day,
    birthdayMonth: parts.month,
    birthdayYear: parts.year,
    birthdayYearUnknown: relative.birthdayYearUnknown ?? parts.year === null,
    birthday: parts.year ? composeBirthdayIso(parts.day, parts.month, parts.year) : '',
  };
}

export function validateBirthdayPartsInput(input: BirthdayPartsInput): string | undefined {
  const hasDay = Boolean(input.birthdayDay);
  const hasMonth = Boolean(input.birthdayMonth);

  if (hasDay !== hasMonth) {
    return 'Выберите день и месяц · Күн мен айды таңдаңыз';
  }

  if (!hasDay || !hasMonth || !input.birthdayDay || !input.birthdayMonth) {
    return undefined;
  }

  const yearUnknown = input.birthdayYearUnknown ?? false;
  const year = yearUnknown ? null : input.birthdayYear ?? null;

  if (!yearUnknown && year) {
    if (year < MIN_BIRTH_YEAR || year > getMaxBirthYear()) {
      return `Год: ${MIN_BIRTH_YEAR}–${getMaxBirthYear()}`;
    }
  }

  if (!yearUnknown && !year) {
    return undefined;
  }

  const maxDay = getDaysInMonth(input.birthdayMonth, year);
  if (input.birthdayDay < 1 || input.birthdayDay > maxDay) {
    return 'Некорректная дата · Қате күн';
  }

  return undefined;
}

export function getBirthYearForValidation(input: BirthdayPartsInput): number | null {
  const parts = resolveBirthdayParts(input);
  return parts?.year ?? null;
}
