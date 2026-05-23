import { CreateRelativeInput, Relative, RelativeGender } from '@/types/relative';
import {
  FamilyLinkType,
  findRelativeById,
  matchesGenderForFamilyLink,
} from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';

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
  selfParent:
    'Адам өзін әке/ана ретінде таңдай алмайды · Cannot select self as father or mother',
  selfSpouse:
    'Адам өзін жұбай ретінде таңдай алмайды · Cannot select self as spouse',
  childAsParent:
    'Баланы ата-ана ретінде таңдауға болмайды · Child cannot be a parent',
  parentAsSpouse:
    'Ата-ананы жұбай ретінде таңдауға болмайды · Parent cannot be spouse',
  sameParents:
    'Әke мен ana бір адам бола алмайды · Father and mother must differ',
  genericWarning: 'Бұл байланыс шежіреде қате болуы мүмкін',
  genderUnknown: 'Жынысы белгісіз · Gender unknown',
  subjectGenderUnknown: 'Сіздің жынысыңыз белгісіз · Your gender unknown',
  genderFather: 'Әke ер кisi болуы керек · Father should be male',
  genderMother: 'Ana әйел кisi болуы керек · Mother should be female',
  genderSpouse: 'Жұбай жыNSысы сәйкес емес · Spouse gender mismatch',
  notFound: 'Туыс табылмады · Relative not found',
} as const;

/** All descendants (children, grandchildren, …) of a person. */
export function getDescendantIds(relativeId: string, relatives: Relative[]): Set<string> {
  const descendants = new Set<string>();
  const queue = [relativeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    for (const relative of relatives) {
      if (relative.fatherId !== currentId && relative.motherId !== currentId) {
        continue;
      }

      if (!descendants.has(relative.id)) {
        descendants.add(relative.id);
        queue.push(relative.id);
      }
    }
  }

  return descendants;
}

/** All ancestors (parents, grandparents, …) of a person. */
export function getAncestorIds(relativeId: string, relatives: Relative[]): Set<string> {
  const ancestors = new Set<string>();
  const byId = new Map(relatives.map((relative) => [relative.id, relative]));

  const visitParents = (personId: string) => {
    const person = byId.get(personId);
    if (!person) {
      return;
    }

    for (const parentId of [person.fatherId, person.motherId]) {
      if (!parentId || ancestors.has(parentId)) {
        continue;
      }

      ancestors.add(parentId);
      visitParents(parentId);
    }
  };

  visitParents(relativeId);
  return ancestors;
}

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

  if (relativeId && personId === relativeId) {
    if (linkType === 'spouse') {
      return { error: MSG.selfSpouse };
    }

    return { error: MSG.selfParent };
  }

  if (relativeId && getDescendantIds(relativeId, relatives).has(personId)) {
    if (linkType === 'spouse') {
      return { error: `${MSG.childAsParent} · ${MSG.genericWarning}` };
    }

    return { error: MSG.childAsParent };
  }

  if (linkType === 'spouse' && relativeId && getAncestorIds(relativeId, relatives).has(personId)) {
    return { error: MSG.parentAsSpouse };
  }

  if (linkType === 'father' && links.motherId && personId === links.motherId) {
    return { error: MSG.sameParents };
  }

  if (linkType === 'mother' && links.fatherId && personId === links.fatherId) {
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
  const { subjectId, subjectGender, links = {} } = context;
  const blockedIds = new Set<string>();

  if (subjectId) {
    blockedIds.add(subjectId);
    getDescendantIds(subjectId, relatives).forEach((id) => blockedIds.add(id));

    if (linkType === 'spouse') {
      getAncestorIds(subjectId, relatives).forEach((id) => blockedIds.add(id));
    }
  }

  if (linkType === 'father' && links.motherId) {
    blockedIds.add(links.motherId);
  }

  if (linkType === 'mother' && links.fatherId) {
    blockedIds.add(links.fatherId);
  }

  if (linkType === 'spouse') {
    if (links.fatherId) {
      blockedIds.add(links.fatherId);
    }

    if (links.motherId) {
      blockedIds.add(links.motherId);
    }
  }

  return relatives
    .filter((relative) => !relative.isDeceased)
    .filter((relative) => !blockedIds.has(relative.id))
    .filter((relative) => {
      if (!relative.gender) {
        return true;
      }

      return matchesGenderForFamilyLink(relative, linkType, subjectGender);
    })
    .sort((a, b) => getRelativeDisplayName(a).localeCompare(getRelativeDisplayName(b), 'ru'));
}
