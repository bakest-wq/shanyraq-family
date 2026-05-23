import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationSettings,
} from '@/types/reminders';

const STORAGE_KEY = '@shanyraq/birthday-reminder-settings';

export const notificationSettingsService = {
  async get(): Promise<NotificationSettings> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return DEFAULT_NOTIFICATION_SETTINGS;
      }

      const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
      return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...parsed,
      };
    } catch {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  },

  async save(settings: NotificationSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },
};

/** @deprecated Use notificationSettingsService */
export const reminderSettingsService = notificationSettingsService;
