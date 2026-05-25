import { CreateRelativeInput } from '@/types/relative';
import { SHEZHIRE_FOCUSED_ROOT } from '@/constants/family-ux-content';
import type { ParentLinkRole } from '@/utils/family-child-links';
import {
  getBirthYearForValidation,
  syncBirthdayFields,
  validateBirthdayPartsInput,
} from '@/utils/birthday-parts';
import {
  ValidateFamilyLinksContext,
  FamilyLinkWarnings,
  validateRelativeFamilyLinksFull,
} from '@/utils/family-link-validation';
import { syncNameFields } from '@/utils/relative-names';
import { isParentSideSiblingRelationship } from '@/utils/parent-side-sibling-add';
import { validateRelativeBeforeSave } from '@/services/graph-integrity.service';

export type RelativeFormErrors = Partial<
  Record<keyof CreateRelativeInput | 'deathYear', string>
>;

export type ValidateRelativeFormContext = ValidateFamilyLinksContext & {
  linkedChildIds?: string[];
  parentLinkRole?: ParentLinkRole;
};

export type RelativeFormValidation = {
  errors: RelativeFormErrors;
  warnings: FamilyLinkWarnings;
};

export function validateRelativeFormWithWarnings(
  input: CreateRelativeInput,
  context?: ValidateRelativeFormContext,
): RelativeFormValidation {
  const errors = validateRelativeForm(input, context);
  const warnings =
    context != null ? validateRelativeFamilyLinksFull(input, context).warnings : {};

  return { errors, warnings };
}

export function getRelativeFormLinkWarnings(
  input: CreateRelativeInput,
  context: ValidateRelativeFormContext,
): FamilyLinkWarnings {
  return validateRelativeFamilyLinksFull(input, context).warnings;
}

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

export function validateRelativeForm(
  input: CreateRelativeInput,
  context?: ValidateRelativeFormContext,
): RelativeFormErrors {
  const errors: RelativeFormErrors = {};
  const synced = syncNameFields(input);
  const birthdayFields = syncBirthdayFields(input);

  if (!synced.firstName.trim() && !synced.fullName.trim()) {
    errors.firstName = 'Атын жазыңыз · Введите имя';
  }

  if (!input.relationship.trim()) {
    errors.relationship = 'Туыстықты таңдаңыз · Выберите родство';
  }

  if (isParentSideSiblingRelationship(input.relationship)) {
    if (!input.fatherId?.trim() || !input.motherId?.trim()) {
      errors.fatherId = SHEZHIRE_FOCUSED_ROOT.parentSide.grandparentsMissingFather;
    }
  }

  const birthdayError = validateBirthdayPartsInput(birthdayFields);
  if (birthdayError) {
    errors.birthday = birthdayError;
  }

  if (input.phone?.trim() && !isValidKazakhPhone(input.phone)) {
    errors.phone = 'Формат: +77001234567';
  }

  if (input.isDeceased) {
    if (!input.deathYear) {
      errors.deathYear = 'Қайтыс болған жыл · 4 цифры';
    } else if (!/^\d{4}$/.test(String(input.deathYear))) {
      errors.deathYear = 'Жыл — 4 цифра (мысалы 2015)';
    } else {
      const birthYear = getBirthYearForValidation(birthdayFields);
      if (birthYear && input.deathYear < birthYear) {
        errors.deathYear = 'Қайтыс жылы туған жылдан бұрын болмауы керек';
      }
    }
  }

  if (context) {
    const integrity = validateRelativeBeforeSave(input, context.relatives, context, {
      linkedChildIds: context.linkedChildIds,
      parentLinkRole: context.parentLinkRole,
    });
    Object.assign(errors, integrity.errors);
  }

  return errors;
}

export function hasFormErrors(errors: RelativeFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function getFirstFormErrorMessage(errors: RelativeFormErrors): string | null {
  const firstKey = Object.keys(errors)[0] as keyof RelativeFormErrors | undefined;
  if (!firstKey) {
    return null;
  }

  return errors[firstKey] ?? null;
}

export function prepareRelativeInput(input: CreateRelativeInput): CreateRelativeInput {
  const synced = syncNameFields(input);
  const birthdayFields = syncBirthdayFields(input);

  return {
    ...synced,
    ...birthdayFields,
    phone: synced.phone?.trim() ? normalizeKazakhPhone(synced.phone) : '',
    duaText: synced.duaText?.trim() || '',
    notes: synced.notes?.trim() || '',
    middleName: synced.middleName?.trim() || '',
    birthSurname: synced.birthSurname?.trim() || '',
    currentSurname: synced.currentSurname?.trim() || '',
    displayName: synced.displayName?.trim() || synced.fullName,
    zhuz: synced.zhuz?.trim() || '',
    ru: synced.ru?.trim() || '',
    ataLine: synced.ataLine?.trim() || '',
    tribeBranch: synced.tribeBranch?.trim() || '',
  };
}
