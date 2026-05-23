import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  buildKinshipResult,
  NAGASHY_SIBLING_AGE_MAP,
  PATERNAL_SIBLING_AGE_MAP,
  resolveSiblingAgeType,
  siblingStepLabel,
} from '@/utils/kinship/classify-helpers';
import {
  areSiblings,
  getChildren,
  getDescendantDepth,
  getEffectiveSpouse,
  getFather,
  getMother,
  getParents,
  getPersonById,
  getSiblings,
  isChildOf,
  isFemale,
  isMale,
} from '@/utils/kinship/graph';
import type { KinshipResult } from '@/utils/kinship/types';

function classifyGenerations(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  const depth = getDescendantDepth(rootPerson, targetPerson, relatives);

  if (depth === 2) {
    return buildKinshipResult('nemere', {
      pathSteps: [{ person: targetPerson, stepLabel: 'немере' }],
    });
  }

  if (depth != null && depth >= 3) {
    return buildKinshipResult('shobere', {
      pathSteps: [{ person: targetPerson, stepLabel: 'шөбере' }],
    });
  }

  return null;
}

function classifyZhien(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  for (const sibling of getSiblings(rootPerson, relatives)) {
    if (!isChildOf(targetPerson, sibling, relatives)) {
      continue;
    }

    const siblingKinship = resolveSiblingAgeType(rootPerson, sibling, {
      olderMale: 'aga',
      youngerMale: 'ini',
      olderFemale: 'apke',
      youngerFemale: 'singli',
      neutral: 'sibling_neutral',
    });

    return buildKinshipResult('zhien', {
      pathSteps: [
        {
          person: sibling,
          stepLabel: siblingStepLabel(siblingKinship.type),
        },
        { person: targetPerson, stepLabel: 'ұлы/қызы' },
      ],
    });
  }

  return null;
}

function classifyBole(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  const rootMother = getMother(rootPerson, relatives);
  const targetMother = getMother(targetPerson, relatives);

  if (rootMother && targetMother && areSiblings(rootMother, targetMother, relatives)) {
    return buildKinshipResult('bole', {
      pathSteps: [
        { person: rootMother, stepLabel: 'ана' },
        { person: targetMother, stepLabel: 'апалы-сіңлі' },
        { person: targetPerson, stepLabel: 'бөле' },
      ],
    });
  }

  if (!rootMother) {
    return null;
  }

  for (const aunt of getSiblings(rootMother, relatives)) {
    if (aunt.gender && !isFemale(aunt)) {
      continue;
    }

    if (!isChildOf(targetPerson, aunt, relatives)) {
      continue;
    }

    const auntKinship = resolveSiblingAgeType(rootMother, aunt, NAGASHY_SIBLING_AGE_MAP);

    return buildKinshipResult('bole', {
      pathSteps: [
        { person: rootMother, stepLabel: 'ана' },
        { person: aunt, stepLabel: siblingStepLabel(auntKinship.type) },
        { person: targetPerson, stepLabel: 'бала' },
      ],
    });
  }

  return null;
}

function classifyNagashySide(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  const mother = getMother(rootPerson, relatives);
  if (!mother) {
    return null;
  }

  if (relativeLinkIdsMatch(targetPerson.id, mother.fatherId)) {
    return buildKinshipResult('nagashy_ata', {
      pathSteps: [
        { person: mother, stepLabel: 'ана' },
        { person: targetPerson, stepLabel: 'нағашы ата' },
      ],
    });
  }

  if (relativeLinkIdsMatch(targetPerson.id, mother.motherId)) {
    return buildKinshipResult('nagashy_aje', {
      pathSteps: [
        { person: mother, stepLabel: 'ана' },
        { person: targetPerson, stepLabel: 'нағашы әже' },
      ],
    });
  }

  const motherSibling = getSiblings(mother, relatives).find((person) =>
    relativeLinkIdsMatch(person.id, targetPerson.id),
  );

  if (motherSibling) {
    const kinship = resolveSiblingAgeType(mother, motherSibling, NAGASHY_SIBLING_AGE_MAP);

    return buildKinshipResult(kinship.type, {
      uncertain: kinship.uncertain,
      missingGenderHint: kinship.missingGenderHint,
      pathSteps: [
        { person: mother, stepLabel: 'ана' },
        { person: motherSibling, stepLabel: siblingStepLabel(kinship.type) },
      ],
    });
  }

  return null;
}

