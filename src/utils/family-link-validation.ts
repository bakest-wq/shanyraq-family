import { CreateRelativeInput, Relative, RelativeGender } from '@/types/relative';
import {
  FamilyLinkType,
  findRelativeById,
  matchesGenderForFamilyLink,
  relativeLinkIdsMatch,
} from '@/utils/family-link-picker';
import { getAncestorIds, getDescendantIds } from '@/utils/family-graph';
import { buildFamilyLinkCandidatesForType } from '@/utils/parent-link-candidates';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  RELATIONSHIP_SAFETY_MESSAGE,
  validateFamilyLinkSelectionSafety,
} from '@/utils/relationship-safety-validation';

export { getAncestorIds, getDescendantIds } from '@/utils/family-graph';

export type FamilyLinkValues = {
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
};

export type FamilyLinkField = 'fatherId' | 'motherId' | 'spouseId';

export type FamilyLinkErrors = Partial<Record<FamilyLinkField, string>>;
export type FamilyLinkWarnings = Partial<Record<FamilyLinkField, string>>;

export type ValidateFamilyLinksContext = {
  relativeId?: string;
  relatives: Relative[];
  subjectGender?: RelativeGender;
};

export type FamilyLinkValidationResult = {
  errors: FamilyLinkErrors;
  warnings: FamilyLinkWarnings;
};

export type LinkValidationIssue = {
  blocking: boolean;
  message: string;
};

const MSG = {
  sameParents: RELATIONSHIP_SAFETY_MESSAGE,
  genericWarning: RELATIONSHIP_SAFETY_MESSAGE,
  genderUnknown: 'Жынысы белгісіз',
  subjectGenderUnknown: 'Сіздің жынысыңыз белгісіз',
  genderFather: 'Әke ер кisi болуы керек',
  genderMother: 'Ana әйел кisi болуы керек',
  genderSpouse: 'Жұбай жыNSысы сәйкес емес',
  notFound: 'Туыс табылмады',
} as const;

function genderUnknownWarning(linkType: FamilyLinkType, subjectGender?: RelativeGender): string {
  if (linkType === 'spouse' && !subjectGender) {
    return `${MSG.genericWarning} · ${MSG.subjectGenderUnknown}`;
  }

  return `${MSG.genericWarning} · ${MSG.genderUnknown}`;
}

function validateLinkPerson(
  linkType: FamilyLinkType,
  personId: string | null | undefined,
  context: ValidateFamilyLinksContext,
  links: FamilyLinkValues,
): { error?: string; warning?: string } {
  if (!personId) {
    return {};
  }

  const { relativeId, relatives, subjectGender } = context;
  const person = findRelativeById(relatives, personId);

  if (!person) {
    return { error: MSG.notFound };
  }

  if (relativeId && relativeLinkIdsMatch(personId, relativeId)) {
    return { error: RELATIONSHIP_SAFETY_MESSAGE };
  }

  if (
    (linkType === 'father' || linkType === 'mother') &&
    links.spouseId &&
    relativeLinkIdsMatch(personId, links.spouseId)
  ) {
    return { error: RELATIONSHIP_SAFETY_MESSAGE };
  }

  if (
    relativeId &&
    [...getDescendantIds(relativeId, relatives)].some((id) => relativeLinkIdsMatch(id, personId))
  ) {
    return { error: RELATIONSHIP_SAFETY_MESSAGE };
  }

  if (
    linkType === 'spouse' &&
    relativeId &&
    [...getAncestorIds(relativeId, relatives)].some((id) => relativeLinkIdsMatch(id, personId))
  ) {
    return { error: RELATIONSHIP_SAFETY_MESSAGE };
  }

  if (linkType === 'father' && links.motherId && relativeLinkIdsMatch(personId, links.motherId)) {
    return { error: MSG.sameParents };
  }

  if (linkType === 'mother' && links.fatherId && relativeLinkIdsMatch(personId, links.fatherId)) {
    return { error: MSG.sameParents };
  }

  if (person.gender) {
    if (!matchesGenderForFamilyLink(person, linkType, subjectGender)) {
      if (linkType === 'father') {
        return { error: MSG.genderFather };
      }

      if (linkType === 'mother') {
        return { error: MSG.genderMother };
      }

      return { error: MSG.genderSpouse };
    }

    return {};
  }

  return { warning: genderUnknownWarning(linkType, subjectGender) };
}

/** Validate one selection — for picker modal (before accepting). */
export function validateFamilyLinkSelection(
  linkType: FamilyLinkType,
  personId: string,
  context: ValidateFamilyLinksContext,
  links: FamilyLinkValues,
): LinkValidationIssue | null {
  const safetyMessage = validateFamilyLinkSelectionSafety(linkType, personId, context, links);
  if (safetyMessage) {
    return { blocking: true, message: safetyMessage };
  }

  const { error, warning } = validateLinkPerson(linkType, personId, context, links);

  if (error) {
    return { blocking: true, message: error };
  }

  if (warning) {
    return { blocking: false, message: warning };
  }

  return null;
}

export function validateFamilyLinksFull(
  links: FamilyLinkValues,
  context: ValidateFamilyLinksContext,
): FamilyLinkValidationResult {
  const errors: FamilyLinkErrors = {};
  const warnings: FamilyLinkWarnings = {};

  const father = validateLinkPerson('father', links.fatherId, context, links);
  if (father.error) {
    errors.fatherId = father.error;
  } else if (father.warning) {
    warnings.fatherId = father.warning;
  }

  const mother = validateLinkPerson('mother', links.motherId, context, links);
  if (mother.error) {
    errors.motherId = mother.error;
  } else if (mother.warning) {
    warnings.motherId = mother.warning;
  }

  const spouse = validateLinkPerson('spouse', links.spouseId, context, links);
  if (spouse.error) {
    errors.spouseId = spouse.error;
  } else if (spouse.warning) {
    warnings.spouseId = spouse.warning;
  }

  return { errors, warnings };
}

/** Blocking errors only — used before save. */
export function validateFamilyLinks(
  links: FamilyLinkValues,
  context: ValidateFamilyLinksContext,
): FamilyLinkErrors {
  return validateFamilyLinksFull(links, context).errors;
}

export function validateRelativeFamilyLinks(
  input: CreateRelativeInput,
  context: ValidateFamilyLinksContext,
): FamilyLinkErrors {
  return validateRelativeFamilyLinksFull(input, context).errors;
}

export function validateRelativeFamilyLinksFull(
  input: CreateRelativeInput,
  context: ValidateFamilyLinksContext,
): FamilyLinkValidationResult {
  return validateFamilyLinksFull(
    {
      fatherId: input.fatherId,
      motherId: input.motherId,
      spouseId: input.spouseId,
    },
    {
      ...context,
      subjectGender: input.gender ?? context.subjectGender,
    },
  );
}

export function buildFamilyLinkCandidates(
  relatives: Relative[],
  linkType: FamilyLinkType,
  context: {
    subjectId?: string;
    subjectGender?: RelativeGender;
    links?: FamilyLinkValues;
  },
): Relative[] {
  return buildFamilyLinkCandidatesForType(relatives, linkType, context);
}
