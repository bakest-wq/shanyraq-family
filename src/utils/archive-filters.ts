import { ArchiveCategoryFilter, FamilyMemory } from '@/types/archive';

export function filterMemoriesByCategory(
  memories: FamilyMemory[],
  category: ArchiveCategoryFilter,
): FamilyMemory[] {
  if (category === 'all') {
    return memories;
  }

  return memories.filter((memory) => memory.category === category);
}
