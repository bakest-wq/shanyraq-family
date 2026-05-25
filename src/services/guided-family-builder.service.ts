import { kk, FAMILY_LANGUAGE } from '@/content/family-language';
import type { Relative } from '@/types/relative';
import { findRelativeByLinkId, relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getFocusedAddChildParams } from '@/utils/focused-family-tree';
import { getEffectiveSpouse } from '@/utils/relationship-engine';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  isChildRelationship,
  isParentRelationship,
  isSiblingRelationship,
  isSpouseRelationship,
} from '@/utils/relationship-presets';
import {
  isParentSideSiblingRelationship,
  type ParentSideSiblingRelationship,
} from '@/utils/parent-side-sibling-add';
import {
  evaluateParentSideGuard,
  getParentSideGuidanceMessage,
  type ParentSideKind,
} from '@/utils/parent-side-quality';
import {
  buildSiblingParentInheritanceOffer,
  referencePersonHasParents,
  resolveSiblingInheritanceReference,
} from '@/utils/sibling-parent-inheritance';

export type GuidedFormLinks = {
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
};

export type GuidedLinkPatch = Partial<GuidedFormLinks>;

export type GuidedLinkAction =
  | {
      type: 'patch_form';
      patch: GuidedLinkPatch;
    }
  | {
      type: 'confirm_root_parent_link';
      rootPersonId: string;
      linkField: 'fatherId' | 'motherId';
    }
  | {
      type: 'focus_children_picker';
    }
  | {
      type: 'navigate_add_child';
      params: {
        fatherId?: string;
        motherId?: string;
        relationship?: string;
        rootId?: string;
      };
    };

export type PendingRootLinkAfterSave = {
  rootPersonId: string;
  linkField: 'fatherId' | 'motherId';
};

export type GuidedFamilyStep = {
  id: string;
  kind: 'sibling' | 'spouse' | 'child' | 'parent' | 'parent_side_sibling' | 'info';
  title: string;
  explanation: string;
  explanationRu: string;
  primaryLabel: string;
  skipLabel: string;
  primaryAction: GuidedLinkAction;
};

export type GuidedFamilyBuilderContext = {
  relationship: string;
  relatives: Relative[];
  rootPersonId?: string | null;
  editingRelativeId?: string;
  formLinks: GuidedFormLinks;
  linkedChildIds?: string[];
  dismissedStepIds?: ReadonlySet<string>;
  confirmedRootParentLink?: boolean;
};

export function resolveGuidedRootPerson(
  relatives: Relative[],
  rootPersonId?: string | null,
  editingRelativeId?: string,
): Relative | null {
  if (rootPersonId) {
    const fromId = findRelativeByLinkId(relatives, rootPersonId);
    if (fromId && !fromId.isDeceased) {
      return fromId;
    }
  }

  return resolveSiblingInheritanceReference({
    relatives,
    editingRelativeId,
    focusedRootId: rootPersonId ?? null,
  });
}

function isDismissed(ctx: GuidedFamilyBuilderContext, stepId: string): boolean {
  return ctx.dismissedStepIds?.has(stepId) ?? false;
}

function linksMatchExpected(
  formLinks: GuidedFormLinks,
  expected: { fatherId?: string; motherId?: string },
): boolean {
  const fatherOk = expected.fatherId
    ? relativeLinkIdsMatch(formLinks.fatherId, expected.fatherId)
    : !formLinks.fatherId;
  const motherOk = expected.motherId
    ? relativeLinkIdsMatch(formLinks.motherId, expected.motherId)
    : !formLinks.motherId;

  return fatherOk && motherOk;
}

function buildSiblingStep(ctx: GuidedFamilyBuilderContext, root: Relative): GuidedFamilyStep | null {
  if (!isSiblingRelationship(ctx.relationship) || isParentSideSiblingRelationship(ctx.relationship)) {
    return null;
  }

  if (!referencePersonHasParents(root)) {
    const stepId = 'sibling-missing-root-parents';
    if (isDismissed(ctx, stepId)) {
      return null;
    }

    return {
      id: stepId,
      kind: 'info',
      title: kk(FAMILY_LANGUAGE.guided.siblingMissingParents),
      explanation: kk(FAMILY_LANGUAGE.guided.siblingMissingParents),
      explanationRu: FAMILY_LANGUAGE.guided.siblingMissingParents.ru,
      primaryLabel: kk(FAMILY_LANGUAGE.guided.skip),
      skipLabel: kk(FAMILY_LANGUAGE.guided.skip),
      primaryAction: { type: 'patch_form', patch: {} },
    };
  }

  const offer = buildSiblingParentInheritanceOffer(
    root,
    ctx.relatives,
    ctx.formLinks,
    ctx.editingRelativeId,
  );

  if (!offer) {
    return null;
  }

  const stepId = 'sibling-shared-parents';
  if (isDismissed(ctx, stepId)) {
    return null;
  }

  const summary = [offer.fatherName, offer.motherName].filter(Boolean).join(' · ');

  return {
    id: stepId,
    kind: 'sibling',
    title: kk(FAMILY_LANGUAGE.guided.siblingSharedParents),
    explanation: `${kk(FAMILY_LANGUAGE.guided.siblingSharedParentsHint)}${summary ? `\n${summary}` : ''}`,
    explanationRu: FAMILY_LANGUAGE.guided.siblingSharedParentsHint.ru,
    primaryLabel: kk(FAMILY_LANGUAGE.guided.siblingApplyParents),
    skipLabel: kk(FAMILY_LANGUAGE.guided.skip),
    primaryAction: {
      type: 'patch_form',
      patch: {
        fatherId: offer.fatherId,
        motherId: offer.motherId,
      },
    },
  };
}

