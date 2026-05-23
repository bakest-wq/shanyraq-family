import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'relationship-suggestions-dismissed';

function storageKey(familyId: string): string {
  return `${STORAGE_PREFIX}:${familyId}`;
}

export async function loadDismissedSuggestionIds(familyId: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(familyId));
    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export async function dismissSuggestionId(familyId: string, suggestionId: string): Promise<void> {
  const current = await loadDismissedSuggestionIds(familyId);
  current.add(suggestionId);
  await AsyncStorage.setItem(storageKey(familyId), JSON.stringify([...current]));
}

export async function clearDismissedSuggestions(familyId: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(familyId));
}