function classifyPaternalSide(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  const father = getFather(rootPerson, relatives);
  if (!father) {
    return null;
  }

  const fatherSibling = getSiblings(father, relatives).find((person) =>
    relativeLinkIdsMatch(person.id, targetPerson.id),
  );

  if (!fatherSibling) {
    return null;
  }

  const kinship = resolveSiblingAgeType(father, fatherSibling, PATERNAL_SIBLING_AGE_MAP);

  return buildKinshipResult(kinship.type, {
    uncertain: kinship.uncertain,
    missingGenderHint: kinship.missingGenderHint,
    pathSteps: [
      { person: father, stepLabel: 'әке' },
      { person: fatherSibling, stepLabel: siblingStepLabel(kinship.type) },
    ],
  });
}

function classifyTuas(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  const father = getFather(rootPerson, relatives);
  if (father) {
    for (const paternalRelative of getSiblings(father, relatives)) {
      if (!isChildOf(targetPerson, paternalRelative, relatives)) {
        continue;
      }

      const kinship = resolveSiblingAgeType(father, paternalRelative, PATERNAL_SIBLING_AGE_MAP);

      return buildKinshipResult('tuas', {
        pathSteps: [
          { person: father, stepLabel: 'әке' },
          { person: paternalRelative, stepLabel: siblingStepLabel(kinship.type) },
          { person: targetPerson, stepLabel: 'туас' },
        ],
      });
    }
  }

  const mother = getMother(rootPerson, relatives);
  if (!mother) {
    return null;
  }

  for (const maternalRelative of getSiblings(mother, relatives)) {
    if (!isChildOf(targetPerson, maternalRelative, relatives)) {
      continue;
    }

    const kinship = resolveSiblingAgeType(mother, maternalRelative, NAGASHY_SIBLING_AGE_MAP);

    return buildKinshipResult('tuas', {
      pathSteps: [
        { person: mother, stepLabel: 'ана' },
        { person: maternalRelative, stepLabel: siblingStepLabel(kinship.type) },
        { person: targetPerson, stepLabel: 'туас' },
      ],
    });
  }

  return null;
}

function classifyKuda(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  for (const child of getChildren(rootPerson, relatives)) {
    const childSpouse = getEffectiveSpouse(child, relatives);
    if (!childSpouse) {
      continue;
    }

    if (relativeLinkIdsMatch(targetPerson.id, childSpouse.fatherId)) {
      return buildKinshipResult('kuda', {
        pathSteps: [
          { person: child, stepLabel: isMale(child) ? 'ұлы' : 'қызы' },
          { person: childSpouse, stepLabel: 'жұбайы' },
          { person: targetPerson, stepLabel: 'құда' },
        ],
      });
    }

    if (relativeLinkIdsMatch(targetPerson.id, childSpouse.motherId)) {
      return buildKinshipResult('kudagi', {
        pathSteps: [
          { person: child, stepLabel: isMale(child) ? 'ұлы' : 'қызы' },
          { person: childSpouse, stepLabel: 'жұбайы' },
          { person: targetPerson, stepLabel: 'құдағи' },
        ],
      });
    }

    const childSpouseFather = getPersonById(relatives, childSpouse.fatherId);
    const childSpouseMother = getPersonById(relatives, childSpouse.motherId);

    if (
      childSpouseFather &&
      (areSiblings(childSpouseFather, targetPerson, relatives) ||
        relativeLinkIdsMatch(childSpouseFather.id, targetPerson.id))
    ) {
      return buildKinshipResult('kuda_neutral', {
        uncertain: true,
        pathSteps: [
          { person: child, stepLabel: 'бала' },
          { person: childSpouse, stepLabel: 'жұбайы' },
          { person: targetPerson, stepLabel: 'құдалық туыс' },
        ],
      });
    }

    if (
      childSpouseMother &&
      (areSiblings(childSpouseMother, targetPerson, relatives) ||
        relativeLinkIdsMatch(childSpouseMother.id, targetPerson.id))
    ) {
      return buildKinshipResult('kuda_neutral', {
        uncertain: true,
        pathSteps: [
          { person: child, stepLabel: 'бала' },
          { person: childSpouse, stepLabel: 'жұбайы' },
          { person: targetPerson, stepLabel: 'құдалық туыс' },
        ],
      });
    }
  }

  return null;
}

