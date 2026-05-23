import { NotificationSettings } from '@/types/reminders';
import { Relative } from '@/types/relative';
import { buildTestNotificationBody } from '@/utils/notification-messages';

export function configureNotificationHandler(): void {
  // Web: notifications are not supported.
}

export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  // Web: no-op.
}

export async function syncNotificationSchedule(
  _relatives: Relative[],
  _settings: NotificationSettings,
): Promise<void> {
  // Web: no-op.
}

export async function sendTestNotification(_settings: NotificationSettings): Promise<boolean> {
  console.log('[Shanyraq Family] Test notification:', buildTestNotificationBody());
  return false;
}
