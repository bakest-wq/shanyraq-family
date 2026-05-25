import type { ConnectParentsInput, CreateRelativeInput, Relative } from '@/types/relative';
import { kk, FAMILY_LANGUAGE } from '@/content/family-language';
import { findRelativeById, relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { areSharedParentSiblings } from '@/utils/family-sibling-links';
import type { ParentLinkRole } from '@/utils/family-child-links';
import {
  buildFamilyGraph,
  getAncestorIds,
  getDescendantIds,
  normalizeFamilyLinkSnapshot,
  validateProposedLinks,
  wouldPatchCreateCycle,
} from '@/utils/family-graph';
import type { FamilyLinkErrors, FamilyLinkValues, ValidateFamilyLinksContext } from '@/utils/family-link-validation';

export const PROPOSED_RELATIVE_ID = '__proposed__';

export type RelationshipSafetyReason =
  | 'self'
  | 'childAsParent'
  | 'parentAsSpouse'
  | 'spouseAsParent'
  | 'siblingAsParent'
  | 'siblingAsChild'
  | 'circularParents'
  | 'brokenSpouse'
  | 'spouseAlreadyLinked'
  | 'invalid';

export const RELATIONSHIP_SAFETY_MESSAGES: Record<RelationshipSafetyReason, string> = {
  self: kk(FAMILY_LANGUAGE.relationships.selfLink),
  childAsParent: kk(FAMILY_LANGUAGE.relationships.childAsParent),
  parentAsSpouse: kk(FAMILY_LANGUAGE.relationships.parentAsSpouse),
  spouseAsParent: kk(FAMILY_LANGUAGE.relationships.spouseAsParent),
  siblingAsParent: kk(FAMILY_LANGUAGE.relationships.siblingAsParent),
  siblingAsChild: kk(FAMILY_LANGUAGE.relationships.siblingAsChild),
  circularParents: kk(FAMILY_LANGUAGE.relationships.circularParents),
  brokenSpouse: kk(FAMILY_LANGUAGE.relationships.brokenSpouseLink),
  spouseAlreadyLinked: kk(FAMILY_LANGUAGE.relationships.spouseAlreadyLinked),
  invalid: kk(FAMILY_LANGUAGE.relationships.invalidRelationship),
};

/** @deprecated Prefer field-specific RELATIONSHIP_SAFETY_MESSAGES */
export const RELATIONSHIP_SAFETY_MESSAGE = RELATIONSHIP_SAFETY_MESSAGES.invalid;

export class RelationshipSafetyBlockedError extends Error {
  fieldErrors: FamilyLinkErrors;

  constructor(fieldErrors: FamilyLinkErrors) {
    const firstMessage =
      Object.values(fieldErrors).find((message) => Boolean(message)) ?? RELATIONSHIP_SAFETY_MESSAGE;
    super(firstMessage);
    this.name = 'RelationshipSafetyBlockedError';
    this.fieldErrors = fieldErrors;
  }
}

type RelationshipSafetyOptions = {
  input?: Partial<CreateRelativeInput>;
  existing?: Relative | null;
};

function shareAnyParent(
  left: Pick<Relative, 'fatherId' | 'motherId'>,
  right: Pick<Relative, 'fatherId' | 'motherId'>,
): boolean {
  return (
    Boolean(
      left.fatherId &&
        right.fatherId &&
        relativeLinkIdsMatch(left.fatherId, right.fatherId),
    ) ||
    Boolean(
      left.motherId &&
        right.motherId &&
        relativeLinkIdsMatch(left.motherId, right.motherId),
    )
  );
}

function setSafetyError(
  errors: FamilyLinkErrors,
  field: keyof FamilyLinkErrors,
  reason: RelationshipSafetyReason,
): void {
  if (!errors[field]) {
    errors[field] = RELATIONSHIP_SAFETY_MESSAGES[reason];
  }
}

function buildSubjectSnapshot(
  subjectId: string,
  existing: Relative | null,
  links: FamilyLinkValues,
  input?: Partial<CreateRelativeInput>,
): Relative {
  return {
    id: subjectId,
    fullName: input?.fullName ?? existing?.fullName ?? '',
    firstName: input?.firstName ?? existing?.firstName ?? '',
    displayName: input?.displayName ?? existing?.displayName ?? input?.fullName ?? '',
    relationship: input?.relationship ?? existing?.relationship ?? '',
    birthday: input?.birthday ?? existing?.birthday ?? '',
    phone: input?.phone ?? existing?.phone ?? '',
    avatarColor: input?.avatarColor ?? existing?.avatarColor ?? '#2C4A3E',
    isDeceased: input?.isDeceased ?? existing?.isDeceased ?? false,
    gender: input?.gender ?? existing?.gender,
    fatherId: existing?.fatherId ?? links.fatherId ?? undefined,
    motherId: existing?.motherId ?? links.motherId ?? undefined,
    spouseId: links.spouseId ?? existing?.spouseId ?? undefined,
    birthdayYear: input?.birthdayYear ?? existing?.birthdayYear,
  };
}

function relativesWithSubject(
  relatives: Relative[],
  subject: Relative,
  subjectId: string,
): Relative[] {
  if (subjectId === PROPOSED_RELATIVE_ID) {
    return [...relatives, subject];
  }

  return relatives;
}

function validateSelfLinks(
  links: FamilyLinkValues,
  relativeId: string | undefined,
  errors: FamilyLinkErrors,
): void {
  if (!relativeId) {
    return;
  }

  if (links.fatherId && relativeLinkIdsMatch(links.fatherId, relativeId)) {
    setSafetyError(errors, 'fatherId', 'self');
  }

  if (links.motherId && relativeLinkIdsMatch(links.motherId, relativeId)) {
    setSafetyError(errors, 'motherId', 'self');
  }

  if (links.spouseId && relativeLinkIdsMatch(links.spouseId, relativeId)) {
    setSafetyError(errors, 'spouseId', 'self');
  }
}

function validateSpouseAsParent(links: FamilyLinkValues, errors: FamilyLinkErrors): void {
  if (!links.spouseId) {
    return;
  }

  if (links.fatherId && relativeLinkIdsMatch(links.spouseId, links.fatherId)) {
    setSafetyError(errors, 'fatherId', 'spouseAsParent');
  }

  if (links.motherId && relativeLinkIdsMatch(links.spouseId, links.motherId)) {
    setSafetyError(errors, 'motherId', 'spouseAsParent');
  }
}

function validateChildAsParent(
  links: FamilyLinkValues,
  relativeId: string | undefined,
  relatives: Relative[],
  errors: FamilyLinkErrors,
): void {
  if (!relativeId) {
    return;
  }

  const descendants = getDescendantIds(relativeId, relatives);

  if (
    links.fatherId &&
    [...descendants].some((id) => relativeLinkIdsMatch(id, links.fatherId!))
  ) {
    setSafetyError(errors, 'fatherId', 'childAsParent');
  }

  if (
    links.motherId &&
    [...descendants].some((id) => relativeLinkIdsMatch(id, links.motherId!))
  ) {
    setSafetyError(errors, 'motherId', 'childAsParent');
  }
}

function validateParentAsSpouse(
  links: FamilyLinkValues,
  subjectId: string,
  subject: Relative,
  relatives: Relative[],
  errors: FamilyLinkErrors,
): void {
  if (!links.spouseId) {
    return;
  }

  const graphRelatives = relativesWithSubject(relatives, subject, subjectId);
  const ancestors = getAncestorIds(subjectId, graphRelatives);

  if ([...ancestors].some((id) => relativeLinkIdsMatch(id, links.spouseId!))) {
    setSafetyError(errors, 'spouseId', 'parentAsSpouse');
  }
}

function validateSiblingAsParent(
  subject: Relative,
  links: FamilyLinkValues,
  relatives: Relative[],
  errors: FamilyLinkErrors,
): void {
  for (const [field, parentId] of [
    ['fatherId', links.fatherId],
    ['motherId', links.motherId],
  ] as const) {
    if (!parentId) {
      continue;
    }

    const parent = findRelativeById(relatives, parentId);
    if (parent && shareAnyParent(subject, parent)) {
      setSafetyError(errors, field, 'siblingAsParent');
    }
  }
}

function validateSiblingAsChild(
  subject: Relative,
  subjectId: string,
  links: FamilyLinkValues,
  relatives: Relative[],
  errors: FamilyLinkErrors,
): void {
  for (const parentId of [links.fatherId, links.motherId]) {
    if (!parentId) {
      continue;
    }

    const parent = findRelativeById(relatives, parentId);
    if (parent && shareAnyParent(subject, parent)) {
      if (relativeLinkIdsMatch(parentId, links.fatherId)) {
        setSafetyError(errors, 'fatherId', 'siblingAsChild');
      }
      if (relativeLinkIdsMatch(parentId, links.motherId)) {
        setSafetyError(errors, 'motherId', 'siblingAsChild');
      }
    }
  }

  for (const candidate of relatives) {
    if (relativeLinkIdsMatch(candidate.id, subjectId)) {
      continue;
    }

    const pointsToSubjectAsParent =
      relativeLinkIdsMatch(candidate.fatherId, subjectId) ||
      relativeLinkIdsMatch(candidate.motherId, subjectId);

    if (pointsToSubjectAsParent && shareAnyParent(subject, candidate)) {
      if (relativeLinkIdsMatch(candidate.fatherId, subjectId)) {
        setSafetyError(errors, 'fatherId', 'siblingAsChild');
      }
      if (relativeLinkIdsMatch(candidate.motherId, subjectId)) {
        setSafetyError(errors, 'motherId', 'siblingAsChild');
      }
    }
  }
}

function validateCircularParents(
  subject: Relative,
  subjectId: string,
  links: FamilyLinkValues,
  relatives: Relative[],
  errors: FamilyLinkErrors,
): void {
  const graphRelatives = relativesWithSubject(relatives, subject, subjectId);
  const graph = buildFamilyGraph(graphRelatives);
  const proposed = normalizeFamilyLinkSnapshot({
    fatherId: links.fatherId ?? subject.fatherId ?? null,
    motherId: links.motherId ?? subject.motherId ?? null,
    spouseId: links.spouseId ?? subject.spouseId ?? null,
  });

  if (wouldPatchCreateCycle(graph, subjectId, proposed)) {
    if (
      proposed.fatherId &&
      graph.wouldCreateAncestorCycle(subjectId, proposed.fatherId)
    ) {
      setSafetyError(errors, 'fatherId', 'circularParents');
    }

    if (
      proposed.motherId &&
      graph.wouldCreateAncestorCycle(subjectId, proposed.motherId)
    ) {
      setSafetyError(errors, 'motherId', 'circularParents');
    }
  }

  for (const issue of validateProposedLinks(graph, subjectId, proposed)) {
    if (issue.severity !== 'error' || !issue.field) {
      continue;
    }

    if (issue.code === 'ancestor_cycle') {
      setSafetyError(errors, issue.field, 'circularParents');
      continue;
    }

    setSafetyError(errors, issue.field, 'invalid');
  }
}

function validateBrokenSpouseLink(
  links: FamilyLinkValues,
  subjectId: string,
  relatives: Relative[],
  errors: FamilyLinkErrors,
): void {
  if (!links.spouseId) {
    return;
  }

  const spouse = findRelativeById(relatives, links.spouseId);
  if (!spouse) {
    setSafetyError(errors, 'spouseId', 'brokenSpouse');
    return;
  }

  if (spouse.spouseId && !relativeLinkIdsMatch(spouse.spouseId, subjectId)) {
    setSafetyError(errors, 'spouseId', 'spouseAlreadyLinked');
  }
}

/** Blocking relationship safety checks — warm Kazakh messages only. */
export function validateRelationshipSafety(
  links: FamilyLinkValues,
  context: ValidateFamilyLinksContext,
  options: RelationshipSafetyOptions = {},
): FamilyLinkErrors {
  const errors: FamilyLinkErrors = {};
  const subjectId = context.relativeId ?? PROPOSED_RELATIVE_ID;
  const existing =
    options.existing ??
    (context.relativeId ? findRelativeById(context.relatives, context.relativeId) : null);
  const subject = buildSubjectSnapshot(subjectId, existing, links, options.input);
  const expandedRelatives = relativesWithSubject(context.relatives, subject, subjectId);

  validateSelfLinks(links, subjectId, errors);
  validateSpouseAsParent(links, errors);
  validateParentAsSpouse(links, subjectId, subject, expandedRelatives, errors);
  validateSiblingAsParent(subject, links, expandedRelatives, errors);
  validateSiblingAsChild(subject, subjectId, links, expandedRelatives, errors);
  validateCircularParents(subject, subjectId, links, expandedRelatives, errors);
  validateChildAsParent(links, subjectId, expandedRelatives, errors);
  validateBrokenSpouseLink(links, subjectId, expandedRelatives, errors);

  return errors;
}

export function validateRelationshipSafetyForSave(
  input: CreateRelativeInput,
  relatives: Relative[],
  context: ValidateFamilyLinksContext = { relatives },
): FamilyLinkErrors {
  return validateRelationshipSafety(
    {
      fatherId: input.fatherId,
      motherId: input.motherId,
      spouseId: input.spouseId,
    },
    context,
    {
      input,
      existing: context.relativeId
        ? findRelativeById(relatives, context.relativeId)
        : null,
    },
  );
}

export function validateRelationshipSafetyForLinkPatch(
  subjectId: string,
  patch: Partial<ConnectParentsInput>,
  relatives: Relative[],
): FamilyLinkErrors {
  const existing = findRelativeById(relatives, subjectId);
  if (!existing) {
    return {};
  }

  return validateRelationshipSafety(
    {
      fatherId: patch.fatherId !== undefined ? patch.fatherId : existing.fatherId,
      motherId: patch.motherId !== undefined ? patch.motherId : existing.motherId,
      spouseId: patch.spouseId !== undefined ? patch.spouseId : existing.spouseId,
    },
    { relativeId: subjectId, relatives, subjectGender: existing.gender },
    { existing },
  );
}

export function validateLinkedChildIdsBeforeSave(
  parentId: string,
  linkedChildIds: string[],
  role: ParentLinkRole,
  relatives: Relative[],
  parentSnapshot?: Pick<Relative, 'fatherId' | 'motherId'>,
): FamilyLinkErrors {
  const errors: FamilyLinkErrors = {};
  const parent =
    findRelativeById(relatives, parentId) ??
    (parentSnapshot
      ? ({
          id: parentId,
          fatherId: parentSnapshot.fatherId,
          motherId: parentSnapshot.motherId,
        } as Relative)
      : null);

  if (!parent) {
    return errors;
  }

  for (const childId of linkedChildIds) {
    const child = findRelativeById(relatives, childId);
    if (!child) {
      continue;
    }

    if (areSharedParentSiblings(parent, child)) {
      if (role === 'father') {
        setSafetyError(errors, 'fatherId', 'siblingAsChild');
      } else {
        setSafetyError(errors, 'motherId', 'siblingAsChild');
      }
      return errors;
    }

    const patchErrors = validateRelationshipSafetyForLinkPatch(childId, {
      fatherId: role === 'father' ? parentId : child.fatherId,
      motherId: role === 'mother' ? parentId : child.motherId,
    }, relatives);

    Object.assign(errors, patchErrors);
    if (Object.keys(errors).length > 0) {
      return errors;
    }
  }

  return errors;
}

export function assertRelationshipSafetyForSave(
  input: CreateRelativeInput,
  relatives: Relative[],
  context: ValidateFamilyLinksContext = { relatives },
): void {
  const errors = validateRelationshipSafetyForSave(input, relatives, context);
  if (Object.keys(errors).length > 0) {
    throw new RelationshipSafetyBlockedError(errors);
  }
}

export function assertRelationshipSafetyForLinkPatch(
  subjectId: string,
  patch: Partial<ConnectParentsInput>,
  relatives: Relative[],
): void {
  const existing = findRelativeById(relatives, subjectId);
  if (!existing) {
    throw new RelationshipSafetyBlockedError({});
  }

  const errors = validateRelationshipSafetyForLinkPatch(subjectId, patch, relatives);
  if (Object.keys(errors).length > 0) {
    throw new RelationshipSafetyBlockedError(errors);
  }
}

export function validateFamilyLinkSelectionSafety(
  linkType: 'father' | 'mother' | 'spouse',
  personId: string,
  context: ValidateFamilyLinksContext,
  links: FamilyLinkValues,
): string | null {
  const nextLinks: FamilyLinkValues = { ...links };

  if (linkType === 'father') {
    nextLinks.fatherId = personId;
  } else if (linkType === 'mother') {
    nextLinks.motherId = personId;
  } else {
    nextLinks.spouseId = personId;
  }

  const errors = validateRelationshipSafety(nextLinks, context);
  const field = linkType === 'father' ? 'fatherId' : linkType === 'mother' ? 'motherId' : 'spouseId';

  return errors[field] ?? null;
}

export function isRelationshipSafetyBlockedError(
  error: unknown,
): error is RelationshipSafetyBlockedError {
  return error instanceof RelationshipSafetyBlockedError;
}

export function getRelationshipSaveFieldErrors(error: unknown): FamilyLinkErrors {
  if (isRelationshipSafetyBlockedError(error)) {
    return error.fieldErrors;
  }

  return {};
}

export function getRelationshipSaveErrorMessage(error: unknown): string {
  if (isRelationshipSafetyBlockedError(error)) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return RELATIONSHIP_SAFETY_MESSAGE;
}
