import { CreateTimelineEventInput } from '@/types/timeline';

export type TimelineFormErrors = Partial<
  Record<'title' | 'year' | 'month' | 'day' | 'description', string>
>;

const MIN_YEAR = 1800;

export function validateTimelineForm(form: CreateTimelineEventInput): TimelineFormErrors {
  const errors: TimelineFormErrors = {};

  if (!form.title.trim()) {
    errors.title = 'Атауын жазыңыз · Укажите название';
  }

  if (form.year.trim()) {
    const year = Number(form.year.trim());
    if (!Number.isInteger(year) || year < MIN_YEAR || year > new Date().getFullYear() + 1) {
      errors.year = 'Жылды дұрыс жазыңыз · Формат YYYY';
    }
  }

  if (form.month?.trim()) {
    const month = Number(form.month.trim());
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      errors.month = 'Ай 1–12 · Месяц от 1 до 12';
    }
  }

  if (form.day?.trim()) {
    const day = Number(form.day.trim());
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      errors.day = 'Күн 1–31 · День от 1 до 31';
    }
  }

  return errors;
}

export function hasTimelineFormErrors(errors: TimelineFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