function buildParentSideSiblingStep(
  ctx: GuidedFamilyBuilderContext,
  root: Relative,
): GuidedFamilyStep | null {
  if (!isParentSideSiblingRelationship(ctx.relationship)) {
    return null;
  }

  const kind: ParentSideKind =
    ctx.relationship === 'father_side_sibling' ? 'father' : 'mother';
  const guard = evaluateParentSideGuard(kind, root, ctx.relatives);

  if (guard.state !== 'ready') {
    const stepId = `parent-side-blocked-${kind}`;
    if (isDismissed(ctx, stepId)) {
      return null;
    }

    const guidance = getParentSideGuidanceMessage(guard) ?? kk(FAMILY_LANGUAGE.guided.parentSideMissing);

    return {
      id: stepId,
      kind: 'parent_side_sibling',
      title: guidance,
      explanation: guidance,
      explanationRu: FAMILY_LANGUAGE.guided.parentSideMissing.ru,
      primaryLabel: kk(FAMILY_LANGUAGE.guided.skip),
      skipLabel: kk(FAMILY_LANGUAGE.guided.skip),
      primaryAction: { type: 'patch_form', patch: {} },
    };
  }

  if (ctx.formLinks.fatherId || ctx.formLinks.motherId) {
    return null;
  }

  const stepId = `parent-side-apply-${kind}`;
  if (isDismissed(ctx, stepId)) {
    return null;
  }

  return {
    id: stepId,
    kind: 'parent_side_sibling',
    title: kk(FAMILY_LANGUAGE.guided.parentSideApply),
    explanation: kk(FAMILY_LANGUAGE.guided.parentSideApplyHint),
    explanationRu: FAMILY_LANGUAGE.guided.parentSideApplyHint.ru,
    primaryLabel: kk(FAMILY_LANGUAGE.guided.parentSideApply),
    skipLabel: kk(FAMILY_LANGUAGE.guided.skip),
    primaryAction: {
      type: 'patch_form',
      patch: {
        fatherId: guard.grandparents.fatherId,
        motherId: guard.grandparents.motherId,
      },
    },
  };
}

function buildSpouseStep(ctx: GuidedFamilyBuilderContext, root: Relative): GuidedFamilyStep | null {
  if (!isSpouseRelationship(ctx.relationship)) {
    return null;
  }

  if (ctx.editingRelativeId && relativeLinkIdsMatch(ctx.editingRelativeId, root.id)) {
    return null;
  }

  const spouseLinkedToRoot = relativeLinkIdsMatch(ctx.formLinks.spouseId, root.id);

  if (!spouseLinkedToRoot) {
    const stepId = 'spouse-link-root';
    if (isDismissed(ctx, stepId)) {
      return null;
    }

    return {
      id: stepId,
      kind: 'spouse',
      title: kk(FAMILY_LANGUAGE.guided.spouseLinkRoot),
      explanation: `${kk(FAMILY_LANGUAGE.guided.spouseLinkRootHint)}\n${getRelativeDisplayName(root)}`,
      explanationRu: FAMILY_LANGUAGE.guided.spouseLinkRootHint.ru,
      primaryLabel: kk(FAMILY_LANGUAGE.guided.spouseLinkRootAction),
      skipLabel: kk(FAMILY_LANGUAGE.guided.skip),
      primaryAction: {
        type: 'patch_form',
        patch: { spouseId: root.id },
      },
    };
  }

  const stepId = 'spouse-link-children';
  if (isDismissed(ctx, stepId)) {
    return null;
  }

  const spouse = getEffectiveSpouse(root, ctx.relatives);
  const childParams = getFocusedAddChildParams(root, spouse);

  return {
    id: stepId,
    kind: 'spouse',
    title: kk(FAMILY_LANGUAGE.guided.spouseLinkChildren),
    explanation: kk(FAMILY_LANGUAGE.guided.spouseLinkChildrenHint),
    explanationRu: FAMILY_LANGUAGE.guided.spouseLinkChildrenHint.ru,
    primaryLabel: kk(FAMILY_LANGUAGE.guided.spouseAddChild),
    skipLabel: kk(FAMILY_LANGUAGE.guided.skip),
    primaryAction: {
      type: 'navigate_add_child',
      params: {
        ...childParams,
        relationship: 'Бала',
        rootId: root.id,
      },
    },
  };
}

