import { Relative } from '@/types/relative';
import { findFamilyAnchor } from '@/utils/kinship-path';
import { areSharedParentSiblings } from '@/utils/family-sibling-links';
import { findRelationship } from '@/utils/relationship-engine';
import { getChildren, getSiblings } from '@/utils/relationship-engine';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  areSpousesLinked,
  getById,
  getEffectiveSpouse,
  isFemale,
  isMale,
  suggestionPairKey,
} from '@/utils/relationship-suggestions/helpers';
import {
  buildChildToParentMessage,
  buildCoParentSpouseMessage,
  buildMissingParentMessage,
  buildSiblingNoteMessage,
  buildSpouseLinkMessage,
  copyToSuggestionFields,
} from '@/utils/relationship-suggestions/messages';
import type {
  AnalyzeSuggestionsContext,
  RelationshipBadge,
  RelationshipSuggestion,
} from '@/utils/relationship-suggestions/types';

function pushSuggestion(
  bucket: RelationshipSuggestion[],
  seen: Set<string>,
  suggestion: RelationshipSuggestion,
) {
  if (seen.has(suggestion.id)) {
    return;
  }

  seen.add(suggestion.id);
  bucket.push(suggestion);
}

function resolveChildParents(
  child: Relative,
  relatives: Relative[],
  context?: AnalyzeSuggestionsContext,
): { fatherId?: string | null; motherId?: string | null } {
  if (context?.subjectId === child.id) {
    return {
      fatherId: context.draftFatherId ?? child.fatherId,
      motherId: context.draftMotherId ?? child.motherId,
    };
  }

  return {
    fatherId: child.fatherId,
    motherId: child.motherId,
  };
}

function suggestCoParentSpouses(
  relatives: Relative[],
  bucket: RelationshipSuggestion[],
  seen: Set<string>,
) {
  for (const child of relatives) {
    if (!child.fatherId || !child.motherId) {
      continue;
    }

    const father = getById(relatives, child.fatherId);
    const mother = getById(relatives, child.motherId);

    if (!father || !mother || areSpousesLinked(father, mother)) {
      continue;
    }

    const message = buildCoParentSpouseMessage(
      getRelativeDisplayName(father),
      getRelativeDisplayName(mother),
    );

    pushSuggestion(bucket, seen, {
      id: `coparent-spouse:${suggestionPairKey(father.id, mother.id)}`,
      kind: 'link_spouse_from_coparents',
      ...copyToSuggestionFields(message),
      subjectId: father.id,
      relatedIds: [father.id, mother.id, child.id],
      priority: 1,
      action: {
        type: 'patch_links_pair',
        primaryId: father.id,
        primaryPatch: { spouseId: mother.id },
        secondaryId: mother.id,
        secondaryPatch: { spouseId: father.id },
      },
    });
  }
}

function suggestMissingParentFromSpouse(
  relatives: Relative[],
  bucket: RelationshipSuggestion[],
  seen: Set<string>,
  context?: AnalyzeSuggestionsContext,
) {
  for (const child of relatives) {
    const { fatherId, motherId } = resolveChildParents(child, relatives, context);

    if (fatherId && !motherId) {
      const father = getById(relatives, fatherId);
      const spouse = father ? getEffectiveSpouse(father, relatives) : null;

      if (father && spouse && (isFemale(spouse) || !spouse.gender)) {
        const message = buildMissingParentMessage(
          getRelativeDisplayName(child),
          getRelativeDisplayName(spouse),
          'mother',
        );

        pushSuggestion(bucket, seen, {
          id: `missing-mother:${child.id}:${spouse.id}`,
          kind: 'link_missing_parent_from_spouse',
          ...copyToSuggestionFields(message),
          subjectId: child.id,
          relatedIds: [child.id, spouse.id, father.id],
          priority: 2,
          action: {
            type: 'patch_links',
            personId: child.id,
            patch: { motherId: spouse.id },
          },
        });
      }
    }

    if (motherId && !fatherId) {
      const mother = getById(relatives, motherId);
      const spouse = mother ? getEffectiveSpouse(mother, relatives) : null;

      if (mother && spouse && (isMale(spouse) || !spouse.gender)) {
        const message = buildMissingParentMessage(
          getRelativeDisplayName(child),
          getRelativeDisplayName(spouse),
          'father',
        );

        pushSuggestion(bucket, seen, {
          id: `missing-father:${child.id}:${spouse.id}`,
          kind: 'link_missing_parent_from_spouse',
          ...copyToSuggestionFields(message),
          subjectId: child.id,
          relatedIds: [child.id, spouse.id, mother.id],
          priority: 2,
          action: {
            type: 'patch_links',
            personId: child.id,
            patch: { fatherId: spouse.id },
          },
        });
      }
    }
  }
}

