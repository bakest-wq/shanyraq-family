import type { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';

function linkChanged(before: Relative | undefined, after: Relative): boolean {
  if (!before) {
    return false;
  }

  return (
    (before.fatherId ?? null) !== (after.fatherId ?? null) ||
    (before.motherId ?? null) !== (after.motherId ?? null) ||
    (before.spouseId ?? null) !== (after.spouseId ?? null) ||
    before.gender !== after.gender
  );
}

/** Human-readable summary for a graph version entry. */
export function summarizeGraphChange(before: Relative[], after: Relative[]): string {
  const countDiff = after.length - before.length;

  if (countDiff > 0) {
    return countDiff === 1 ? 'Жаңа туыс қосылды' : `${countDiff} туыс қосылды`;
  }

  if (countDiff < 0) {
    const removed = Math.abs(countDiff);
    return removed === 1 ? 'Туыс жойылды' : `${removed} туыс жойылды`;
  }

  const beforeById = new Map(before.map((relative) => [relative.id, relative]));
  const linkChanges: string[] = [];

  for (const relative of after) {
    const previous = beforeById.get(relative.id);
    if (!previous) {
      continue;
    }

    if ((previous.fatherId ?? null) !== (relative.fatherId ?? null)) {
      linkChanges.push('әке байланысы');
    }

    if ((previous.motherId ?? null) !== (relative.motherId ?? null)) {
      linkChanges.push('ана байланысы');
    }

    if ((previous.spouseId ?? null) !== (relative.spouseId ?? null)) {
      linkChanges.push('жұбай байланысы');
    }

    if (previous.gender !== relative.gender) {
      linkChanges.push('жынысы');
    }
  }

  if (linkChanges.length > 0) {
    const unique = [...new Set(linkChanges)];
    if (unique.length === 1) {
      return `${unique[0]} өзгерді`;
    }

    return `${unique.length} байланыс өзгерді`;
  }

  for (const relative of after) {
    const previous = beforeById.get(relative.id);
    if (previous && linkChanged(previous, relative)) {
      return `${getRelativeDisplayName(relative)}: байланыс өзгерді`;
    }
  }

  return 'Шежіре жаңартылды';
}

export function canRestoreGraphVersion(kind: 'change' | 'restore' | 'safety'): boolean {
  return kind === 'change' || kind === 'restore';
}
