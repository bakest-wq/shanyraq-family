import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_ELDER_MODE_SETTINGS,
  ElderModeSettings,
} from '@/types/elder-mode';

const STORAGE_KEY = '@shanyraq/elder-mode';

function normalizeSettings(raw: unknown): ElderModeSettings {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_ELDER_MODE_SETTINGS;
  }

  return {
    enabled: Boolean((raw as ElderModeSettings).enabled),
  };
}

export const elderModeService = {
  async get(): Promise<ElderModeSettings> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return DEFAULT_ELDER_MODE_SETTINGS;
      }

      return normalizeSettings(JSON.parse(raw));
    } catch {
      return DEFAULT_ELDER_MODE_SETTINGS;
    }
  },

  async save(settings: ElderModeSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },
};
