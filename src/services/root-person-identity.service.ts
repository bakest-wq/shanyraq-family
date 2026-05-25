import type { Relative } from '@/types/relative';

/** Resolve the active kinship root — «Мен» until focus is ready, then focus ?? me. */
export function resolveRootPerson(
  focusRootPerson: Relative | null,
  mePerson: Relative | null,
  isReady: boolean,
): Relative | null {
  if (!isReady) {
    return mePerson;
  }

  return focusRootPerson ?? mePerson;
}

export function isMeRootPerson(
  rootPerson: Relative | null,
  mePerson: Relative | null,
): boolean {
  if (!rootPerson || !mePerson) {
    return false;
  }

  return rootPerson.id === mePerson.id;
}

export function shouldResetFocusOnIdentityChange(
  previousRelativeId: string | null,
  nextRelativeId: string | null,
): boolean {
  if (previousRelativeId === null) {
    return false;
  }

  return previousRelativeId !== nextRelativeId;
}
