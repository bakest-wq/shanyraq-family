import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@shanyraq/test-family-seed';

function storageKey(familyId: string): string {
  return `${STORAGE_PREFIX}:${familyId}`;
}

export async function getTestRelativeIds(familyId: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(familyId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

export async function saveTestRelativeIds(familyId: string, ids: string[]): Promise<void> {
  await AsyncStorage.setItem(storageKey(familyId), JSON.stringify(ids));
}

export async function clearTestRelativeIds(familyId: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(familyId));
}

export async function hasTestFamilySeed(familyId: string): Promise<boolean> {
  const ids = await getTestRelativeIds(familyId);
  return ids.length > 0;
}
