import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { resolveShezhireRootPerson } from '@/utils/shezhire-parent-lookup';
import { classifyExtendedKinship, buildPathSentence } from '@/utils/kinship/classify-extended';
import {
  resolveBrotherSpouseKinship,
  resolveKayinSiblingKinship,
  resolveRootSiblingKinship,
  resolveSisterSpouseKinship,
} from '@/services/kinship/age-aware-kinship';
import {
  buildKinshipResult,
  INCOMPLETE_LINK_HINT,
  PARTIAL_PARENT_HINT,
  siblingStepLabel,
} from '@/utils/kinship/classify-helpers';
import {
  classifyGrandchild,
  classifyGrandparents,
} from '@/utils/kinship/classify-grandparents';
import {
  areSpouses,
  getChildren,
  getEffectiveSpouse,
  getSiblings,
  hasParentLinks,
  isFemale,
  isMale,
} from '@/utils/kinship/graph';
import type { KinshipResult } from '@/utils/kinship/types';

function classifySpouse(
  rootPerson: Relative,
  targetPerson: Relative,
): KinshipResult | null {
  if (!areSpouses(rootPerson, targetPerson)) {
    return null;
  }

  if (isMale(targetPerson)) {
    return buildKinshipResult('husband');
  }

  if (isFemale(targetPerson)) {
    return buildKinshipResult('wife');
  }

  return buildKinshipResult('spouse', { missingGenderHint: true });
}

function classifyParent(
  rootPerson: Relative,
  targetPerson: Relative,
): KinshipResult | null {
  if (relativeLinkIdsMatch(targetPerson.id, rootPerson.fatherId)) {
    return buildKinshipResult('father');
  }

  if (relativeLinkIdsMatch(targetPerson.id, rootPerson.motherId)) {
    return buildKinshipResult('mother');
  }

  return null;
}

