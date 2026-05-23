import { FamilyMemory, MemoryTypeFilter } from '@/types/archive';

export function filterMemoriesByCategory(
  memories: FamilyMemory[],
  category: MemoryTypeFilter,
): FamilyMemory[] {
  if (category === 'all') {
    return memories;
  }

  return memories.filter((memory) => memory.category === category);
}

export function filterMemoriesByRelative(
  memories: FamilyMemory[],
  relativeId: string,
): FamilyMemory[] {
  return memories.filter((memory) => memory.relativeId === relativeId);
}

export function sortMemoriesNewestFirst(memories: FamilyMemory[]): FamilyMemory[] {
  return [...memories].sort((a, b) => {
    const yearA = Number(a.year) || 0;
    const yearB = Number(b.year) || 0;
    if (yearA !== yearB) {
      return yearB - yearA;
    }

    return b.createdAt.localeCompare(a.createdAt);
  });
}
