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
];

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
];

export function hasBirthday(isoDate: string): boolean {
  return Boolean(isoDate?.trim() && /^\d{4}-\d{2}-\d{2}$/.test(isoDate.trim()));
}

export function parseBirthday(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function calculateAge(birthdayIso: string, referenceDate = new Date()): number | null {
  if (!hasBirthday(birthdayIso)) {
    return null;
  }

  const birthday = parseBirthday(birthdayIso);
  let age = referenceDate.getFullYear() - birthday.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthday.getDate())) {
    age -= 1;
  }
  return age;
}

export function formatBirthday(isoDate: string): string {
  const date = parseBirthday(isoDate);
  const day = date.getDate();
  const month = MONTHS_RU[date.getMonth()];
  return `${day} ${month}`;
}

export function formatBirthdayKzRu(isoDate: string): string {
  if (!hasBirthday(isoDate)) {
    return '—';
  }

  const date = parseBirthday(isoDate);
  const day = date.getDate();
  const monthRu = MONTHS_RU[date.getMonth()];
  const monthKz = MONTHS_KZ[date.getMonth()];
  return `${day} ${monthRu} · ${monthKz}`;
}

export function getMonthLabel(monthIndex: number): string {
  return `${MONTHS_RU[monthIndex]} · ${MONTHS_KZ[monthIndex]}`;
}

export function getNextBirthdayDate(birthdayIso: string, referenceDate = new Date()): Date {
  const birthday = parseBirthday(birthdayIso);
  const next = new Date(referenceDate.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (next < startOfDay(referenceDate)) {
    next.setFullYear(referenceDate.getFullYear() + 1);
  }
  return next;
}

export function daysUntilBirthday(birthdayIso: string, referenceDate = new Date()): number {
  if (!hasBirthday(birthdayIso)) {
    return Number.MAX_SAFE_INTEGER;
  }

  const next = getNextBirthdayDate(birthdayIso, referenceDate);
  const diff = startOfDay(next).getTime() - startOfDay(referenceDate).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function isBirthdayToday(birthdayIso: string, referenceDate = new Date()): boolean {
  if (!hasBirthday(birthdayIso)) {
    return false;
  }

  const birthday = parseBirthday(birthdayIso);
  return (
    birthday.getDate() === referenceDate.getDate() &&
    birthday.getMonth() === referenceDate.getMonth()
  );
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatTodayDate(referenceDate = new Date()): string {
  const day = referenceDate.getDate();
  const monthRu = MONTHS_RU[referenceDate.getMonth()];
  const monthKz = MONTHS_KZ[referenceDate.getMonth()];
  const weekday = referenceDate.toLocaleDateString('ru-RU', { weekday: 'long' });
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day} ${monthRu} · ${monthKz}`;
}

export function formatDaysUntil(days: number): string {
  if (days === 0) return 'Бүгін · Сегодня';
  if (days === 1) return 'Ертең · Завтра';
  return `Через ${days} дн. · ${days} күннен кейін`;
}

export function formatBirthdayCountdownLabel(days: number): string {
  if (days === 0) {
    return 'Сегодня';
  }

  if (days === 1) {
    return 'Завтра';
  }

  return `Через ${days} дней`;
}

export function getAgeTurningOnNextBirthday(
  birthdayIso: string,
  referenceDate = new Date(),
): number | null {
  if (!hasBirthday(birthdayIso)) {
    return null;
  }

  const birth = parseBirthday(birthdayIso);
  const next = getNextBirthdayDate(birthdayIso, referenceDate);
  let age = next.getFullYear() - birth.getFullYear();

  if (
    next.getMonth() < birth.getMonth() ||
    (next.getMonth() === birth.getMonth() && next.getDate() < birth.getDate())
  ) {
    age -= 1;
  }

  return age;
}

export function getAgeTurningLabel(birthdayIso: string, referenceDate = new Date()): string | null {
  const age = getAgeTurningOnNextBirthday(birthdayIso, referenceDate);
  if (age === null) {
    return null;
  }

  return `Исполнится ${age} ${pluralYears(age)}`;
}

export function getUpcomingBirthdayLabel(
  birthdayIso: string,
  referenceDate = new Date(),
): string | null {
  if (!hasBirthday(birthdayIso)) {
    return null;
  }

  const days = daysUntilBirthday(birthdayIso, referenceDate);

  if (days === 0) {
    return 'Сегодня';
  }

  if (days === 1) {
    return 'Через 1 день';
  }

  if (days === 2) {
    return 'Через 2 дня';
  }

  if (days === 3) {
    return 'Через 3 дня';
  }

  if (days >= 28 && days <= 31) {
    return 'Через 1 месяц';
  }

  return null;
}

export function getAgeLabel(age: number): string {
  return `${age} ${pluralYears(age)}`;
}

function pluralYears(age: number): string {
  const mod10 = age % 10;
  const mod100 = age % 100;
  if (mod10 === 1 && mod100 !== 11) return 'год';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'года';
  return 'лет';
}
