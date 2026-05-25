import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CreateMemoryInput,
  FamilyMemory,
  normalizeMemoryType,
  StoredMemoryCategory,
} from '@/types/archive';
import {
  enrichMemoriesWithLocalPhotos,
  removeLocalMemoryPhoto,
  saveMemoryPhotoLocally,
} from '@/utils/memory-photo-local';

function storageKey(familyId: string): string {
  return `@shanyraq/family-archive:${familyId}`;
}

function createId(): string {
  return `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type RawStoredMemory = Omit<FamilyMemory, 'category'> & {
  category: StoredMemoryCategory;
  hasVoice?: boolean;
  hasDocument?: boolean;
};

function normalizeMemory(raw: RawStoredMemory): FamilyMemory {
  const category = normalizeMemoryType(raw.category);

  return {
    id: raw.id,
    title: raw.title,
    relativeId: raw.relativeId,
    relativeName: raw.relativeName,
    year: raw.year,
    month: raw.month,
    day: raw.day,
    story: raw.story,
    category,
    photoUri: raw.photoUri,
    hasPhoto: Boolean(raw.photoUri) || raw.hasPhoto || category === 'photo',
    createdAt: raw.createdAt,
  };
}

export const archiveService = {
  async getAll(familyId: string): Promise<FamilyMemory[]> {
    try {
      const raw = await AsyncStorage.getItem(storageKey(familyId));
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as RawStoredMemory[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      const normalized = parsed.map(normalizeMemory);
      return enrichMemoriesWithLocalPhotos(normalized);
    } catch {
      return [];
    }
  },

  async add(familyId: string, input: CreateMemoryInput): Promise<FamilyMemory> {
    const existing = await this.getAll(familyId);
    const id = createId();
    let photoUri: string | undefined;

    if (input.pendingPhotoUri) {
      photoUri = await saveMemoryPhotoLocally(id, input.pendingPhotoUri);
    }

    const memory: FamilyMemory = {
      id,
      title: input.title.trim(),
      relativeId: input.relativeId,
      relativeName: input.relativeName.trim(),
      year: input.year.trim() || new Date().getFullYear().toString(),
      month: input.month?.trim() || undefined,
      day: input.day?.trim() || undefined,
      story: input.story.trim(),
      category: input.category,
      photoUri,
      hasPhoto: Boolean(photoUri) || input.category === 'photo',
      createdAt: new Date().toISOString(),
    };

    const next = [memory, ...existing];
    await AsyncStorage.setItem(storageKey(familyId), JSON.stringify(next));
    return memory;
  },

  async remove(familyId: string, memoryId: string): Promise<void> {
    const existing = await this.getAll(familyId);
    await removeLocalMemoryPhoto(memoryId);
    const next = existing.filter((memory) => memory.id !== memoryId);
    await AsyncStorage.setItem(storageKey(familyId), JSON.stringify(next));
  },

  async restore(familyId: string, memory: FamilyMemory): Promise<FamilyMemory> {
    const existing = await this.getAll(familyId);
    const without = existing.filter((item) => item.id !== memory.id);
    const next = [memory, ...without];
    await AsyncStorage.setItem(storageKey(familyId), JSON.stringify(next));
    return memory;
  },

  async replaceAll(familyId: string, memories: FamilyMemory[]): Promise<void> {
    const normalized = memories.map((memory) => ({
      ...memory,
      category: normalizeMemoryType(memory.category as StoredMemoryCategory),
    }));
    await AsyncStorage.setItem(storageKey(familyId), JSON.stringify(normalized));
  },
};
