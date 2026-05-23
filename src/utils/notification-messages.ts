import { Relative } from '@/types/relative';

type BirthdayOffset = 0 | 1 | 3 | 7;

export function buildBirthdayNotificationTitle(): string {
  return 'Shanyraq Family · Туған күн';
}

export function buildBirthdayNotificationBody(relative: Relative, daysBefore: BirthdayOffset): string {
  const name = relative.fullName;

  if (daysBefore === 0) {
    return `🎂 Сегодня день рождения ${name}`;
  }

  if (daysBefore === 1) {
    return `🎂 Завтра день рождения ${name}`;
  }

  if (daysBefore === 3) {
    return `🎂 Через 3 дня день рождения ${name}`;
  }

  return `🎂 Через 7 дней день рождения ${name}`;
}

export function buildMemorialNotificationTitle(): string {
  return 'Shanyraq Family · Еске алу';
}

export function buildMemorialNotificationBody(relative: Relative): string {
  const customDua = relative.duaText?.trim();

  if (customDua) {
    return `🤲 ${customDua}`;
  }

  return `🤲 Не забудьте прочитать дуа за ${relative.fullName}`;
}

export function buildTestNotificationBody(): string {
  return '🏠 Тестовое напоминание Shanyraq Family — всё работает!';
}
