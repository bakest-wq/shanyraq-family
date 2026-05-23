import { useNotificationsContext } from '@/providers/NotificationsProvider';
import { BirthdayReminderSettings } from '@/types/reminders';

export function useNotificationSettings() {
  return useNotificationsContext();
}

/** Backward-compatible alias for calendar screen birthday toggles. */
export function useReminderSettings() {
  const { settings, loading, updateSetting, reloadSettings } = useNotificationsContext();

  return {
    settings: settings
      ? {
          onBirthday: settings.onBirthday,
          oneDayBefore: settings.oneDayBefore,
          threeDaysBefore: settings.threeDaysBefore,
          sevenDaysBefore: settings.sevenDaysBefore,
        }
      : null,
    loading,
    updateSetting: (key: keyof BirthdayReminderSettings, value: boolean) =>
      void updateSetting(key, value),
    reload: reloadSettings,
  };
}
