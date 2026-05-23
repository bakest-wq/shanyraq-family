export type MemoryType = 'photo' | 'story' | 'advice' | 'voice' | 'document';

export type MemoryTypeFilter = 'all' | MemoryType;

/** @deprecated Legacy stored values — normalized on read. */
export type LegacyMemoryCategory = 'stories' | 'legacy' | 'memorial' | 'documents';

export type StoredMemoryCategory = MemoryType | LegacyMemoryCategory;

/** @deprecated Use MemoryType */
export type ArchiveCategoryId = MemoryType;

/** @deprecated Use MemoryTypeFilter */
export type ArchiveCategoryFilter = MemoryTypeFilter;

export type FamilyMemory = {
  id: string;
  title: string;
  relativeId: string | null;
  relativeName: string;
  year: string;
  month?: string;
  day?: string;
  story: string;
  category: MemoryType;
  hasPhoto: boolean;
  hasVoice?: boolean;
  hasDocument?: boolean;
  createdAt: string;
};

export type CreateMemoryInput = {
  title: string;
  relativeId: string | null;
  relativeName: string;
  year: string;
  month?: string;
  day?: string;
  story: string;
  category: MemoryType;
  hasPhoto: boolean;
  hasVoice?: boolean;
  hasDocument?: boolean;
};

export type MemoryTypeOption = {
  id: MemoryType;
  labelKz: string;
  labelRu: string;
  icon: string;
};

export const MEMORY_TYPES: MemoryTypeOption[] = [
  { id: 'photo', labelKz: 'Фото', labelRu: 'Photo', icon: '📷' },
  { id: 'story', labelKz: 'Естелік', labelRu: 'Story', icon: '📖' },
  { id: 'advice', labelKz: 'Насихат', labelRu: 'Advice', icon: '🌿' },
  { id: 'voice', labelKz: 'Дауыс', labelRu: 'Voice note', icon: '🎙️' },
  { id: 'document', labelKz: 'Құжат', labelRu: 'Document', icon: '📄' },
];

export const MEMORY_TYPE_FILTERS: { id: MemoryTypeFilter; label: string }[] = [
  { id: 'all', label: 'Барлығы · All' },
  ...MEMORY_TYPES.map((type) => ({
    id: type.id,
    label: `${type.labelKz} · ${type.labelRu}`,
  })),
];

export const MEMORY_TYPE_ICONS: Record<MemoryType, string> = {
  photo: '📷',
  story: '📖',
  advice: '🌿',
  voice: '🎙️',
  document: '📄',
};

/** @deprecated Use MEMORY_TYPES */
export const ARCHIVE_CATEGORIES = MEMORY_TYPES.map((type) => ({
  id: type.id,
  label: `${type.labelKz} · ${type.labelRu}`,
}));

/** @deprecated Use MEMORY_TYPE_FILTERS */
export const ARCHIVE_CATEGORY_FILTERS = MEMORY_TYPE_FILTERS;

/** @deprecated Use MEMORY_TYPE_ICONS */
export const ARCHIVE_CATEGORY_ICONS = MEMORY_TYPE_ICONS;

export function normalizeMemoryType(category: StoredMemoryCategory): MemoryType {
  switch (category) {
    case 'stories':
    case 'memorial':
      return 'story';
    case 'legacy':
      return 'advice';
    case 'documents':
      return 'document';
    default:
      return category;
  }
}

export function getMemoryTypeOption(type: MemoryType): MemoryTypeOption {
  return MEMORY_TYPES.find((option) => option.id === type) ?? MEMORY_TYPES[1];
}

export function getMemoryTypeLabel(type: MemoryType): string {
  const option = getMemoryTypeOption(type);
  return `${option.labelKz} · ${option.labelRu}`;
}
