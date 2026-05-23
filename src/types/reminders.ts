export type BirthdayReminderSettings = {
  onBirthday: boolean;
  oneDayBefore: boolean;
  threeDaysBefore: boolean;
  sevenDaysBefore: boolean;
};

export type NotificationSettings = BirthdayReminderSettings & {
  enabled: boolean;
  soundEnabled: boolean;
  memorialEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
};

export const DEFAULT_BIRTHDAY_REMINDER_SETTINGS: BirthdayReminderSettings = {
  onBirthday: true,
  oneDayBefore: true,
  threeDaysBefore: true,
  sevenDaysBefore: false,
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  ...DEFAULT_BIRTHDAY_REMINDER_SETTINGS,
  enabled: true,
  soundEnabled: true,
  memorialEnabled: true,
  reminderHour: 9,
  reminderMinute: 0,
};

/** @deprecated Use NotificationSettings */
export type ReminderSettings = BirthdayReminderSettings;

/** @deprecated Use DEFAULT_NOTIFICATION_SETTINGS */
export const DEFAULT_REMINDER_SETTINGS = DEFAULT_BIRTHDAY_REMINDER_SETTINGS;

export type ReminderOption = {
  key: keyof BirthdayReminderSettings;
  label: string;
  sublabel: string;
};

export const REMINDER_OPTIONS: ReminderOption[] = [
  {
    key: 'onBirthday',
    label: 'Напоминать в день рождения',
    sublabel: 'Туған күні',
  },
  {
    key: 'oneDayBefore',
    label: 'За 1 день',
    sublabel: '1 күн бұрын',
  },
  {
    key: 'threeDaysBefore',
    label: 'За 3 дня',
    sublabel: '3 күн бұрын',
  },
  {
    key: 'sevenDaysBefore',
    label: 'За 7 дней',
    sublabel: '7 күн бұрын',
  },
];

export const REMINDER_TIME_OPTIONS = [
  { hour: 8, minute: 0, label: '08:00 · Таңертең' },
  { hour: 9, minute: 0, label: '09:00 · Утро' },
  { hour: 12, minute: 0, label: '12:00 · Обед' },
  { hour: 18, minute: 0, label: '18:00 · Кеш' },
  { hour: 20, minute: 0, label: '20:00 · Кешкі' },
] as const;