function classifyKayinExtended(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  const spouse = getEffectiveSpouse(rootPerson, relatives);
  if (!spouse) {
    return null;
  }

  for (const spouseSibling of getSiblings(spouse, relatives)) {
    if (!isMale(spouseSibling)) {
      continue;
    }

    const abysyn = getEffectiveSpouse(spouseSibling, relatives);
    if (abysyn && relativeLinkIdsMatch(abysyn.id, targetPerson.id) && isFemale(abysyn)) {
      return buildKinshipResult('abysyn', {
        pathSteps: [
          { person: spouse, stepLabel: 'жұбайы' },
          { person: spouseSibling, stepLabel: 'аға/іні' },
          { person: targetPerson, stepLabel: 'жұбайы' },
        ],
      });
    }
  }

  for (const spouseSibling of getSiblings(spouse, relatives)) {
    if (!isFemale(spouseSibling)) {
      continue;
    }

    const jezde = getEffectiveSpouse(spouseSibling, relatives);
    if (jezde && relativeLinkIdsMatch(jezde.id, targetPerson.id) && isMale(jezde)) {
      return buildKinshipResult('kayin_jezde', {
        pathSteps: [
          { person: spouse, stepLabel: 'жұбайы' },
          { person: spouseSibling, stepLabel: 'әпке/сіңлі' },
          { person: targetPerson, stepLabel: 'жұбайы' },
        ],
      });
    }
  }

  for (const spouseParent of getParents(spouse, relatives)) {
    for (const grandparent of getParents(spouseParent, relatives)) {
      if (relativeLinkIdsMatch(grandparent.id, targetPerson.id)) {
        return buildKinshipResult('kayin_jurt', {
          pathSteps: [
            { person: spouse, stepLabel: 'жұбайы' },
            { person: spouseParent, stepLabel: 'ата-ана' },
            { person: targetPerson, stepLabel: 'қайын жұрт' },
          ],
        });
      }
    }
  }

  for (const spouseChild of getChildren(spouse, relatives)) {
    if (relativeLinkIdsMatch(spouseChild.id, targetPerson.id)) {
      return buildKinshipResult('kayin_jurt', {
        pathSteps: [
          { person: spouse, stepLabel: 'жұбайы' },
          { person: targetPerson, stepLabel: 'бала' },
        ],
      });
    }
  }

  return null;
}

export function classifyExtendedKinship(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  return (
    classifyGenerations(rootPerson, targetPerson, relatives) ??
    classifyZhien(rootPerson, targetPerson, relatives) ??
    classifyNagashySide(rootPerson, targetPerson, relatives) ??
    classifyPaternalSide(rootPerson, targetPerson, relatives) ??
    classifyBole(rootPerson, targetPerson, relatives) ??
    classifyTuas(rootPerson, targetPerson, relatives) ??
    classifyKuda(rootPerson, targetPerson, relatives) ??
    classifyKayinExtended(rootPerson, targetPerson, relatives)
  );
}

export function buildPathSentence(
  steps: KinshipResult['pathSteps'],
): string {
  if (steps.length === 0) {
    return '';
  }

  return steps
    .map((step) => `${getRelativeDisplayName(step.person)} ${step.stepLabel}`)
    .join(' → ');
}

/*
 * Mock scenarios (comment-only):
 * - sister's child => zhien
 * - maternal aunt's child => bole
 * - mother's brother => nagashy_aga / nagashy_ini
 * - father's sister => paternal_apke / paternal_singli
 * - grandchild => nemere, great-grandchild => shobere
 * - child's spouse father => kuda
 * - spouse's brother's wife => abysyn
 */
