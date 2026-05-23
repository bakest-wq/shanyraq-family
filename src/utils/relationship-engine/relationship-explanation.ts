import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { findRelationship } from '@/utils/relationship-engine/find-relationship';
import { isFemale, isMale } from '@/utils/relationship-engine/graph';
import type { RelationshipLabel, RelationshipResult, RelationshipType } from '@/utils/relationship-engine/types';

export type RelationshipExplanation = {
  kazakh: string;
  russian: string;
  resolved: boolean;
  /** Optional gentle nudge when links are incomplete. */
  hint?: RelationshipLabel;
};

export const UNRESOLVED_EXPLANATION: RelationshipExplanation = {
  kazakh: 'Байланыс толық анықталмады.',
  russian: 'Связь не определена полностью.',
  resolved: false,
};

type ExplanationContext = {
  personA: Relative;
  personB: Relative;
  nameB: string;
  result: RelationshipResult;
};

function explanation(kazakh: string, russian: string, hint?: RelationshipLabel): RelationshipExplanation {
  return { kazakh, russian, resolved: true, hint };
}

function fromPath(path: RelationshipLabel, hint?: RelationshipLabel): RelationshipExplanation {
  return {
    kazakh: path.kazakh,
    russian: path.russian,
    resolved: true,
    hint,
  };
}

function buildDirectExplanation(context: ExplanationContext): RelationshipExplanation | null {
  const { personB, nameB, result } = context;

  switch (result.type) {
    case 'self':
      return explanation('Бұл сіздің өзіңіз.', 'Это вы сами.');

    case 'father':
      return explanation('Бұл адам сіздің Әkeңіз.', 'Это ваш отец.');

    case 'mother':
      return explanation('Бұл адам сіздің анаңыз.', 'Эта женщина — ваша мать.');

    case 'son':
      return explanation(`${nameB} — сіздің ұлыңыз.`, `${nameB} — ваш сын.`);

    case 'daughter':
      return explanation(`${nameB} — сіздің қызыңыз.`, `${nameB} — ваша дочь.`);

    case 'spouse':
      if (isMale(personB)) {
        return explanation('Бұл адам сіздің күйеуіңіз.', 'Это ваш супруг.');
      }

      if (isFemale(personB)) {
        return explanation('Бұл адам сіздің жұбайыңыз.', 'Это ваша супруга.');
      }

      return explanation('Бұл адам сіздің жұбайыңыз.', 'Это ваш супруг(а).');

    case 'brother':
      return explanation(
        'Бұл адам сіздің ағаңыз немесе бауырыңыз.',
        'Это ваш брат.',
      );

    case 'sister':
      return explanation('Бұл адам сіздің Әpkeңіз.', 'Это ваша сестра.');

    case 'grandfather':
      return explanation('Бұл адам сіздің атаныңыз.', 'Это ваш дедушка.');

    case 'grandmother':
      return explanation('Бұл адам сіздің апаңыз.', 'Это ваша бабушка.');

    default:
      return null;
  }
}

