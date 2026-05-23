import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { NotificationSettings } from '@/types/reminders';
import { Relative } from '@/types/relative';
import {
  buildBirthdayNotificationBody,
  buildBirthdayNotificationTitle,
  buildMemorialNotificationBody,
  buildMemorialNotificationTitle,
  buildTestNotificationBody,
} from '@/utils/notification-messages';
import {
  BIRTHDAY_OFFSETS,
  getMemorialAnniversaryParts,
  getYearlyReminderPartsForRelative,
} from '@/utils/notification-scheduling';
import { filterDeceasedRelatives, filterLivingRelatives } from '@/utils/relative.mapper';
import { hasBirthdayDayMonth } from '@/utils/birthday-parts';

const ANDROID_CHANNEL_ID = 'shanyraq-family-reminders';

type NotificationContent = {
  title: string;
  body: string;
  sound?: string;
  data?: Record<string, string>;
};

async function loadNotifications() {
  return import('expo-notifications');
}

type NotificationsModule = Awaited<ReturnType<typeof loadNotifications>>;

function buildContent(
  title: string,
  body: string,
  settings: NotificationSettings,
  data?: Record<string, string>,
): NotificationContent {
  return {
    title,
    body,
    sound: settings.soundEnabled ? 'default' : undefined,
    data,
  };
}

async function setNativeNotificationHandler(Notifications: NotificationsModule): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export function configureNotificationHandler(): void {
  void (async () => {
    const Notifications = await loadNotifications();
    await setNativeNotificationHandler(Notifications);
  })();
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  const Notifications = await loadNotifications();
  await setNativeNotificationHandler(Notifications);

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  return status === 'granted';
}

async function ensureAndroidChannel(
  Notifications: NotificationsModule,
  soundEnabled: boolean,
): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Shanyraq Family',
    description: 'Туған күн және еске алу eskertuleri',
    importance: Notifications.AndroidImportance.HIGH,
    sound: soundEnabled ? 'default' : undefined,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  const Notifications = await loadNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function syncNotificationSchedule(
  relatives: Relative[],
  settings: NotificationSettings,
): Promise<void> {
  if (!Device.isDevice) {
    return;
  }

  const Notifications = await loadNotifications();

  await cancelAllScheduledNotifications();

  if (!settings.enabled) {
    return;
  }

  const granted = await requestNotificationPermissions();
  if (!granted) {
    return;
  }

  await ensureAndroidChannel(Notifications, settings.soundEnabled);

  const living = filterLivingRelatives(relatives);
  const deceased = filterDeceasedRelatives(relatives);

  for (const relative of living) {
    if (!hasBirthdayDayMonth(relative)) {
      continue;
    }

    for (const offset of BIRTHDAY_OFFSETS) {
      if (!settings[offset.key]) {
        continue;
      }

      const reminderParts = getYearlyReminderPartsForRelative(relative, offset.daysBefore);
      if (!reminderParts) {
        continue;
      }

      const { month, day } = reminderParts;

      await Notifications.scheduleNotificationAsync({
        content: buildContent(
          buildBirthdayNotificationTitle(),
          buildBirthdayNotificationBody(relative, offset.daysBefore),
          settings,
          { type: 'birthday', relativeId: relative.id, offset: String(offset.daysBefore) },
        ),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.YEARLY,
          month,
          day,
          hour: settings.reminderHour,
          minute: settings.reminderMinute,
          channelId: ANDROID_CHANNEL_ID,
        },
      });
    }
  }

  if (settings.memorialEnabled) {
    for (const relative of deceased) {
      const { month, day } = getMemorialAnniversaryParts(relative);

      await Notifications.scheduleNotificationAsync({
        content: buildContent(
          buildMemorialNotificationTitle(),
          buildMemorialNotificationBody(relative),
          settings,
          { type: 'memorial', relativeId: relative.id },
        ),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.YEARLY,
          month,
          day,
          hour: settings.reminderHour,
          minute: settings.reminderMinute,
          channelId: ANDROID_CHANNEL_ID,
        },
      });
    }
  }
}

export async function sendTestNotification(settings: NotificationSettings): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  const Notifications = await loadNotifications();

  const granted = await requestNotificationPermissions();
  if (!granted) {
    return false;
  }

  await ensureAndroidChannel(Notifications, settings.soundEnabled);

  await Notifications.scheduleNotificationAsync({
    content: buildContent(
      'Shanyraq Family · Тест',
      buildTestNotificationBody(),
      settings,
      { type: 'test' },
    ),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      channelId: ANDROID_CHANNEL_ID,
    },
  });

  return true;
}
