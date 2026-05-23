import { Relative } from '@/types/relative';
import { FamilyLinkValues } from '@/utils/family-link-validation';
import { getRelativeDisplayName } from '@/utils/relative-names';

export type SiblingRelationshipSyncPlan = {
  subjectPatch: Partial<FamilyLinkValues>;
  siblingPatch: Partial<FamilyLinkValues>;
  copyToSubject: boolean;
  copyToSibling: boolean;
  removesInvalidChildLink: boolean;
  requiresConfirmation: boolean;
  confirmationTitle: string;
  confirmationMessage: string;
};

function isValidSharedParentId(
  parentId: string | null | undefined,
  subjectId?: string,
  siblingId?: string,
): parentId is string {
  if (!parentId) {
    return false;
  }

  if (subjectId && parentId === subjectId) {
    return false;
  }

  if (siblingId && parentId === siblingId) {
    return false;
  }

  return true;
}

/** Never allow current person / selected sibling to appear as parent on the wrong side. */
export function sanitizeSiblingParentPatch(
  subjectId: string | undefined,
  siblingId: string,
  patch: Partial<FamilyLinkValues>,
): Partial<FamilyLinkValues> {
  const sanitized: Partial<FamilyLinkValues> = { ...patch };

  if (subjectId && sanitized.fatherId === subjectId) {
    delete sanitized.fatherId;
  }

  if (subjectId && sanitized.motherId === subjectId) {
    delete sanitized.motherId;
  }

  if (sanitized.fatherId === siblingId) {
    delete sanitized.fatherId;
  }

  if (sanitized.motherId === siblingId) {
    delete sanitized.motherId;
  }

  return sanitized;
}

function resolveInheritedParentId(
  role: 'father' | 'mother',
  subjectLinks: FamilyLinkValues,
  sibling: Relative,
  subjectId?: string,
): string | null {
  const fromSubject = role === 'father' ? subjectLinks.fatherId : subjectLinks.motherId;
  if (isValidSharedParentId(fromSubject, subjectId, sibling.id)) {
    return fromSubject ?? null;
  }

  const fromSibling = role === 'father' ? sibling.fatherId : sibling.motherId;
  if (isValidSharedParentId(fromSibling, subjectId, sibling.id)) {
    return fromSibling ?? null;
  }

  return null;
}

/**
 * Siblings share parents only — never child links between each other.
 * Copies missing parent ids and removes sibling.father_id/mother_id === subjectId.
 */
export function buildSiblingRelationshipSync(
  subjectId: string | undefined,
  subjectLinks: FamilyLinkValues,
  sibling: Relative,
): SiblingRelationshipSyncPlan {
  const subjectPatch: Partial<FamilyLinkValues> = {};
  const siblingPatch: Partial<FamilyLinkValues> = {};
  let removesInvalidChildLink = false;

  if (subjectId && sibling.fatherId === subjectId) {
    siblingPatch.fatherId = resolveInheritedParentId('father', subjectLinks, sibling, subjectId);
    removesInvalidChildLink = true;
  }

  if (subjectId && sibling.motherId === subjectId) {
    siblingPatch.motherId = resolveInheritedParentId('mother', subjectLinks, sibling, subjectId);
    removesInvalidChildLink = true;
  }

  if (subjectLinks.fatherId === sibling.id) {
    subjectPatch.fatherId = resolveInheritedParentId('father', subjectLinks, sibling, subjectId);
    removesInvalidChildLink = true;
  }

  if (subjectLinks.motherId === sibling.id) {
    subjectPatch.motherId = resolveInheritedParentId('mother', subjectLinks, sibling, subjectId);
    removesInvalidChildLink = true;
  }

  const inheritedFather = resolveInheritedParentId('father', subjectLinks, sibling, subjectId);
  const inheritedMother = resolveInheritedParentId('mother', subjectLinks, sibling, subjectId);

  if (inheritedFather && !subjectLinks.fatherId) {
    subjectPatch.fatherId = inheritedFather;
  }

  if (inheritedMother && !subjectLinks.motherId) {
    subjectPatch.motherId = inheritedMother;
  }

  if (inheritedFather && (!sibling.fatherId || sibling.fatherId === subjectId)) {
    siblingPatch.fatherId = inheritedFather;
  }

  if (inheritedMother && (!sibling.motherId || sibling.motherId === subjectId)) {
    siblingPatch.motherId = inheritedMother;
  }

  const safeSubjectPatch = sanitizeSiblingParentPatch(subjectId, sibling.id, subjectPatch);
  const safeSiblingPatch = sanitizeSiblingParentPatch(subjectId, sibling.id, siblingPatch);

  const copyToSubject = Object.keys(safeSubjectPatch).length > 0;
  const copyToSibling = Object.keys(safeSiblingPatch).length > 0;
  const siblingName = getRelativeDisplayName(sibling);

  let confirmationMessage = `${siblingName} таңдалды. Ата-ана деректері сәйкес.`;
  let requiresConfirmation = false;

  if (copyToSubject && copyToSibling) {
    confirmationMessage = `${siblingName} мен сіздің ата-анаңызды синхрондауға бола ма?`;
    requiresConfirmation = true;
  } else if (copyToSubject) {
    confirmationMessage = `${siblingName} ата-анасын сізге көшіру керек пе?`;
    requiresConfirmation = true;
  } else if (copyToSibling) {
    confirmationMessage = `${siblingName} үшін сіздің ата-анаңызды синхрондау керек пе?`;
    requiresConfirmation = true;
  } else if (removesInvalidChildLink) {
    confirmationMessage = `${siblingName} үшін қате бала байланысы жойылады · Removes invalid child link`;
    requiresConfirmation = true;
  }

  return {
    subjectPatch: safeSubjectPatch,
    siblingPatch: safeSiblingPatch,
    copyToSubject,
    copyToSibling,
    removesInvalidChildLink,
    requiresConfirmation,
    confirmationTitle: 'Ортақ ата-ана · Shared parents',
    confirmationMessage,
  };
}

export function logSiblingRelationshipSync(
  _subjectId: string | undefined,
  _subjectLinks: FamilyLinkValues,
  _sibling: Relative,
  _plan: SiblingRelationshipSyncPlan,
): void {
  // Production: sync diagnostics disabled.
}
