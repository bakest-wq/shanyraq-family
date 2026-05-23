import type {
  AdvancedRelationshipType,
  CoreRelationshipType,
  RelationshipLabel,
  RelationshipType,
} from '@/utils/relationship-engine/types';
import type { RelativeGender } from '@/types/relative';

export const UNKNOWN_RELATIONSHIP_LABEL: RelationshipLabel = {
  kazakh: 'Байланыс анықталмады',
  russian: 'Связь не определена',
};

export const PARTIAL_LINK_HINT: RelationshipLabel = {
  kazakh: 'Бұл байланыс толық анықталуы үшін әke/ана байланыстарын қосыңыз.',
  russian: 'Добавьте связи отца/матери для точного определения.',
};

export const CORE_RELATIONSHIP_LABELS: Record<
  Exclude<CoreRelationshipType, 'unknown' | 'self'>,
  RelationshipLabel
> = {
  father: { kazakh: 'Әкesi', russian: 'Отец' },
  mother: { kazakh: 'Анасы', russian: 'Мать' },
  son: { kazakh: 'Ұлы', russian: 'Сын' },
  daughter: { kazakh: 'Қызы', russian: 'Дочь' },
  brother: { kazakh: 'Ағасы', russian: 'Старший брат' },
  sister: { kazakh: 'Әпкesi', russian: 'Старшая сестра' },
  grandfather: { kazakh: 'Атасы', russian: 'Дедушка' },
  grandmother: { kazakh: 'Апасы', russian: 'Бабушка' },
  grandson: { kazakh: 'Немере ұлы', russian: 'Внук' },
  granddaughter: { kazakh: 'Немере қызы', russian: 'Внучка' },
  spouse: { kazakh: 'Жұбайы', russian: 'Супруг(а)' },
};

export const ADVANCED_RELATIONSHIP_LABELS: Record<AdvancedRelationshipType, RelationshipLabel> = {
  zhien: { kazakh: 'Жиен', russian: 'Племянник / племянница' },
  bole: { kazakh: 'Бөле', russian: 'Двоюродный брат / сестра (ана жағы)' },
  nemere: { kazakh: 'Немере', russian: 'Внук / внучка' },
  nagashy: { kazakh: 'Нағашы', russian: 'Дядя по матери' },
  kayin_jurt: { kazakh: 'Қайын жұрт', russian: 'Родня супруга(и)' },
  kelin: { kazakh: 'Келін', russian: 'Невестка (ұлыңыздың жұбайы)' },
  kuyeu_bala: { kazakh: 'Күйеу бала', russian: 'Зять (қызыңыздың жұбайы)' },
};

export function getRelationshipLabel(
  type: RelationshipType,
  subjectGender?: RelativeGender,
): RelationshipLabel {
  if (type === 'unknown') {
    return UNKNOWN_RELATIONSHIP_LABEL;
  }

  if (type === 'self') {
    return { kazakh: 'Мен', russian: 'Я' };
  }

  if (type === 'spouse') {
    if (subjectGender === 'male') {
      return { kazakh: 'Күйеуі', russian: 'Супруг' };
    }

    if (subjectGender === 'female') {
      return { kazakh: 'Жұбайы', russian: 'Супруга' };
    }

    return CORE_RELATIONSHIP_LABELS.spouse;
  }

  if (type in ADVANCED_RELATIONSHIP_LABELS) {
    return ADVANCED_RELATIONSHIP_LABELS[type as AdvancedRelationshipType];
  }

  return CORE_RELATIONSHIP_LABELS[type as Exclude<CoreRelationshipType, 'unknown' | 'self'>];
}

export function formatRelationshipLabel(label: RelationshipLabel): string {
  return `${label.kazakh} · ${label.russian}`;
}

export function formatRelationshipPath(path: RelationshipLabel): string {
  return `${path.kazakh} · ${path.russian}`;
}
