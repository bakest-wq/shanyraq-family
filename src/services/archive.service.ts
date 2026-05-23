import AsyncStorage from '@react-native-async-storage/async-storage';

import { CreateMemoryInput, FamilyMemory } from '@/types/archive';

function storageKey(familyId: string): string {
  return `@shanyraq/family-archive:${familyId}`;
}

function createId(): string {
  return `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const archiveService = {
  async getAll(familyId: string): Promise<FamilyMemory[]> {
    try {
      const raw = await AsyncStorage.getItem(storageKey(familyId));
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as FamilyMemory[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async add(familyId: string, input: CreateMemoryInput): Promise<FamilyMemory> {
    const existing = await this.getAll(familyId);
    const memory: FamilyMemory = {
      ...input,
      id: createId(),
      createdAt: new Date().toISOString(),
    };

    const next = [memory, ...existing];
    await AsyncStorage.setItem(storageKey(familyId), JSON.stringify(next));
    return memory;
  },
};