function buildAdvancedExplanation(context: ExplanationContext): RelationshipExplanation | null {
  const { nameB, result } = context;

  if (result.path) {
    switch (result.type) {
      case 'zhien':
        return explanation(
          `${result.path.kazakh}. Ол — сіздің жиеніңіз.`,
          `${result.path.russian}. Это ваш племянник или племянница.`,
          result.hint,
        );

      case 'bole':
        return explanation(
          'Сіздер бөле болып келесіздер.',
          'Вы приходитесь друг другу двоюродными родственниками.',
          result.hint,
        );

      case 'nemere':
      case 'grandson':
      case 'granddaughter':
        return fromPath(result.path, result.hint);

      case 'nagashy':
        return explanation(
          'Бұл адам сіздің нағашыңыз.',
          'Это ваш дядя по матери.',
          result.hint,
        );

      case 'kayin_jurt':
      case 'kelin':
      case 'kuyeu_bala':
        return fromPath(result.path, result.hint);

      default:
        return fromPath(result.path, result.hint);
    }
  }

  switch (result.type) {
    case 'zhien':
      return explanation(
        `${nameB} — сіздің жиеніңіз.`,
        `${nameB} — ваш племянник или племянница.`,
        result.hint,
      );

    case 'bole':
      return explanation(
        'Сіздер бөле болып келесіздер.',
        'Вы приходитесь друг другу двоюродными родственниками.',
        result.hint,
      );

    case 'nemere':
    case 'grandson':
    case 'granddaughter':
      return explanation(
        `${nameB} — сіздің немереңіз.`,
        `${nameB} — ваш внук или внучка.`,
        result.hint,
      );

    case 'nagashy':
      return explanation(
        'Бұл адам сіздің нағашыңыз.',
        'Это ваш дядя по матери.',
        result.hint,
      );

    case 'kayin_jurt':
      return explanation(
        `${nameB} — сіздің қайын жұртыңыз.`,
        `${nameB} — родственник вашего супруга(и).`,
        result.hint,
      );

    case 'kelin':
      return explanation(
        `${nameB} — сіздің келініңіз.`,
        `${nameB} — невестка, жена вашего сына.`,
        result.hint,
      );

    case 'kuyeu_bala':
      return explanation(
        `${nameB} — сіздің Күйеу балаңыз.`,
        `${nameB} — зять, муж вашей дочери.`,
        result.hint,
      );

    default:
      return null;
  }
}

function buildWarmExplanation(
  personA: Relative,
  personB: Relative,
  result: RelationshipResult,
): RelationshipExplanation {
  const context: ExplanationContext = {
    personA,
    personB,
    nameB: getRelativeDisplayName(personB),
    result,
  };

  const direct = buildDirectExplanation(context);
  if (direct) {
    return { ...direct, hint: result.hint };
  }

  const advanced = buildAdvancedExplanation(context);
  if (advanced) {
    return advanced;
  }

  if (result.path) {
    return fromPath(result.path, result.hint);
  }

  return {
    kazakh: `${context.nameB} — сіздің ${result.label.kazakh.toLowerCase()}.`,
    russian: `${context.nameB} — ваш(а) ${result.label.russian.toLowerCase()}.`,
    resolved: true,
    hint: result.hint,
  };
}

/**
 * Turns graph/engine output into warm, family-oriented sentences.
 *
 * @example
 * // Mock: father link
 * buildRelationshipExplanation(me, father, relatives)
 * // → { kazakh: 'Бұл адам сіздің Әkeңіз.', russian: 'Это ваш отец.' }
 *
 * @example
 * // Mock: cousin (bole)
 * buildRelationshipExplanation(me, cousin, relatives)
 * // → { kazakh: 'Сіздер бөле болып келесіздер.', ... }
 *
 * @example
 * // Mock: nephew with path
 * // → { kazakh: 'Ерлан — сіздің әпкеңіздің ұлы. Ол — сіздің жиеніңіз.', ... }
 */
export function buildRelationshipExplanation(
  personA: Relative,
  personB: Relative,
  relatives: Relative[],
): RelationshipExplanation {
  if (personA.id === personB.id) {
    return buildWarmExplanation(personA, personB, {
      type: 'self',
      category: 'core',
      label: { kazakh: 'Мен', russian: 'Я' },
      resolved: true,
    });
  }

  const result = findRelationship(personA, personB, relatives);

  if (result.type === 'unknown') {
    return {
      ...UNRESOLVED_EXPLANATION,
      hint: result.hint,
    };
  }

  return buildWarmExplanation(personA, personB, result);
}

export function formatRelationshipExplanation(explanation: RelationshipExplanation): string {
  return `${explanation.kazakh} · ${explanation.russian}`;
}

export function supportsWarmExplanation(type: RelationshipType): boolean {
  const supported: RelationshipType[] = [
    'self',
    'father',
    'mother',
    'son',
    'daughter',
    'spouse',
    'brother',
    'sister',
    'grandfather',
    'grandmother',
    'grandson',
    'granddaughter',
    'nemere',
    'zhien',
    'bole',
    'nagashy',
    'kayin_jurt',
    'kelin',
    'kuyeu_bala',
  ];

  return supported.includes(type);
}