function buildChildStep(ctx: GuidedFamilyBuilderContext, root: Relative): GuidedFamilyStep | null {
  if (!isChildRelationship(ctx.relationship)) {
    return null;
  }

  const spouse = getEffectiveSpouse(root, ctx.relatives);
  const expected = getFocusedAddChildParams(root, spouse);

  if (linksMatchExpected(ctx.formLinks, expected)) {
    return null;
  }

  const stepId = 'child-apply-parents';
  if (isDismissed(ctx, stepId)) {
    return null;
  }

  const rootName = getRelativeDisplayName(root);
  const spouseName = spouse ? getRelativeDisplayName(spouse) : null;
  const detail = spouseName ? `${rootName} · ${spouseName}` : rootName;

  return {
    id: stepId,
    kind: 'child',
    title: kk(FAMILY_LANGUAGE.guided.childApplyParents),
    explanation: `${kk(FAMILY_LANGUAGE.guided.childApplyParentsHint)}\n${detail}`,
    explanationRu: FAMILY_LANGUAGE.guided.childApplyParentsHint.ru,
    primaryLabel: kk(FAMILY_LANGUAGE.guided.childApplyParentsAction),
    skipLabel: kk(FAMILY_LANGUAGE.guided.skip),
    primaryAction: {
      type: 'patch_form',
      patch: {
        fatherId: expected.fatherId ?? null,
        motherId: expected.motherId ?? null,
      },
    },
  };
}

function buildParentStep(ctx: GuidedFamilyBuilderContext, root: Relative): GuidedFamilyStep | null {
  if (!isParentRelationship(ctx.relationship)) {
    return null;
  }

  const linkField: 'fatherId' | 'motherId' =
    ctx.relationship === 'Әке' ? 'fatherId' : 'motherId';

  if (!ctx.editingRelativeId) {
    const alreadyLinked = relativeLinkIdsMatch(root[linkField], ctx.editingRelativeId);
    if (alreadyLinked || ctx.confirmedRootParentLink) {
      return null;
    }

    const stepId = 'parent-link-root';
    if (isDismissed(ctx, stepId)) {
      return null;
    }

    return {
      id: stepId,
      kind: 'parent',
      title: kk(FAMILY_LANGUAGE.guided.parentLinkRoot),
      explanation: `${kk(FAMILY_LANGUAGE.guided.parentLinkRootHint)}\n${getRelativeDisplayName(root)}`,
      explanationRu: FAMILY_LANGUAGE.guided.parentLinkRootHint.ru,
      primaryLabel: kk(FAMILY_LANGUAGE.guided.parentLinkRootAction),
      skipLabel: kk(FAMILY_LANGUAGE.guided.skip),
      primaryAction: {
        type: 'confirm_root_parent_link',
        rootPersonId: root.id,
        linkField,
      },
    };
  }

  if ((ctx.linkedChildIds?.length ?? 0) > 0) {
    return null;
  }

  const stepId = 'parent-other-children';
  if (isDismissed(ctx, stepId)) {
    return null;
  }

  return {
    id: stepId,
    kind: 'parent',
    title: kk(FAMILY_LANGUAGE.guided.parentOtherChildren),
    explanation: kk(FAMILY_LANGUAGE.guided.parentOtherChildrenHint),
    explanationRu: FAMILY_LANGUAGE.guided.parentOtherChildrenHint.ru,
    primaryLabel: kk(FAMILY_LANGUAGE.guided.parentPickChildren),
    skipLabel: kk(FAMILY_LANGUAGE.guided.skip),
    primaryAction: { type: 'focus_children_picker' },
  };
}

export function buildGuidedFamilyStep(
  ctx: GuidedFamilyBuilderContext,
): GuidedFamilyStep | null {
  if (!ctx.relationship || ctx.relationship === 'Мен' || ctx.relationship === 'Я') {
    return null;
  }

  const root = resolveGuidedRootPerson(ctx.relatives, ctx.rootPersonId, ctx.editingRelativeId);
  if (!root) {
    return null;
  }

  if (ctx.editingRelativeId && relativeLinkIdsMatch(ctx.editingRelativeId, root.id)) {
    return null;
  }

  const builders = [
    buildParentSideSiblingStep,
    buildSiblingStep,
    buildSpouseStep,
    buildChildStep,
    buildParentStep,
  ];

  for (const builder of builders) {
    const step = builder(ctx, root);
    if (step) {
      return step;
    }
  }

  return null;
}

export function applyPendingRootLinkAfterSave(
  pending: PendingRootLinkAfterSave,
  createdRelativeId: string,
): GuidedLinkPatch {
  return {
    [pending.linkField]: createdRelativeId,
  };
}

export function resolvePendingRootLinkPatch(
  action: GuidedLinkAction,
): PendingRootLinkAfterSave | null {
  if (action.type !== 'confirm_root_parent_link') {
    return null;
  }

  return {
    rootPersonId: action.rootPersonId,
    linkField: action.linkField,
  };
}

export function getParentSideRelationshipKind(
  relationship: string,
): ParentSideSiblingRelationship | null {
  return isParentSideSiblingRelationship(relationship) ? relationship : null;
}
