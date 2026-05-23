import { Relative, RelativeGender } from '@/types/relative';
import {
  FamilyLinkType,
  matchesGenderForFamilyLink,
  relativeLinkIdsMatch,
} from '@/utils/family-link-picker';
import { getAncestorIds, getDescendantIds } from '@/utils/family-link-validation';
import { getRelativeDisplayName } from '@/utils/relative-names';

type ParentPickerLinks = {
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
};

export type ParentLinkCandidate = Relative & {
  isSharedParent: boolean;
};

export type SiblingParentTemplate = {
  sibling: Relative;
  fatherId: string | null;
  motherId: string | null;
};

function isBlockedId(id: string, blockedIds: Set<string>): boolean {
  for (const blockedId of blockedIds) {
    if (relativeLinkIdsMatch(id, blockedId)) {
      return true;
    }
  }

  return false;
}

function addBlockedId(blockedIds: Set<string>, id: string | null | undefined): void {
  if (!id) {
    return;
  }

  blockedIds.add(String(id).trim());
}

export function collectBlockedParentPickerIds(
  relatives: Relative[],
  linkType: 'father' | 'mother',
  context: {
    subjectId?: string;
    links?: ParentPickerLinks;
  },
): Set<string> {
  const { subjectId, links = {} } = context;
  const blockedIds = new Set<string>();

  if (subjectId) {
    addBlockedId(blockedIds, subjectId);
    getDescendantIds(subjectId, relatives).forEach((id) => blockedIds.add(id));
    getAncestorIds(subjectId, relatives).forEach((id) => blockedIds.add(id));
  }

  addBlockedId(blockedIds, links.spouseId);

  if (linkType === 'father') {
    addBlockedId(blockedIds, links.motherId);
    if (links.fatherId) {
      for (const blockedId of [...blockedIds]) {
        if (relativeLinkIdsMatch(blockedId, links.fatherId)) {
          blockedIds.delete(blockedId);
        }
      }
    }
  }

  if (linkType === 'mother') {
    addBlockedId(blockedIds, links.fatherId);
    if (links.motherId) {
      for (const blockedId of [...blockedIds]) {
        if (relativeLinkIdsMatch(blockedId, links.motherId)) {
          blockedIds.delete(blockedId);
        }
      }
    }
  }

  return blockedIds;
}

export function collectSharedParentIds(
  relatives: Relative[],
  subjectId?: string,
): Set<string> {
  const sharedParentIds = new Set<string>();
  const parentGroups = new Map<string, Relative[]>();

  for (const relative of relatives) {
    if (relative.isDeceased) {
      continue;
    }

    if (subjectId && relativeLinkIdsMatch(relative.id, subjectId)) {
      continue;
    }

    if (!relative.fatherId && !relative.motherId) {
      continue;
    }

    const groupKey = `${relative.fatherId ?? 'none'}_${relative.motherId ?? 'none'}`;
    const group = parentGroups.get(groupKey) ?? [];
    group.push(relative);
    parentGroups.set(groupKey, group);
  }

  for (const group of parentGroups.values()) {
    if (group.length === 0) {
      continue;
    }

    for (const member of group) {
      if (member.fatherId) {
        sharedParentIds.add(String(member.fatherId).trim());
      }

      if (member.motherId) {
        sharedParentIds.add(String(member.motherId).trim());
      }
    }
  }

  return sharedParentIds;
}

export function findSiblingParentTemplates(
  relatives: Relative[],
  subjectId?: string,
): SiblingParentTemplate[] {
  return relatives
    .filter((relative) => !relative.isDeceased)
    .filter((relative) => !subjectId || !relativeLinkIdsMatch(relative.id, subjectId))
    .filter((relative) => Boolean(relative.fatherId || relative.motherId))
    .map((relative) => ({
      sibling: relative,
      fatherId: relative.fatherId ?? null,
      motherId: relative.motherId ?? null,
    }))
    .sort((left, right) =>
      getRelativeDisplayName(left.sibling).localeCompare(
        getRelativeDisplayName(right.sibling),
        'ru',
      ),
    );
}

export function buildSiblingParentApplyLabel(sibling: Relative): string {
  return `${getRelativeDisplayName(sibling)}мен бірдей ата-ананы қолдану`;
}

export function buildParentLinkCandidates(
  relatives: Relative[],
  linkType: 'father' | 'mother',
  context: {
    subjectId?: string;
    subjectGender?: RelativeGender;
    links?: ParentPickerLinks;
  },
): ParentLinkCandidate[] {
  const blockedIds = collectBlockedParentPickerIds(relatives, linkType, context);
  const sharedParentIds = collectSharedParentIds(relatives, context.subjectId);

  return relatives
    .filter((relative) => !relative.isDeceased)
    .filter((relative) => !isBlockedId(relative.id, blockedIds))
    .filter((relative) => matchesGenderForFamilyLink(relative, linkType, context.subjectGender))
    .map((relative) => ({
      ...relative,
      isSharedParent: sharedParentIds.has(String(relative.id).trim()) ||
        [...sharedParentIds].some((parentId) => relativeLinkIdsMatch(parentId, relative.id)),
    }))
    .sort((left, right) => {
      if (left.isSharedParent !== right.isSharedParent) {
        return left.isSharedParent ? -1 : 1;
      }

      return getRelativeDisplayName(left).localeCompare(getRelativeDisplayName(right), 'ru');
    });
}

export function buildFamilyLinkCandidatesForType(
  relatives: Relative[],
  linkType: FamilyLinkType,
  context: {
    subjectId?: string;
    subjectGender?: RelativeGender;
    links?: ParentPickerLinks;
  },
): Relative[] | ParentLinkCandidate[] {
  if (linkType === 'father' || linkType === 'mother') {
    return buildParentLinkCandidates(relatives, linkType, context);
  }

  return buildSpouseLinkCandidates(relatives, context);
}

function buildSpouseLinkCandidates(
  relatives: Relative[],
  context: {
    subjectId?: string;
    subjectGender?: RelativeGender;
    links?: ParentPickerLinks;
  },
): Relative[] {
  const { subjectId, subjectGender, links = {} } = context;
  const blockedIds = new Set<string>();

  if (subjectId) {
    addBlockedId(blockedIds, subjectId);
    getDescendantIds(subjectId, relatives).forEach((id) => blockedIds.add(id));
    getAncestorIds(subjectId, relatives).forEach((id) => blockedIds.add(id));
  }

  addBlockedId(blockedIds, links.fatherId);
  addBlockedId(blockedIds, links.motherId);

  return relatives
    .filter((relative) => !relative.isDeceased)
    .filter((relative) => !isBlockedId(relative.id, blockedIds))
    .filter((relative) => matchesGenderForFamilyLink(relative, 'spouse', subjectGender))
    .sort((left, right) =>
      getRelativeDisplayName(left).localeCompare(getRelativeDisplayName(right), 'ru'),
    );
}
