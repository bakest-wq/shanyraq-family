import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { buildKinshipResult } from '@/utils/kinship/classify-helpers';
import {
  getChildren,
  getDescendantDepth,
  getPersonById,
  isChildOf,
  isFemale,
} from '@/utils/kinship/graph';
import type { KinshipLabel, KinshipResult } from '@/utils/kinship/types';

const PATERNAL_GRANDFATHER_LABEL: KinshipLabel = {
  kazakh: 'Әке жағынан ата',
  russian: 'Дедушка по отцу',
  subtitle: 'әке жағы',
};

const PATERNAL_GRANDMOTHER_LABEL: KinshipLabel = {
  kazakh: 'Әке жағынан әже',
  russian: 'Бабушка по отцу',
  subtitle: 'әке жағы',
};

type GrandparentMatch = {
  parentSide: 'father' | 'mother';
  grandSide: 'father' | 'mother';
  type: KinshipResult['type'];
  parentStepLabel: string;
  grandStepLabel: string;
  labelOverride?: KinshipLabel;
};

const GRANDPARENT_MATCHES: GrandparentMatch[] = [
  {
    parentSide: 'father',
    grandSide: 'father',
    type: 'grandfather',
    parentStepLabel: 'әке',
    grandStepLabel: 'ата',
    labelOverride: PATERNAL_GRANDFATHER_LABEL,
  },
  {
    parentSide: 'father',
    grandSide: 'mother',
    type: 'grandmother',
    parentStepLabel: 'әке',
    grandStepLabel: 'әже',
    labelOverride: PATERNAL_GRANDMOTHER_LABEL,
  },
  {
    parentSide: 'mother',
    grandSide: 'father',
    type: 'nagashy_ata',
    parentStepLabel: 'ана',
    grandStepLabel: 'нағашы ата',
  },
  {
    parentSide: 'mother',
    grandSide: 'mother',
    type: 'nagashy_aje',
    parentStepLabel: 'ана',
    grandStepLabel: 'нағашы әже',
  },
];

function resolveGrandparentLinkId(
  rootPerson: Relative,
  relatives: Relative[],
  match: GrandparentMatch,
): { parent: Relative; grandparentId: string } | null {
  const parentId = match.parentSide === 'father' ? rootPerson.fatherId : rootPerson.motherId;
  if (!parentId) {
    return null;
  }

  const parent = getPersonById(relatives, parentId);
  if (!parent) {
    return null;
  }

  const grandparentId = match.grandSide === 'father' ? parent.fatherId : parent.motherId;
  if (!grandparentId) {
    return null;
  }

  return { parent, grandparentId };
}

/**
 * Detect grandparents using only father_id / mother_id chains:
 * root → parent → grandparent.
 */
export function classifyGrandparents(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  for (const match of GRANDPARENT_MATCHES) {
    const resolved = resolveGrandparentLinkId(rootPerson, relatives, match);
    if (!resolved) {
      continue;
    }

    if (!relativeLinkIdsMatch(targetPerson.id, resolved.grandparentId)) {
      continue;
    }

    return buildKinshipResult(match.type, {
      pathSteps: [
        { person: resolved.parent, stepLabel: match.parentStepLabel },
        { person: targetPerson, stepLabel: match.grandStepLabel },
      ],
      labelOverride: match.labelOverride,
    });
  }

  return null;
}

/**
 * Grandchild: target is child of root's child, or root is grandparent of target.
 */
export function classifyGrandchild(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): KinshipResult | null {
  for (const child of getChildren(rootPerson, relatives)) {
    if (isFemale(child) && isChildOf(targetPerson, child, relatives)) {
      return null;
    }
  }

  const depth = getDescendantDepth(rootPerson, targetPerson, relatives);
  if (depth === 2) {
    return buildKinshipResult('nemere', {
      pathSteps: [{ person: targetPerson, stepLabel: 'немере' }],
    });
  }

  for (const parentSide of ['father', 'mother'] as const) {
    const parentId = parentSide === 'father' ? targetPerson.fatherId : targetPerson.motherId;
    if (!parentId) {
      continue;
    }

    const parent = getPersonById(relatives, parentId);
    if (!parent) {
      continue;
    }

    for (const grandSide of ['father', 'mother'] as const) {
      const grandparentId = grandSide === 'father' ? parent.fatherId : parent.motherId;
      if (!grandparentId || !relativeLinkIdsMatch(rootPerson.id, grandparentId)) {
        continue;
      }

      return buildKinshipResult('nemere', {
        pathSteps: [
          { person: parent, stepLabel: parentSide === 'father' ? 'әке' : 'ана' },
          { person: targetPerson, stepLabel: 'немере' },
        ],
      });
    }
  }

  return null;
}
