import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { useRelativesContext } from '@/providers/RelativesProvider';
import { notificationSettingsService } from '@/services/notification-settings.service';
import {
  cancelAllScheduledNotifications,
  requestNotificationPermissions,
  sendTestNotification,
  syncNotificationSchedule,
} from '@/services/notifications.service';
import { NotificationSettings } from '@/types/reminders';

type NotificationsContextValue = {
  settings: NotificationSettings | null;
  loading: boolean;
  permissionGranted: boolean | null;
  updateSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) => Promise<void>;
  updateSettings: (patch: Partial<NotificationSettings>) => Promise<void>;
  reloadSettings: () => Promise<void>;
  sendTest: () => Promise<boolean>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: PropsWithChildren) {
  const { hasFamily, isReady: familyReady } = useFamilyContext();
  const { relatives } = useRelativesContext();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const next = await notificationSettingsService.get();
    setSettings(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSettings();
    void (async () => {
      const granted = await requestNotificationPermissions();
      setPermissionGranted(granted);
    })();
  }, [loadSettings]);

  useEffect(() => {
    if (!familyReady || !hasFamily || !settings) {
      return;
    }

    void syncNotificationSchedule(relatives, settings);
  }, [relatives, settings, familyReady, hasFamily]);

  const persistAndApply = useCallback(
    async (next: NotificationSettings) => {
      setSettings(next);
      await notificationSettingsService.save(next);

      if (familyReady && hasFamily) {
        if (!next.enabled) {
          await cancelAllScheduledNotifications();
        } else {
          await syncNotificationSchedule(relatives, next);
        }
      }
    },
    [familyReady, hasFamily, relatives],
  );

  const updateSetting = useCallback(
    async <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
      if (!settings) {
        return;
      }

      await persistAndApply({ ...settings, [key]: value });
    },
    [persistAndApply, settings],
  );

  const updateSettings = useCallback(
    async (patch: Partial<NotificationSettings>) => {
      if (!settings) {
        return;
      }

      await persistAndApply({ ...settings, ...patch });
    },
    [persistAndApply, settings],
  );

  const sendTest = useCallback(async () => {
    if (!settings) {
      return false;
    }

    return sendTestNotification(settings);
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      loading,
      permissionGranted,
      updateSetting,
      updateSettings,
      reloadSettings: loadSettings,
      sendTest,
    }),
    [settings, loading, permissionGranted, updateSetting, updateSettings, loadSettings, sendTest],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotificationsContext must be used within NotificationsProvider');
  }

  return context;
}
