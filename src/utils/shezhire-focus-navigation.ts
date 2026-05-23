export type ShezhireFocusCrumb = {
  id: string;
  label: string;
};

export function createFocusCrumb(id: string, label: string): ShezhireFocusCrumb {
  return { id, label };
}

/** Append or truncate navigation path when focus changes. */
export function appendFocusCrumb(
  crumbs: ShezhireFocusCrumb[],
  id: string,
  label: string,
): ShezhireFocusCrumb[] {
  const existingIndex = crumbs.findIndex((crumb) => crumb.id === id);

  if (existingIndex >= 0) {
    return crumbs.slice(0, existingIndex + 1);
  }

  return [...crumbs, createFocusCrumb(id, label)];
}

export function truncateFocusCrumbs(
  crumbs: ShezhireFocusCrumb[],
  id: string,
): ShezhireFocusCrumb[] {
  const index = crumbs.findIndex((crumb) => crumb.id === id);

  if (index < 0) {
    return crumbs;
  }

  return crumbs.slice(0, index + 1);
}

export function syncFocusCrumbsWithRoot(
  crumbs: ShezhireFocusCrumb[],
  rootId: string,
  rootLabel: string,
): ShezhireFocusCrumb[] {
  if (crumbs.length === 0) {
    return [createFocusCrumb(rootId, rootLabel)];
  }

  const last = crumbs[crumbs.length - 1];
  if (last.id === rootId) {
    return crumbs;
  }

  return appendFocusCrumb(crumbs, rootId, rootLabel);
}
