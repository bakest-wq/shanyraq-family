import { CreateMemoryInput } from '@/types/archive';
import { kk, FAMILY_LANGUAGE } from '@/content/family-language';

export type MemoryFormErrors = {
  title?: string;
  relativeName?: string;
  year?: string;
  month?: string;
  day?: string;
  story?: string;
  photo?: string;
};

export function validateMemoryForm(input: CreateMemoryInput): MemoryFormErrors {
  const errors: MemoryFormErrors = {};

  if (!input.title.trim()) {
    errors.title = kk(FAMILY_LANGUAGE.errors.titleRequired);
  }

  if (!input.relativeName.trim()) {
    errors.relativeName = 'Туыс таңдаңыз';
  }

  if (input.year.trim() && !/^\d{4}$/.test(input.year.trim())) {
    errors.year = 'Жылды дұрыс жазыңыз';
  }

  if (input.month?.trim()) {
    const month = Number(input.month.trim());
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      errors.month = 'Ай 1–12';
    }
  }

  if (input.day?.trim()) {
    const day = Number(input.day.trim());
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      errors.day = 'Күн 1–31';
    }
  }

  if (input.category === 'photo') {
    if (!input.pendingPhotoUri) {
      errors.photo = 'Фото таңдаңыз';
    }
  } else if (input.category === 'note') {
    if (!input.story.trim()) {
      errors.story = 'Қысқа жазба жазыңыз';
    }
  } else if (!input.story.trim()) {
    errors.story = 'Естелік мәтінін жазыңыз';
  }

  return errors;
}

export function hasMemoryFormErrors(errors: MemoryFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
