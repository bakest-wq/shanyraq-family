import { CreateMemoryInput } from '@/types/archive';

export type MemoryFormErrors = {
  title?: string;
  relativeName?: string;
  year?: string;
  month?: string;
  day?: string;
  story?: string;
};

export function validateMemoryForm(input: CreateMemoryInput): MemoryFormErrors {
  const errors: MemoryFormErrors = {};

  if (!input.title.trim()) {
    errors.title = 'Атауын жазыңыз · Укажите название';
  }

  if (!input.relativeName.trim()) {
    errors.relativeName = 'Туыс таңдаңыз · Выберите родственника';
  }

  if (input.year.trim() && !/^\d{4}$/.test(input.year.trim())) {
    errors.year = 'Жыл YYYY форматында · Год в формате YYYY';
  }

  if (input.month?.trim()) {
    const month = Number(input.month.trim());
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      errors.month = 'Ай 1–12 · Месяц от 1 до 12';
    }
  }

  if (input.day?.trim()) {
    const day = Number(input.day.trim());
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      errors.day = 'Күн 1–31 · День от 1 до 31';
    }
  }

  if (!input.story.trim()) {
    errors.story = 'Қысқа сипаттама жазыңыз · Добавьте описание';
  }

  return errors;
}

export function hasMemoryFormErrors(errors: MemoryFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
