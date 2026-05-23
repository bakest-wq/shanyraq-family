import { CreateRelativeInput, Relative } from '@/types/relative';

export function composeFullName(input: {
  firstName?: string;
  middleName?: string;
  currentSurname?: string;
  fullName?: string;
}): string {
  const parts = [input.firstName?.trim(), input.middleName?.trim(), input.currentSurname?.trim()].filter(
    Boolean,
  );

  if (parts.length > 0) {
    return parts.join(' ');
  }

  return input.fullName?.trim() ?? '';
}

export function composeDisplayName(input: {
  displayName?: string;
  firstName?: string;
  middleName?: string;
  currentSurname?: string;
  fullName?: string;
}): string {
  if (input.displayName?.trim()) {
    return input.displayName.trim();
  }

  const full = composeFullName(input);
  if (full) {
    return full;
  }

  return input.firstName?.trim() ?? '';
}

export function getRelativeDisplayName(relative: Relative): string {
  return relative.displayName || relative.fullName || relative.firstName;
}

export function parseLegacyFullName(fullName: string): {
  firstName: string;
  middleName?: string;
  currentSurname?: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: '' };
  }

  if (parts.length === 1) {
    return { firstName: parts[0] };
  }

  if (parts.length === 2) {
    return { firstName: parts[0], currentSurname: parts[1] };
  }

  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    currentSurname: parts[parts.length - 1],
  };
}

export function syncNameFields(input: CreateRelativeInput): CreateRelativeInput {
  const fullName = composeFullName(input);
  const displayName = composeDisplayName({ ...input, fullName });

  return {
    ...input,
    firstName: input.firstName.trim() || parseLegacyFullName(fullName).firstName,
    fullName,
    displayName,
  };
}
