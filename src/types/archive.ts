export type MemoryType = 'photo' | 'story' | 'note';

export type MemoryTypeFilter = 'all' | MemoryType;

export type ArchiveCategoryFilter = MemoryTypeFilter | MemoryType;

/** @deprecated Legacy stored values — normalized on read. */
export type LegacyMemoryCategory =
  | 'stories'
  | 'legacy'
  | 'memorial'
  | 'documents'
  | 'advice'
  | 'voice'
  | 'document';

export type StoredMemoryCategory = MemoryType | LegacyMemoryCategory;

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
  photoUri?: string;
  hasPhoto: boolean;
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
  pendingPhotoUri?: string | null;
};

export type MemoryTypeOption = {
  id: MemoryType;
  label: string;
  icon: string;
};

export const MEMORY_TYPES: MemoryTypeOption[] = [
  { id: 'photo', label: 'Фото', icon: '📷' },
  { id: 'story', label: 'Естелік', icon: '📖' },
  { id: 'note', label: 'Жазба', icon: '🌿' },
];

export const MEMORY_TYPE_FILTERS: { id: MemoryTypeFilter; label: string }[] = [
  { id: 'all', label: 'Барлығы' },
  ...MEMORY_TYPES.map((type) => ({
    id: type.id,
    label: type.label,
  })),
];

export const MEMORY_TYPE_ICONS: Record<MemoryType, string> = {
  photo: '📷',
  story: '📖',
  note: '🌿',
};

export function normalizeMemoryType(category: StoredMemoryCategory): MemoryType {
  switch (category) {
    case 'stories':
    case 'memorial':
      return 'story';
    case 'legacy':
    case 'advice':
    case 'voice':
    case 'document':
    case 'documents':
      return 'note';
    default:
      return category;
  }
}

export function getMemoryTypeOption(type: MemoryType): MemoryTypeOption {
  return MEMORY_TYPES.find((option) => option.id === type) ?? MEMORY_TYPES[1];
}

export function getMemoryTypeLabel(type: MemoryType): string {
  return getMemoryTypeOption(type).label;
}

export function memoryHasDisplayPhoto(memory: FamilyMemory): boolean {
  return Boolean(memory.photoUri) || memory.category === 'photo';
}
