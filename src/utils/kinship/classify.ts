import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { classifyExtendedKinship, buildPathSentence } from '@/utils/kinship/classify-extended';
import {
  buildKinshipResult,
  INCOMPLETE_LINK_HINT,
  KAYIN_SIBLING_AGE_MAP,
  PARTIAL_PARENT_HINT,
  resolveSiblingAgeType,
  ROOT_SIBLING_AGE_MAP,
  siblingStepLabel,
} from '@/utils/kinship/classify-helpers';
import {
  areSpouses,
  getChildren,
  getEffectiveSpouse,
  getFather,
  getSiblings,
  hasParentLinks,
  isFemale,
  isMale,
} from '@/utils/kinship/graph';
import type { KinshipResult } from '@/utils/kinship/types';

function classifyDirect(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  if (relativeLinkIdsMatch(targetPerson.id, rootPerson.fatherId)) {
    return buildKinshipResult('father');
  }

  if (relativeLinkIdsMatch(targetPerson.id, rootPerson.motherId)) {
    return buildKinshipResult('mother');
  }

  if (areSpouses(rootPerson, targetPerson)) {
    if (isMale(targetPerson)) {
      return buildKinshipResult('husband');
    }

    if (isFemale(targetPerson)) {
      return buildKinshipResult('wife');
    }

    return buildKinshipResult('spouse', { missingGenderHint: true });
  }

  if (
    relativeLinkIdsMatch(targetPerson.fatherId, rootPerson.id) ||
    relativeLinkIdsMatch(targetPerson.motherId, rootPerson.id)
  ) {
    if (isMale(targetPerson)) {
      return buildKinshipResult('son');
    }

    if (isFemale(targetPerson)) {
      return buildKinshipResult('daughter');
    }

    return buildKinshipResult('relative_neutral', {
      missingGenderHint: true,
      uncertain: true,
    });
  }

  const sibling = getSiblings(rootPerson, relatives).find((person) =>
    relativeLinkIdsMatch(person.id, targetPerson.id),
  );

  if (sibling) {
    const kinship = resolveSiblingAgeType(rootPerson, sibling, ROOT_SIBLING_AGE_MAP);

    return buildKinshipResult(kinship.type, {
      uncertain: kinship.uncertain,
      missingGenderHint: kinship.missingGenderHint,
      pathSteps: [{ person: sibling, stepLabel: siblingStepLabel(kinship.type) }],
    });
  }

  const father = getFather(rootPerson, relatives);
  if (father) {
    if (relativeLinkIdsMatch(targetPerson.id, father.fatherId)) {
      return buildKinshipResult('grandfather', {
        pathSteps: [
          { person: father, stepLabel: 'әке' },
          { person: targetPerson, stepLabel: 'ата' },
        ],
      });
    }

    if (relativeLinkIdsMatch(targetPerson.id, father.motherId)) {
      return buildKinshipResult('grandmother', {
        pathSteps: [
          { person: father, stepLabel: 'әке' },
          { person: targetPerson, stepLabel: 'әже' },
        ],
      });
    }
  }

  return null;
}

function classifyInLaws(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  for (const sibling of getSiblings(rootPerson, relatives)) {
    const siblingSpouse = getEffectiveSpouse(sibling, relatives);
    if (!siblingSpouse || !relativeLinkIdsMatch(siblingSpouse.id, targetPerson.id)) {
      continue;
    }

    const siblingKinship = resolveSiblingAgeType(rootPerson, sibling, ROOT_SIBLING_AGE_MAP);
    const siblingLabel = siblingStepLabel(siblingKinship.type);

    if (isMale(sibling) || (!isFemale(sibling) && isFemale(targetPerson))) {
      return buildKinshipResult('jenge', {
        pathSteps: [
          { person: sibling, stepLabel: siblingLabel },
          { person: targetPerson, stepLabel: 'жұбайы' },
        ],
      });
    }

    if (isFemale(sibling) || (!isMale(sibling) && isMale(targetPerson))) {
      return buildKinshipResult('jezde', {
        pathSteps: [
          { person: sibling, stepLabel: siblingLabel },
          { person: targetPerson, stepLabel: 'жұбайы' },
        ],
      });
    }
  }

  for (const child of getChildren(rootPerson, relatives)) {
    const childSpouse = getEffectiveSpouse(child, relatives);
    if (!childSpouse || !relativeLinkIdsMatch(childSpouse.id, targetPerson.id)) {
      continue;
    }

    if (isMale(child) && (isFemale(targetPerson) || !targetPerson.gender)) {
      return buildKinshipResult('kelin', {
        pathSteps: [
          { person: child, stepLabel: 'ұлы' },
          { person: targetPerson, stepLabel: 'жұбайы' },
        ],
      });
    }

    if (isFemale(child) && (isMale(targetPerson) || !targetPerson.gender)) {
      return buildKinshipResult('kuyeu_bala', {
        pathSteps: [
          { person: child, stepLabel: 'қызы' },
          { person: targetPerson, stepLabel: 'жұбайы' },
        ],
      });
    }
  }

  const spouse = getEffectiveSpouse(rootPerson, relatives);
  if (!spouse) {
    return null;
  }

  if (relativeLinkIdsMatch(targetPerson.id, spouse.fatherId)) {
    return buildKinshipResult('kayin_ata', {
      pathSteps: [
        { person: spouse, stepLabel: 'жұбайы' },
        { person: targetPerson, stepLabel: 'әкesi' },
      ],
    });
  }

  if (relativeLinkIdsMatch(targetPerson.id, spouse.motherId)) {
    return buildKinshipResult('kayin_ene', {
      pathSteps: [
        { person: spouse, stepLabel: 'жұбайы' },
        { person: targetPerson, stepLabel: 'анасы' },
      ],
    });
  }

  const spouseSibling = getSiblings(spouse, relatives).find((person) =>
    relativeLinkIdsMatch(person.id, targetPerson.id),
  );

  if (spouseSibling) {
    const kinship = resolveSiblingAgeType(spouse, spouseSibling, KAYIN_SIBLING_AGE_MAP);

    return buildKinshipResult(kinship.type, {
      uncertain: kinship.uncertain,
      missingGenderHint: kinship.missingGenderHint,
      pathSteps: [
        { person: spouse, stepLabel: 'жұбайы' },
        { person: spouseSibling, stepLabel: siblingStepLabel(kinship.type) },
      ],
    });
  }

  return null;
}

function buildUnknownResult(rootPerson: Relative): KinshipResult {
  const confidenceHint = !hasParentLinks(rootPerson)
    ? PARTIAL_PARENT_HINT
    : INCOMPLETE_LINK_HINT;

  return buildKinshipResult('unknown', {
    resolved: false,
    confidenceHint,
  });
}

export function classifyKinship(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult {
  if (relativeLinkIdsMatch(rootPerson.id, targetPerson.id)) {
    return buildKinshipResult('self');
  }

  const direct = classifyDirect(rootPerson, targetPerson, relatives);
  if (direct) {
    return direct;
  }

  const inLaw = classifyInLaws(rootPerson, targetPerson, relatives);
  if (inLaw) {
    return inLaw;
  }

  const extended = classifyExtendedKinship(rootPerson, targetPerson, relatives);
  if (extended) {
    return extended;
  }

  return buildUnknownResult(rootPerson);
}

export { buildPathSentence };
