import AsyncStorage from '@react-native-async-storage/async-storage';

import { CreateTimelineEventInput, getTimelineEventTypeOption, ManualTimelineEvent } from '@/types/timeline';

function storageKey(familyId: string): string {
  return `@shanyraq/family-timeline:${familyId}`;
}

function createId(): string {
  return `tl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseOptionalNumber(value?: string): number | null {
  if (!value?.trim()) {
    return null;
  }

  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export const timelineService = {
  async getAll(familyId: string): Promise<ManualTimelineEvent[]> {
    try {
      const raw = await AsyncStorage.getItem(storageKey(familyId));
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as ManualTimelineEvent[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async add(familyId: string, input: CreateTimelineEventInput): Promise<ManualTimelineEvent> {
    const existing = await this.getAll(familyId);
    const typeOption = getTimelineEventTypeOption(input.type);
    const event: ManualTimelineEvent = {
      id: createId(),
      type: input.type,
      source: 'manual',
      title: input.title.trim(),
      titleRu: input.title.trim(),
      year: parseOptionalNumber(input.year),
      month: parseOptionalNumber(input.month),
      day: parseOptionalNumber(input.day),
      description: input.description.trim() || undefined,
      relativeIds: input.relativeIds,
      relativeNames: input.relativeNames,
      createdAt: new Date().toISOString(),
    };

    if (!event.titleRu && typeOption) {
      event.titleRu = typeOption.labelRu;
    }

    const next = [event, ...existing];
    await AsyncStorage.setItem(storageKey(familyId), JSON.stringify(next));
    return event;
  },
};
