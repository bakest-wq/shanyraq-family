import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CreateMemoryInput,
  FamilyMemory,
  normalizeMemoryType,
  StoredMemoryCategory,
} from '@/types/archive';

function storageKey(familyId: string): string {
  return `@shanyraq/family-archive:${familyId}`;
}

function createId(): string {
  return `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type RawStoredMemory = Omit<FamilyMemory, 'category'> & {
  category: StoredMemoryCategory;
};

function normalizeMemory(raw: RawStoredMemory): FamilyMemory {
  const storedCategory = raw.category;
  return {
    ...raw,
    category: normalizeMemoryType(storedCategory),
    hasVoice: raw.hasVoice ?? (storedCategory === 'legacy' || storedCategory === 'voice'),
    hasDocument: raw.hasDocument ?? (storedCategory === 'documents' || storedCategory === 'document'),
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

      return parsed.map(normalizeMemory);
    } catch {
      return [];
    }
  },

  async add(familyId: string, input: CreateMemoryInput): Promise<FamilyMemory> {
    const existing = await this.getAll(familyId);
    const memory: FamilyMemory = {
      ...input,
      id: createId(),
      category: normalizeMemoryType(input.category),
      hasVoice: input.hasVoice ?? input.category === 'voice',
      hasDocument: input.hasDocument ?? input.category === 'document',
      createdAt: new Date().toISOString(),
    };

    const next = [memory, ...existing];
    await AsyncStorage.setItem(storageKey(familyId), JSON.stringify(next));
    return memory;
  },
};
