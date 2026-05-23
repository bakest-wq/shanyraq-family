export type ArchiveCategoryId =
  | 'photo'
  | 'stories'
  | 'legacy'
  | 'memorial'
  | 'documents';

export type ArchiveCategoryFilter = 'all' | ArchiveCategoryId;

export type FamilyMemory = {
  id: string;
  title: string;
  relativeId: string | null;
  relativeName: string;
  year: string;
  story: string;
  category: ArchiveCategoryId;
  hasPhoto: boolean;
  createdAt: string;
};

export type CreateMemoryInput = {
  title: string;
  relativeId: string | null;
  relativeName: string;
  year: string;
  story: string;
  category: ArchiveCategoryId;
  hasPhoto: boolean;
};

export const ARCHIVE_CATEGORIES: { id: ArchiveCategoryId; label: string }[] = [
  { id: 'photo', label: 'Фото' },
  { id: 'stories', label: 'Истории' },
  { id: 'legacy', label: 'Насихат' },
  { id: 'memorial', label: 'Естелік' },
  { id: 'documents', label: 'Құжаттар' },
];

export const ARCHIVE_CATEGORY_FILTERS: { id: ArchiveCategoryFilter; label: string }[] = [
  { id: 'all', label: 'Барлығы' },
  ...ARCHIVE_CATEGORIES,
];

export const ARCHIVE_CATEGORY_ICONS: Record<ArchiveCategoryId, string> = {
  photo: '📷',
  stories: '📖',
  legacy: '🎙️',
  memorial: '🕊️',
  documents: '📄',
};
