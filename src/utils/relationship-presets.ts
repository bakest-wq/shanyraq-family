import type { RelativeGender } from '@/types/relative';

export type RelationshipGroupId = 'core' | 'children' | 'extended' | 'marriage';

export type RelationshipOption = {
  value: string;
  label: string;
  kazakh: string;
  russian: string;
  group: RelationshipGroupId;
  genderHint?: RelativeGender;
};

export type RelationshipGroup = {
  id: RelationshipGroupId;
  title: string;
};

export const RELATIONSHIP_GROUPS: RelationshipGroup[] = [
  { id: 'core', title: 'Жақын отбасы · Core family' },
  { id: 'children', title: 'Балалар · Children' },
  { id: 'extended', title: 'Туысқан · Extended family' },
  { id: 'marriage', title: 'Неке · Marriage relations' },
];

/** Stored in DB as `relationship`; labels are for UI only. Legacy values preserved. */
export const RELATIONSHIP_OPTIONS: RelationshipOption[] = [
  { value: 'Мен', label: 'Мен · Я', kazakh: 'Мен', russian: 'Я', group: 'core' },
  { value: 'Ата', label: 'Ата · Дедушка', kazakh: 'Ата', russian: 'Дедушка', group: 'core' },
  { value: 'Апа', label: 'Апа · Бабушка', kazakh: 'Апа', russian: 'Бабушка', group: 'core', genderHint: 'female' },
  { value: 'Әке', label: 'Әке · Отец', kazakh: 'Әке', russian: 'Отец', group: 'core', genderHint: 'male' },
  { value: 'Ана', label: 'Ана · Мать', kazakh: 'Ана', russian: 'Мать', group: 'core', genderHint: 'female' },
  { value: 'Аға', label: 'Аға · Старший брат', kazakh: 'Аға', russian: 'Старший брат', group: 'core', genderHint: 'male' },
  { value: 'Әпке', label: 'Әпке · Сестра', kazakh: 'Әпке', russian: 'Сестра', group: 'core', genderHint: 'female' },
  { value: 'Іні', label: 'Іні · Младший брат', kazakh: 'Іні', russian: 'Младший брат', group: 'core', genderHint: 'male' },
  {
    value: 'Қарындас',
    label: 'Қарындас · Младшая сестра',
    kazakh: 'Қарындас',
    russian: 'Младшая сестра',
    group: 'core',
    genderHint: 'female',
  },
  { value: 'Ұлы', label: 'Ұлы · Сын', kazakh: 'Ұлы', russian: 'Сын', group: 'children', genderHint: 'male' },
  { value: 'Қызы', label: 'Қызы · Дочь', kazakh: 'Қызы', russian: 'Дочь', group: 'children', genderHint: 'female' },
  { value: 'Бала', label: 'Бала · Ребёнок', kazakh: 'Бала', russian: 'Ребёнок', group: 'children' },
  {
    value: 'Жиен',
    label: 'Жиен · Племянник/ца',
    kazakh: 'Жиен',
    russian: 'Племянник/ца',
    group: 'extended',
  },
  { value: 'Немере', label: 'Немере · Внук/учка', kazakh: 'Немере', russian: 'Внук/учка', group: 'extended' },
  {
    value: 'Нағашы',
    label: 'Нағашы · Дядя по матери',
    kazakh: 'Нағашы',
    russian: 'Дядя по матери',
    group: 'extended',
    genderHint: 'male',
  },
  {
    value: 'Бөле',
    label: 'Бөле · Двоюродный брат/сестра',
    kazakh: 'Бөле',
    russian: 'Двоюродный брат/сестра',
    group: 'extended',
  },
  {
    value: 'Жұбайы',
    label: 'Жұбайы · Супруга',
    kazakh: 'Жұбайы',
    russian: 'Супруга',
    group: 'marriage',
    genderHint: 'female',
  },
  {
    value: 'Күйеуі',
    label: 'Күйеуі · Супруг',
    kazakh: 'Күйеуі',
    russian: 'Супруг',
    group: 'marriage',
    genderHint: 'male',
  },
  {
    value: 'Келін',
    label: 'Келін · Невестка',
    kazakh: 'Келін',
    russian: 'Невестка',
    group: 'marriage',
    genderHint: 'female',
  },
  {
    value: 'Күйеу бала',
    label: 'Күйеу бала · Зять',
    kazakh: 'Күйеу бала',
    russian: 'Зять',
    group: 'marriage',
    genderHint: 'male',
  },
];

export const RELATIONSHIP_PRESETS = RELATIONSHIP_OPTIONS.map(
  (option) => option.value,
) as readonly string[];

export type RelationshipPreset = (typeof RELATIONSHIP_OPTIONS)[number]['value'];

const LABEL_BY_VALUE = new Map(RELATIONSHIP_OPTIONS.map((option) => [option.value, option.label]));

const RUSSIAN_BY_VALUE = new Map(RELATIONSHIP_OPTIONS.map((option) => [option.value, option.russian]));

export function getRelationshipLabel(value: string): string {
  return LABEL_BY_VALUE.get(value) ?? value;
}

export function getRelationshipRussian(value: string): string {
  return RUSSIAN_BY_VALUE.get(value) ?? value;
}

export function getRelationshipOptionsByGroup(groupId: RelationshipGroupId): RelationshipOption[] {
  return RELATIONSHIP_OPTIONS.filter((option) => option.group === groupId);
}

export function findRelationshipOption(value: string): RelationshipOption | undefined {
  return RELATIONSHIP_OPTIONS.find((option) => option.value === value);
}

const PARENT_RELATIONSHIPS = new Set(['Әке', 'Ана']);

const SPOUSE_RELATIONSHIPS = new Set(['Жұбайы', 'Күйеуі']);

const CHILD_RELATIONSHIPS = new Set(
  RELATIONSHIP_OPTIONS.filter((option) => option.group === 'children').map((option) => option.value),
);

export function isParentRelationship(value: string): boolean {
  return PARENT_RELATIONSHIPS.has(value);
}

export function isSpouseRelationship(value: string): boolean {
  return SPOUSE_RELATIONSHIPS.has(value);
}

export function isChildRelationship(value: string): boolean {
  return CHILD_RELATIONSHIPS.has(value);
}

/** Legacy alias kept for older imports. */
export const RELATIONSHIP_PRESET_RU: Record<string, string> = Object.fromEntries(
  RELATIONSHIP_OPTIONS.map((option) => [option.value, option.russian]),
);
