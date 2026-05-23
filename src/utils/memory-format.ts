import { FamilyMemory } from '@/types/archive';

export function formatMemoryDate(memory: FamilyMemory): string {
  const parts: string[] = [];

  if (memory.day?.trim()) {
    parts.push(memory.day.trim().padStart(2, '0'));
  }

  if (memory.month?.trim()) {
    parts.push(memory.month.trim().padStart(2, '0'));
  }

  if (memory.year?.trim()) {
    parts.push(memory.year.trim());
  }

  if (parts.length === 0) {
    return '—';
  }

  return parts.join('.');
}

export function formatMemoryDateLabel(memory: FamilyMemory): string {
  const formatted = formatMemoryDate(memory);
  return formatted === '—' ? 'Күн белгісіз · Date unknown' : formatted;
}
