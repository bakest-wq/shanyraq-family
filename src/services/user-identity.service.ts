import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SaveUserIdentityInput, UserIdentityProfile } from '@/types/user-identity';

const storageKey = (familyId: string) => `@shanyraq/user-identity:${familyId}`;

function normalizeProfile(raw: unknown, familyId: string): UserIdentityProfile | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const profile = raw as Partial<UserIdentityProfile>;
  const relativeId = profile.relativeId?.trim();
  const userName = profile.userName?.trim();

  if (!relativeId || !userName || profile.familyId !== familyId) {
    return null;
  }

  return {
    userName,
    relativeId,
    familyId,
  };
}

export const userIdentityService = {
  async getProfile(familyId: string): Promise<UserIdentityProfile | null> {
    if (!familyId) {
      return null;
    }

    try {
      const raw = await AsyncStorage.getItem(storageKey(familyId));
      if (!raw) {
        return null;
      }

      return normalizeProfile(JSON.parse(raw), familyId);
    } catch {
      return null;
    }
  },

  async saveProfile(input: SaveUserIdentityInput): Promise<UserIdentityProfile> {
    const profile: UserIdentityProfile = {
      familyId: input.familyId,
      relativeId: input.relativeId,
      userName: input.userName?.trim() || 'Мен',
    };

    await AsyncStorage.setItem(storageKey(input.familyId), JSON.stringify(profile));
    return profile;
  },

  async clearProfile(familyId: string): Promise<void> {
    if (!familyId) {
      return;
    }

    await AsyncStorage.removeItem(storageKey(familyId));
  },
};