function suggestChildToParent(
  relatives: Relative[],
  bucket: RelationshipSuggestion[],
  seen: Set<string>,
) {
  for (const parent of relatives) {
    if (parent.isDeceased) {
      continue;
    }

    const parentIsFather = parent.gender === 'male';
    const parentIsMother = parent.gender === 'female';

    if (!parentIsFather && !parentIsMother) {
      continue;
    }

    for (const child of relatives) {
      if (child.id === parent.id || child.isDeceased) {
        continue;
      }

      if (areSharedParentSiblings(parent, child)) {
        continue;
      }

      if (parentIsFather && child.fatherId === parent.id) {
        continue;
      }

      if (parentIsMother && child.motherId === parent.id) {
        continue;
      }

      const spouse = getEffectiveSpouse(parent, relatives);
      const childHasOtherParent =
        (parentIsFather && child.motherId && child.motherId !== spouse?.id) ||
        (parentIsMother && child.fatherId && child.fatherId !== spouse?.id);

      if (childHasOtherParent) {
        continue;
      }

      if (parentIsFather && !child.fatherId && child.motherId && spouse?.id === child.motherId) {
        const message = buildChildToParentMessage(
          getRelativeDisplayName(child),
          getRelativeDisplayName(parent),
          'father',
          child.gender,
        );

        pushSuggestion(bucket, seen, {
          id: `link-child-father:${child.id}:${parent.id}`,
          kind: 'link_child_to_parent',
          ...copyToSuggestionFields(message),
          subjectId: parent.id,
          relatedIds: [child.id, parent.id],
          priority: 3,
          action: {
            type: 'patch_links',
            personId: child.id,
            patch: { fatherId: parent.id },
          },
        });
      }

      if (parentIsMother && !child.motherId && child.fatherId && spouse?.id === child.fatherId) {
        const message = buildChildToParentMessage(
          getRelativeDisplayName(child),
          getRelativeDisplayName(parent),
          'mother',
          child.gender,
        );

        pushSuggestion(bucket, seen, {
          id: `link-child-mother:${child.id}:${parent.id}`,
          kind: 'link_child_to_parent',
          ...copyToSuggestionFields(message),
          subjectId: parent.id,
          relatedIds: [child.id, parent.id],
          priority: 3,
          action: {
            type: 'patch_links',
            personId: child.id,
            patch: { motherId: parent.id },
          },
        });
      }
    }
  }
}

function suggestReciprocalSpouse(
  relatives: Relative[],
  bucket: RelationshipSuggestion[],
  seen: Set<string>,
) {
  for (const person of relatives) {
    if (!person.spouseId) {
      continue;
    }

    const spouse = getById(relatives, person.spouseId);
    if (!spouse || spouse.spouseId === person.id) {
      continue;
    }

    const message = buildSpouseLinkMessage(
      getRelativeDisplayName(person),
      getRelativeDisplayName(spouse),
    );

    pushSuggestion(bucket, seen, {
      id: `reciprocal-spouse:${suggestionPairKey(person.id, spouse.id)}`,
      kind: 'link_spouse_reciprocal',
      ...copyToSuggestionFields(message),
      subjectId: person.id,
      relatedIds: [person.id, spouse.id],
      priority: 4,
      action: {
        type: 'patch_links',
        personId: spouse.id,
        patch: { spouseId: person.id },
      },
    });
  }
}

