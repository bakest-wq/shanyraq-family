import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_RECENT_PEOPLE = 8;

const storageKey = (familyId: string) => `@shanyraq/recent-people:${familyId}`;

type RecentPersonEntry = {
  relativeId: string;
  viewedAt: string;
};

function normalizeEntries(raw: unknown): RecentPersonEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const relativeId = (entry as RecentPersonEntry).relativeId?.trim();
      const viewedAt = (entry as RecentPersonEntry).viewedAt?.trim();

      if (!relativeId || !viewedAt) {
        return null;
      }

      return { relativeId, viewedAt };
    })
    .filter((entry): entry is RecentPersonEntry => entry !== null);
}

export const recentPeopleService = {
  async getRecentIds(familyId: string): Promise<string[]> {
    if (!familyId) {
      return [];
    }

    try {
      const raw = await AsyncStorage.getItem(storageKey(familyId));
      if (!raw) {
        return [];
      }

      return normalizeEntries(JSON.parse(raw)).map((entry) => entry.relativeId);
    } catch {
      return [];
    }
  },

  async recordView(familyId: string, relativeId: string): Promise<string[]> {
    if (!familyId || !relativeId) {
      return [];
    }

    try {
      const raw = await AsyncStorage.getItem(storageKey(familyId));
      const existing = raw ? normalizeEntries(JSON.parse(raw)) : [];
      const nextEntries = [
        { relativeId, viewedAt: new Date().toISOString() },
        ...existing.filter((entry) => entry.relativeId !== relativeId),
      ].slice(0, MAX_RECENT_PEOPLE);

      await AsyncStorage.setItem(storageKey(familyId), JSON.stringify(nextEntries));
      return nextEntries.map((entry) => entry.relativeId);
    } catch {
      return [];
    }
  },

  async clear(familyId: string): Promise<void> {
    if (!familyId) {
      return;
    }

    await AsyncStorage.removeItem(storageKey(familyId));
  },
};
