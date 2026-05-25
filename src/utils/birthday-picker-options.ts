import {
  BIRTHDAY_MONTH_OPTIONS,
  clampBirthdayDay,
  getBirthYearOptions,
  getDaysInMonth,
  getMaxBirthYear,
  MIN_BIRTH_YEAR,
} from '@/utils/birthday-parts';
import { getMonthLabel } from '@/utils/dates';

const MONTHS_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const;

const MONTHS_KZ = [
  'Қаңтар',
  'Ақпан',
  'Наурыз',
  'Сәуір',
  'Мамыр',
  'Маусым',
  'Шілде',
  'Тамыз',
  'Қыркүйек',
  'Қазан',
  'Қараша',
  'Желтоқсан',
] as const;

const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const BIRTHDAY_PICKER_COPY = {
  searchPlaceholder: 'Іздеу · Поиск',
  manualInputLabel: 'Күнді қолмен енгізу',
  manualInputPlaceholder: '27.03.1965 · 1965-03-27',
  manualInputApply: 'Қолдану',
  yearUnknown: 'Жыл белгісіз',
  manualInputInvalid: 'Күнді DD.MM.YYYY немесе YYYY-MM-DD форматында енгізіңіз',
} as const;

const RECENT_YEAR_COUNT = 32;
const SELECTED_YEAR_RADIUS = 8;

function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function monthMatchesSearch(month: number, query: string): boolean {
  const normalized = normalizeSearchQuery(query);

  if (!normalized) {
    return true;
  }

  const index = month - 1;

  if (index < 0 || index > 11) {
    return false;
  }

  const terms = [
    String(month),
    MONTHS_KZ[index],
    MONTHS_RU[index],
    MONTHS_EN[index],
    getMonthLabel(index),
  ];

  return terms.some((term) => term.toLowerCase().includes(normalized));
}

export function filterBirthdayDayOptions(days: number[], query: string): number[] {
  const normalized = normalizeSearchQuery(query);

  if (!normalized) {
    return days;
  }

  return days.filter((day) => String(day).includes(normalized));
}

export function filterBirthdayMonthOptions(query: string) {
  const normalized = normalizeSearchQuery(query);

  return BIRTHDAY_MONTH_OPTIONS.filter((option) => monthMatchesSearch(option.value, normalized));
}

export function filterBirthdayYearOptions(years: number[], query: string): number[] {
  const normalized = normalizeSearchQuery(query);

  if (!normalized) {
    return years;
  }

  return years.filter((year) => String(year).includes(normalized));
}

export function getCompactBirthYearOptions(options: {
  searchQuery?: string;
  selectedYear?: number | null;
  referenceDate?: Date;
}): number[] {
  const allYears = getBirthYearOptions(options.referenceDate);
  const searchQuery = options.searchQuery?.trim() ?? '';

  if (searchQuery) {
    return filterBirthdayYearOptions(allYears, searchQuery);
  }

  const recentYears = allYears.slice(0, RECENT_YEAR_COUNT);
  const selectedYear = options.selectedYear;

  if (!selectedYear || recentYears.includes(selectedYear)) {
    return recentYears;
  }

  const nearbyYears: number[] = [];

  for (
    let year = selectedYear - SELECTED_YEAR_RADIUS;
    year <= selectedYear + SELECTED_YEAR_RADIUS;
    year += 1
  ) {
    if (year >= MIN_BIRTH_YEAR && year <= getMaxBirthYear(options.referenceDate)) {
      nearbyYears.push(year);
    }
  }

  const merged = new Set<number>([...recentYears, ...nearbyYears]);
  return [...merged].sort((left, right) => right - left);
}

export type ParsedManualBirthday = {
  day: number;
  month: number;
  year: number | null;
  yearUnknown: boolean;
};

function isValidBirthdayParts(day: number, month: number, year: number | null): boolean {
  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1 || day > getDaysInMonth(month, year)) {
    return false;
  }

  if (year !== null) {
    if (year < MIN_BIRTH_YEAR || year > getMaxBirthYear()) {
      return false;
    }
  }

  return true;
}

export function parseManualBirthdayInput(raw: string): ParsedManualBirthday | null {
  const trimmed = raw.trim();

  if (!trimmed) {
    return null;
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);

    if (!isValidBirthdayParts(day, month, year)) {
      return null;
    }

    return {
      day: clampBirthdayDay(day, month, year),
      month,
      year,
      yearUnknown: false,
    };
  }

  const dottedMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dottedMatch) {
    const day = Number(dottedMatch[1]);
    const month = Number(dottedMatch[2]);
    const year = Number(dottedMatch[3]);

    if (!isValidBirthdayParts(day, month, year)) {
      return null;
    }

    return {
      day: clampBirthdayDay(day, month, year),
      month,
      year,
      yearUnknown: false,
    };
  }

  return null;
}