function suggestSharedParentNotes(
  relatives: Relative[],
  bucket: RelationshipSuggestion[],
  seen: Set<string>,
) {
  for (const person of relatives) {
    const siblings = getSiblings(person, relatives);

    for (const sibling of siblings) {
      if (person.id >= sibling.id) {
        continue;
      }

      const message = buildSiblingNoteMessage(
        getRelativeDisplayName(person),
        getRelativeDisplayName(sibling),
      );

      pushSuggestion(bucket, seen, {
        id: `shared-parents:${suggestionPairKey(person.id, sibling.id)}`,
        kind: 'note_shared_parents',
        ...copyToSuggestionFields(message),
        subjectId: person.id,
        relatedIds: [person.id, sibling.id],
        priority: 8,
        action: {
          type: 'patch_links',
          personId: person.id,
          patch: {},
        },
      });
    }
  }
}

function filterActionableSuggestions(suggestions: RelationshipSuggestion[]): RelationshipSuggestion[] {
  return suggestions.filter((suggestion) => {
    if (suggestion.kind === 'note_shared_parents') {
      return true;
    }

    const patch =
      suggestion.action.type === 'patch_links'
        ? suggestion.action.patch
        : {
            ...suggestion.action.primaryPatch,
            ...suggestion.action.secondaryPatch,
          };

    return Object.keys(patch).length > 0;
  });
}

export function analyzeRelationshipSuggestions(
  relatives: Relative[],
  context?: AnalyzeSuggestionsContext,
): RelationshipSuggestion[] {
  const bucket: RelationshipSuggestion[] = [];
  const seen = new Set<string>();

  suggestCoParentSpouses(relatives, bucket, seen);
  suggestMissingParentFromSpouse(relatives, bucket, seen, context);
  suggestChildToParent(relatives, bucket, seen);
  suggestReciprocalSpouse(relatives, bucket, seen);
  suggestSharedParentNotes(relatives, bucket, seen);

  const sorted = filterActionableSuggestions(bucket).sort((a, b) => a.priority - b.priority);

  if (!context?.subjectId) {
    return sorted;
  }

  const subjectId = context.subjectId;

  return sorted.filter(
    (suggestion) =>
      suggestion.subjectId === subjectId || suggestion.relatedIds.includes(subjectId),
  );
}

export function getRelativeRelationshipBadges(
  relative: Relative,
  relatives: Relative[],
): RelationshipBadge[] {
  const badges: RelationshipBadge[] = [];
  const children = getChildren(relative, relatives);
  const siblings = getSiblings(relative, relatives);
  const spouse = getEffectiveSpouse(relative, relatives);
  const anchor = findFamilyAnchor(relatives);

  if (anchor && anchor.id !== relative.id) {
    const relation = findRelationship(anchor, relative, relatives);
    if (relation.type !== 'unknown' && relation.type !== 'self') {
      badges.push({
        id: `to-anchor:${relation.type}`,
        labelKz: relation.label.kazakh,
        labelRu: relation.label.russian,
        tone: 'gold',
      });
    }
  }

  if (relative.fatherId || relative.motherId) {
    badges.push({
      id: 'has-parents',
      labelKz: 'Бала',
      labelRu: 'Ребёнок',
      tone: 'cream',
    });
  }

  if (children.length > 0) {
    badges.push({
      id: 'has-children',
      labelKz: `${children.length} бала`,
      labelRu: `${children.length} ${children.length === 1 ? 'ребёнок' : 'детей'}`,
      tone: 'green',
    });
  }

  if (spouse) {
    badges.push({
      id: 'has-spouse',
      labelKz: 'Жұбайы',
      labelRu: 'Супруг(а)',
      tone: 'gold',
    });
  }

  if (siblings.length > 0) {
    badges.push({
      id: 'has-siblings',
      labelKz: `${siblings.length} бауыр`,
      labelRu: `${siblings.length} ${siblings.length === 1 ? 'брат/сестра' : 'братьев/сёстер'}`,
      tone: 'cream',
    });
  }

  if (relative.relationship === 'Әке') {
    badges.push({ id: 'role-father', labelKz: 'Әke', labelRu: 'Отец', tone: 'green' });
  }

  if (relative.relationship === 'Ана') {
    badges.push({ id: 'role-mother', labelKz: 'Ana', labelRu: 'Мать', tone: 'green' });
  }

  return badges;
}