function classifyChild(
  rootPerson: Relative,
  targetPerson: Relative,
): KinshipResult | null {
  if (
    !relativeLinkIdsMatch(targetPerson.fatherId, rootPerson.id) &&
    !relativeLinkIdsMatch(targetPerson.motherId, rootPerson.id)
  ) {
    return null;
  }

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

function classifySibling(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  const sibling = getSiblings(rootPerson, relatives).find((person) =>
    relativeLinkIdsMatch(person.id, targetPerson.id),
  );

  if (!sibling) {
    return null;
  }

  const kinship = resolveRootSiblingKinship(rootPerson, sibling);

  return buildKinshipResult(kinship.type, {
    uncertain: kinship.uncertain,
    missingGenderHint: kinship.missingGenderHint,
    labelOverride: kinship.labelOverride,
    pathSteps: [{ person: sibling, stepLabel: siblingStepLabel(kinship.type) }],
  });
}

function collectDirectCandidates(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult[] {
  return [
    classifyParent(rootPerson, targetPerson),
    classifySpouse(rootPerson, targetPerson),
    classifyChild(rootPerson, targetPerson),
    classifySibling(rootPerson, targetPerson, relatives),
  ].filter((candidate): candidate is KinshipResult => candidate !== null);
}

function collectInLawCandidates(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult[] {
  const candidates: KinshipResult[] = [];
  for (const sibling of getSiblings(rootPerson, relatives)) {
    const siblingSpouse = getEffectiveSpouse(sibling, relatives);
    if (!siblingSpouse || !relativeLinkIdsMatch(siblingSpouse.id, targetPerson.id)) {
      continue;
    }

    const siblingKinship = resolveRootSiblingKinship(rootPerson, sibling);
    const siblingLabel = siblingKinship.labelOverride?.kazakh.toLowerCase()
      ?? siblingStepLabel(siblingKinship.type);

    if (isMale(sibling) || (!isFemale(sibling) && isFemale(targetPerson))) {
      const spouseKinship = resolveBrotherSpouseKinship(rootPerson, sibling);

      candidates.push(
        buildKinshipResult(spouseKinship.type, {
          uncertain: spouseKinship.uncertain,
          labelOverride: spouseKinship.labelOverride,
          pathSteps: [
            { person: sibling, stepLabel: siblingLabel },
            { person: targetPerson, stepLabel: 'жұбайы' },
          ],
        }),
      );
      continue;
    }

    if (isFemale(sibling) || (!isMale(sibling) && isMale(targetPerson))) {
      const spouseKinship = resolveSisterSpouseKinship();

      candidates.push(
        buildKinshipResult(spouseKinship.type, {
          uncertain: spouseKinship.uncertain,
          pathSteps: [
            { person: sibling, stepLabel: siblingLabel },
            { person: targetPerson, stepLabel: 'жұбайы' },
          ],
        }),
      );
    }
  }

  for (const child of getChildren(rootPerson, relatives)) {
    const childSpouse = getEffectiveSpouse(child, relatives);
    if (!childSpouse || !relativeLinkIdsMatch(childSpouse.id, targetPerson.id)) {
      continue;
    }

    if (isMale(child) && (isFemale(targetPerson) || !targetPerson.gender)) {
      candidates.push(
        buildKinshipResult('kelin', {
          pathSteps: [
            { person: child, stepLabel: 'ұлы' },
            { person: targetPerson, stepLabel: 'жұбайы' },
          ],
        }),
      );
      continue;
    }

    if (isFemale(child) && (isMale(targetPerson) || !targetPerson.gender)) {
      candidates.push(
        buildKinshipResult('kuyeu_bala', {
          pathSteps: [
            { person: child, stepLabel: 'қызы' },
            { person: targetPerson, stepLabel: 'жұбайы' },
          ],
        }),
      );
    }
  }

  const spouse = getEffectiveSpouse(rootPerson, relatives);
  if (spouse) {
    if (relativeLinkIdsMatch(targetPerson.id, spouse.fatherId)) {
      candidates.push(
        buildKinshipResult('kayin_ata', {
          pathSteps: [
            { person: spouse, stepLabel: 'жұбайы' },
            { person: targetPerson, stepLabel: 'әкesi' },
          ],
        }),
      );
    }

    if (relativeLinkIdsMatch(targetPerson.id, spouse.motherId)) {
      candidates.push(
        buildKinshipResult('kayin_ene', {
          pathSteps: [
            { person: spouse, stepLabel: 'жұбайы' },
            { person: targetPerson, stepLabel: 'анасы' },
          ],
        }),
      );
    }

    const spouseSibling = getSiblings(spouse, relatives).find((person) =>
      relativeLinkIdsMatch(person.id, targetPerson.id),
    );

    if (spouseSibling) {
      const kinship = resolveKayinSiblingKinship(spouse, spouseSibling);

      candidates.push(
        buildKinshipResult(kinship.type, {
          uncertain: kinship.uncertain,
          missingGenderHint: kinship.missingGenderHint,
          pathSteps: [
            { person: spouse, stepLabel: 'жұбайы' },
            { person: spouseSibling, stepLabel: siblingStepLabel(kinship.type) },
          ],
        }),
      );
    }
  }

  return candidates;
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

export function collectKinshipCandidates(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult[] {
  const root = resolveShezhireRootPerson(rootPerson, relatives) ?? rootPerson;
  const target = resolveShezhireRootPerson(targetPerson, relatives) ?? targetPerson;

  if (relativeLinkIdsMatch(root.id, target.id)) {
    return [buildKinshipResult('self')];
  }

  const candidates: KinshipResult[] = [
    ...collectDirectCandidates(root, target, relatives),
  ];

  const grandparent = classifyGrandparents(root, target, relatives);
  if (grandparent) {
    candidates.push(grandparent);
  }

  const grandchild = classifyGrandchild(root, target, relatives);
  if (grandchild) {
    candidates.push(grandchild);
  }

  candidates.push(...collectInLawCandidates(root, target, relatives));

  const extended = classifyExtendedKinship(root, target, relatives);
  if (extended) {
    candidates.push(extended);
  }

  return candidates;
}

export function getPrimaryKinshipResult(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult {
  const root = resolveShezhireRootPerson(rootPerson, relatives) ?? rootPerson;
  const candidates = collectKinshipCandidates(rootPerson, targetPerson, relatives);
  const resolved = candidates.filter(
    (candidate) => candidate.resolved !== false && candidate.type !== 'unknown',
  );

  if (resolved.length === 0) {
    return buildUnknownResult(root);
  }

  resolved.sort((left, right) => {
    const priorityByCategory = getKinshipCategoryPriority(left.type) - getKinshipCategoryPriority(right.type);
    if (priorityByCategory !== 0) {
      return priorityByCategory;
    }

    if (left.uncertain !== right.uncertain) {
      return left.uncertain ? 1 : -1;
    }

    if (left.missingGenderHint !== right.missingGenderHint) {
      return left.missingGenderHint ? 1 : -1;
    }

    return left.pathSteps.length - right.pathSteps.length;
  });

  return resolved[0] ?? buildUnknownResult(root);
}

function getKinshipCategoryPriority(type: KinshipResult['type']): number {
  if (type === 'husband' || type === 'wife' || type === 'spouse') {
    return 1;
  }

  if (type === 'father' || type === 'mother') {
    return 2;
  }

  if (type === 'son' || type === 'daughter') {
    return 3;
  }

  if (
    type === 'aga' ||
    type === 'ini' ||
    type === 'apke' ||
    type === 'singli' ||
    type === 'sibling_neutral'
  ) {
    return 4;
  }

  if (
    type === 'grandfather' ||
    type === 'grandmother' ||
    type === 'nemere' ||
    type === 'shobere'
  ) {
    return 5;
  }

  if (
    type === 'jenge' ||
    type === 'brother_wife_neutral' ||
    type === 'jezde' ||
    type === 'kelin' ||
    type === 'kuyeu_bala' ||
    type.startsWith('kayin_') ||
    type === 'abysyn'
  ) {
    return 6;
  }

  if (type === 'kuda' || type === 'kudagi' || type === 'kuda_neutral') {
    return 7;
  }

  if (type.startsWith('nagashy_') || type.startsWith('paternal_')) {
    return 8;
  }

  if (
    type === 'zhien' ||
    type.startsWith('brother_child_') ||
    type === 'bole' ||
    type === 'tuas' ||
    type === 'relative_neutral'
  ) {
    return 9;
  }

  return 10;
}

export function classifyKinship(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult {
  return getPrimaryKinshipResult(rootPerson, targetPerson, relatives);
}

export { buildPathSentence };
