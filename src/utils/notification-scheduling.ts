import { hasBirthday, parseBirthday } from '@/utils/dates';
import { Relative } from '@/types/relative';
import { resolveBirthdayParts } from '@/utils/birthday-parts';

export function getYearlyReminderParts(
  birthdayIso: string,
  daysBefore: number,
): { month: number; day: number } {
  const birthday = parseBirthday(birthdayIso);
  const reminder = new Date(2024, birthday.getMonth(), birthday.getDate());
  reminder.setDate(reminder.getDate() - daysBefore);

  return {
    month: reminder.getMonth() + 1,
    day: reminder.getDate(),
  };
}

export function getYearlyReminderPartsForRelative(
  relative: Relative,
  daysBefore: number,
): { month: number; day: number } | null {
  const parts = resolveBirthdayParts(relative);
  if (!parts) {
    return null;
  }

  const reminder = new Date(2024, parts.month - 1, parts.day);
  reminder.setDate(reminder.getDate() - daysBefore);

  return {
    month: reminder.getMonth() + 1,
    day: reminder.getDate(),
  };
}

export function getMemorialAnniversaryParts(relative: Relative): { month: number; day: number } {
  const parts = getYearlyReminderPartsForRelative(relative, 0);
  if (parts) {
    return parts;
  }

  if (hasBirthday(relative.birthday)) {
    return getYearlyReminderParts(relative.birthday, 0);
  }

  if (relative.createdAt) {
    const created = new Date(relative.createdAt);
    return {
      month: created.getMonth() + 1,
      day: created.getDate(),
    };
  }

  return { month: 6, day: 15 };
}

export const BIRTHDAY_OFFSETS = [
  { key: 'onBirthday' as const, daysBefore: 0 as const },
  { key: 'oneDayBefore' as const, daysBefore: 1 as const },
  { key: 'threeDaysBefore' as const, daysBefore: 3 as const },
  { key: 'sevenDaysBefore' as const, daysBefore: 7 as const },
];
