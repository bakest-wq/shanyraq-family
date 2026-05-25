import { CreateRelativeInput, Relative } from '@/types/relative';

/** Build full name when saving — not for display when full_name is stored. */
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

function hasCustomDisplayName(displayName?: string, fullName?: string, composedFull?: string): boolean {
  const trimmedDisplay = displayName?.trim();
  if (!trimmedDisplay) {
    return false;
  }

  if (trimmedDisplay === fullName?.trim()) {
    return false;
  }

  if (composedFull && trimmedDisplay === composedFull) {
    return false;
  }

  return true;
}

/** Prefer stored full_name — never concatenate name parts for display. */
export function getRelativeDisplayName(relative: Relative): string {
  const storedFull = relative.fullName?.trim();
  if (storedFull) {
    return storedFull;
  }

  const storedDisplay = relative.displayName?.trim();
  if (storedDisplay) {
    return storedDisplay;
  }

  return relative.firstName?.trim() || '—';
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
  const autoDisplay = composeDisplayName({
    firstName: input.firstName,
    middleName: input.middleName,
    currentSurname: input.currentSurname,
    fullName,
  });
  const displayName = hasCustomDisplayName(input.displayName, input.fullName, fullName)
    ? input.displayName!.trim()
    : autoDisplay;

  return {
    ...input,
    firstName: input.firstName.trim() || parseLegacyFullName(fullName).firstName,
    fullName,
    displayName,
  };
}

export function resolveRelativeFromList(relative: Relative, relatives: Relative[]): Relative {
  return relatives.find((item) => item.id === relative.id) ?? relative;
}
