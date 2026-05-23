import { Relative } from '@/types/relative';
import {
  getById,
  getChildren,
  getEffectiveSpouse,
  getParents,
  getSiblings,
  isFemale,
  isMale,
} from '@/utils/relationship-engine/graph';
import {
  ADVANCED_RELATIONSHIP_LABELS,
  getRelationshipLabel,
  PARTIAL_LINK_HINT,
} from '@/utils/relationship-engine/labels';
import {
  buildBolePath,
  buildKayinJurtPath,
  buildKelinPath,
  buildKuyeuBalaPath,
  buildNagashyPath,
  buildZhienPath,
} from '@/utils/relationship-engine/relationship-path';
import type { RelationshipResult } from '@/utils/relationship-engine/types';

type PathContext = {
  personA: Relative;
  personB: Relative;
  relatives: Relative[];
};

function areSpouses(a: Relative, b: Relative): boolean {
  return a.spouseId === b.id || b.spouseId === a.id;
}

function buildAdvancedResult(
  type: keyof typeof ADVANCED_RELATIONSHIP_LABELS,
  path?: RelationshipResult['path'],
  resolved = true,
): RelationshipResult {
  return {
    type,
    category: 'advanced',
    label: getRelationshipLabel(type),
    path,
    resolved,
  };
}

function detectKelinOrKuyeuBala(context: PathContext): RelationshipResult | null {
  for (const child of getChildren(context.personA, context.relatives)) {
    if (isMale(child) && areSpouses(child, context.personB) && isFemale(context.personB)) {
      return buildAdvancedResult('kelin', buildKelinPath(context, child));
    }

    if (isFemale(child) && areSpouses(child, context.personB) && isMale(context.personB)) {
      return buildAdvancedResult('kuyeu_bala', buildKuyeuBalaPath(context, child));
    }
  }

  return null;
}

function detectNagashy(context: PathContext): RelationshipResult | null {
  const mother = getById(context.relatives, context.personA.motherId);
  if (!mother) {
    return null;
  }

  for (const sibling of getSiblings(mother, context.relatives)) {
    if (sibling.id !== context.personB.id || !isMale(sibling)) {
      continue;
    }

    return buildAdvancedResult('nagashy', buildNagashyPath(context));
  }

  return null;
}

function detectZhien(context: PathContext): RelationshipResult | null {
  for (const sibling of getSiblings(context.personA, context.relatives)) {
    const nephewOrNiece = getChildren(sibling, context.relatives).find(
      (child) => child.id === context.personB.id,
    );

    if (nephewOrNiece) {
      return buildAdvancedResult('zhien', buildZhienPath(context, sibling));
    }
  }

  return null;
}

function detectBole(context: PathContext): RelationshipResult | null {
  for (const parent of getParents(context.personA, context.relatives)) {
    for (const auntOrUncle of getSiblings(parent, context.relatives)) {
      const cousin = getChildren(auntOrUncle, context.relatives).find(
        (child) => child.id === context.personB.id,
      );

      if (!cousin) {
        continue;
      }

      return buildAdvancedResult('bole', buildBolePath(context, parent, auntOrUncle));
    }
  }

  return null;
}

function detectKayinJurt(context: PathContext): RelationshipResult | null {
  const spouse = getEffectiveSpouse(context.personA, context.relatives);
  if (!spouse || spouse.id === context.personB.id) {
    return null;
  }

  const isInLaw =
    context.personB.id === spouse.fatherId ||
    context.personB.id === spouse.motherId ||
    getSiblings(spouse, context.relatives).some((sibling) => sibling.id === context.personB.id) ||
    getChildren(spouse, context.relatives).some((child) => child.id === context.personB.id) ||
    getParents(spouse, context.relatives).some((parent) => parent.id === context.personB.id);

  if (!isInLaw) {
    return null;
  }

  return buildAdvancedResult('kayin_jurt', buildKayinJurtPath(context));
}

/**
 * Advanced Kazakh kinship — runs after core detection fails.
 *
 * @example
 * // Mock: Me → Erlan (sister Aygul's son)
 * // → { type: 'zhien', path: 'Ерлан — сіздің әпкеңіздің ұлы' }
 *
 * @example
 * // Mock: Me → Aigul (son Nursultan's wife)
 * // → { type: 'kelin', label: 'Келін · Невестка' }
 */
export function findAdvancedKazakhRelationship(
  personA: Relative,
  personB: Relative,
  relatives: Relative[],
): RelationshipResult | null {
  const context: PathContext = { personA, personB, relatives };

  return (
    detectKelinOrKuyeuBala(context) ??
    detectNagashy(context) ??
    detectZhien(context) ??
    detectBole(context) ??
    detectKayinJurt(context)
  );
}

export function shouldSuggestParentLinks(personA: Relative, personB: Relative): boolean {
  return !personA.fatherId && !personA.motherId && personA.id !== personB.id;
}

export function buildUnknownResult(
  personA: Relative,
  personB: Relative,
  resolved: boolean,
): RelationshipResult {
  return {
    type: 'unknown',
    category: 'core',
    label: getRelationshipLabel('unknown'),
    hint: shouldSuggestParentLinks(personA, personB) ? PARTIAL_LINK_HINT : undefined,
    resolved,
  };
}

/*
 * Additional mock scenarios (comment-only):
 *
 * kayin_jurt:
 *   A=Me, spouse=Gulnara, B=Gulnara's mother → Қайын жұрт
 *
 * bole (maternal side):
 *   A=Me, B=cousin via mother's sister → Бөле · ана жағы
 *
 * partial:
 *   A has no father_id/mother_id → unknown + PARTIAL_LINK_HINT
 */
