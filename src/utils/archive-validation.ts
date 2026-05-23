import { CreateMemoryInput } from '@/types/archive';

export type MemoryFormErrors = {
  title?: string;
  relativeName?: string;
  year?: string;
  story?: string;
};

export function validateMemoryForm(input: CreateMemoryInput): MemoryFormErrors {
  const errors: MemoryFormErrors = {};

  if (!input.title.trim()) {
    errors.title = 'Введите название истории.';
  }

  if (!input.relativeName.trim()) {
    errors.relativeName = 'Выберите или укажите родственника.';
  }

  if (input.year.trim() && !/^\d{4}$/.test(input.year.trim())) {
    errors.year = 'Год должен быть в формате YYYY.';
  }

  if (!input.story.trim()) {
    errors.story = 'Добавьте короткую историю.';
  }

  return errors;
}

export function hasMemoryFormErrors(errors: MemoryFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
