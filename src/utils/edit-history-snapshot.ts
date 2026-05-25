import type { FamilyMemory } from '@/types/archive';
import type {
  MemoryEditSnapshot,
  RelativeEditSnapshot,
} from '@/types/edit-history';
import type { CreateRelativeInput, Relative } from '@/types/relative';

const RELATIVE_TRACKED_KEYS: (keyof RelativeEditSnapshot)[] = [
  'fullName',
  'displayName',
  'relationship',
  'birthday',
  'phone',
  'notes',
  'isDeceased',
  'deathYear',
  'duaText',
  'gender',
  'maritalStatus',
  'fatherId',
  'motherId',
  'spouseId',
  'zhuz',
  'ru',
];

export function snapshotRelative(relative: Relative): RelativeEditSnapshot {
  return {
    fullName: relative.fullName,
    displayName: relative.displayName,
    relationship: relative.relationship,
    birthday: relative.birthday,
    birthdayDay: relative.birthdayDay,
    birthdayMonth: relative.birthdayMonth,
    birthdayYear: relative.birthdayYear,
    birthdayYearUnknown: relative.birthdayYearUnknown,
    phone: relative.phone,
    notes: relative.notes,
    isDeceased: relative.isDeceased,
    deathYear: relative.deathYear,
    duaText: relative.duaText,
    gender: relative.gender,
    maritalStatus: relative.maritalStatus,
    fatherId: relative.fatherId ?? null,
    motherId: relative.motherId ?? null,
    spouseId: relative.spouseId ?? null,
    zhuz: relative.zhuz,
    ru: relative.ru,
  };
}

export function snapshotMemory(memory: FamilyMemory): MemoryEditSnapshot {
  return {
    id: memory.id,
    title: memory.title,
    relativeId: memory.relativeId,
    relativeName: memory.relativeName,
    year: memory.year,
    month: memory.month,
    day: memory.day,
    story: memory.story,
    category: memory.category,
    hasPhoto: memory.hasPhoto,
    createdAt: memory.createdAt,
  };
}

export function snapshotFromRelativeInput(input: CreateRelativeInput): RelativeEditSnapshot {
  return {
    fullName: input.fullName,
    displayName: input.displayName ?? input.fullName,
    relationship: input.relationship,
    birthday: input.birthday,
    birthdayDay: input.birthdayDay,
    birthdayMonth: input.birthdayMonth,
    birthdayYear: input.birthdayYear,
    birthdayYearUnknown: input.birthdayYearUnknown,
    phone: input.phone ?? '',
    notes: input.notes,
    isDeceased: Boolean(input.isDeceased),
    deathYear: input.deathYear,
    duaText: input.duaText,
    gender: input.gender,
    maritalStatus: input.maritalStatus,
    fatherId: input.fatherId ?? null,
    motherId: input.motherId ?? null,
    spouseId: input.spouseId ?? null,
    zhuz: input.zhuz,
    ru: input.ru,
  };
}

export function snapshotToRelativeInput(snapshot: RelativeEditSnapshot): CreateRelativeInput {
  return {
    fullName: snapshot.fullName,
    firstName: snapshot.fullName.split(/\s+/)[0] ?? snapshot.fullName,
    displayName: snapshot.displayName,
    relationship: snapshot.relationship,
    birthday: snapshot.birthday,
    birthdayDay: snapshot.birthdayDay,
    birthdayMonth: snapshot.birthdayMonth,
    birthdayYear: snapshot.birthdayYear,
    birthdayYearUnknown: snapshot.birthdayYearUnknown,
    phone: snapshot.phone,
    isDeceased: snapshot.isDeceased,
    deathYear: snapshot.deathYear,
    duaText: snapshot.duaText ?? '',
    notes: snapshot.notes ?? '',
    fatherId: snapshot.fatherId ?? null,
    motherId: snapshot.motherId ?? null,
    spouseId: snapshot.spouseId ?? null,
    gender: snapshot.gender as CreateRelativeInput['gender'],
    maritalStatus: snapshot.maritalStatus as CreateRelativeInput['maritalStatus'],
    zhuz: snapshot.zhuz ?? '',
    ru: snapshot.ru ?? '',
  };
}

export function snapshotToMemory(snapshot: MemoryEditSnapshot): FamilyMemory {
  return {
    id: snapshot.id,
    title: snapshot.title,
    relativeId: snapshot.relativeId,
    relativeName: snapshot.relativeName,
    year: snapshot.year,
    month: snapshot.month,
    day: snapshot.day,
    story: snapshot.story,
    category: snapshot.category as FamilyMemory['category'],
    hasPhoto: snapshot.hasPhoto,
    createdAt: snapshot.createdAt,
  };
}

const FIELD_LABELS: Partial<Record<keyof RelativeEditSnapshot, string>> = {
  fullName: 'Аты',
  displayName: 'Көрсетілетін аты',
  relationship: 'Туыс реті',
  birthday: 'Туған күн',
  phone: 'Телефон',
  notes: 'Жазба',
  isDeceased: 'Марқұм',
  deathYear: 'Қайтыс болған жыл',
  duaText: 'Дұға',
  gender: 'Жынысы',
  maritalStatus: 'Отбасылық жағдай',
  fatherId: 'Әке байланысы',
  motherId: 'Ана байланысы',
  spouseId: 'Жұбай байланысы',
  zhuz: 'Жүз',
  ru: 'Ру',
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'иә' : 'жоқ';
  }

  return String(value);
}

export function summarizeRelativeChanges(
  before: RelativeEditSnapshot,
  after: RelativeEditSnapshot,
): string {
  const changes: string[] = [];

  for (const key of RELATIVE_TRACKED_KEYS) {
    const left = before[key];
    const right = after[key];

    if (left !== right) {
      const label = FIELD_LABELS[key] ?? key;
      changes.push(`${label}: ${formatValue(left)} → ${formatValue(right)}`);
    }
  }

  if (changes.length === 0) {
    return 'Деректер жаңартылды';
  }

  if (changes.length === 1) {
    return changes[0];
  }

  return `${changes.length} өріс өзгертілді`;
}

export function formatEditTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleDateString('kk-KZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
