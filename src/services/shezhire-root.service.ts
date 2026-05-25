import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKey = (familyId: string) => `@shanyraq/shezhire-focus:${familyId}`;

export const shezhireRootService = {
  async getFocusRootId(familyId: string): Promise<string | null> {
    if (!familyId) {
      return null;
    }

    try {
      const raw = await AsyncStorage.getItem(storageKey(familyId));
      const trimmed = raw?.trim();
      return trimmed || null;
    } catch {
      return null;
    }
  },

  async setFocusRootId(familyId: string, relativeId: string | null): Promise<void> {
    if (!familyId) {
      return;
    }

    if (!relativeId) {
      await AsyncStorage.removeItem(storageKey(familyId));
      return;
    }

    await AsyncStorage.setItem(storageKey(familyId), relativeId);
  },
};
