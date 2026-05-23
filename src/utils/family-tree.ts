import { Relative } from '@/types/relative';

export type FamilyUnit = {
  key: string;
  father: Relative | null;
  mother: Relative | null;
  children: Relative[];
};

export type FamilyTreeData = {
  units: FamilyUnit[];
  unlinked: Relative[];
};

function unitKey(fatherId?: string, motherId?: string): string {
  return `${fatherId ?? 'none'}:${motherId ?? 'none'}`;
}

export function isLinkedToTree(relative: Relative): boolean {
  return Boolean(relative.fatherId || relative.motherId);
}

export function buildFamilyTree(relatives: Relative[]): FamilyTreeData {
  const living = relatives.filter((relative) => !relative.isDeceased);
  const byId = new Map(living.map((relative) => [relative.id, relative]));
  const unitsMap = new Map<string, FamilyUnit>();

  for (const child of living) {
    if (!child.fatherId && !child.motherId) {
      continue;
    }

    const key = unitKey(child.fatherId, child.motherId);
    const existing = unitsMap.get(key);

    if (existing) {
      existing.children.push(child);
      continue;
    }

    unitsMap.set(key, {
      key,
      father: child.fatherId ? byId.get(child.fatherId) ?? null : null,
      mother: child.motherId ? byId.get(child.motherId) ?? null : null,
      children: [child],
    });
  }

  const units = Array.from(unitsMap.values()).sort((a, b) =>
    a.children[0]?.fullName.localeCompare(b.children[0]?.fullName ?? '', 'ru'),
  );

  for (const unit of units) {
    unit.children.sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'));
  }

  const linkedParentIds = new Set<string>();
  for (const child of living) {
    if (child.fatherId) {
      linkedParentIds.add(child.fatherId);
    }
    if (child.motherId) {
      linkedParentIds.add(child.motherId);
    }
  }

  const unlinked = living
    .filter(
      (relative) =>
        !isLinkedToTree(relative) && !linkedParentIds.has(relative.id),
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'));

  return { units, unlinked };
}

export function getParentCandidates(
  relatives: Relative[],
  childId: string,
  role: 'father' | 'mother',
): Relative[] {
  return relatives
    .filter((relative) => {
      if (relative.id === childId) {
        return false;
      }

      if (relative.isDeceased) {
        return false;
      }

      const relationship = relative.relationship.toLowerCase();
      if (role === 'father') {
        return /^(ата|әке|аға|бала|немере)/i.test(relative.relationship) || relationship.includes('әke') || relationship.includes('ата');
      }

      return /^(апа|ана|әпке|бала|немере)/i.test(relative.relationship) || relationship.includes('ана') || relationship.includes('апа');
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'));
}

/** Fallback: all relatives except self when no role match. */
export function getAllParentCandidates(relatives: Relative[], childId: string): Relative[] {
  return relatives
    .filter((relative) => relative.id !== childId && !relative.isDeceased)
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'));
}
