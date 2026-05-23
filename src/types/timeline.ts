export type TimelineEventType =
  | 'birth'
  | 'marriage'
  | 'death'
  | 'migration'
  | 'home_built'
  | 'education'
  | 'work'
  | 'custom';

export type TimelineEventSource = 'auto' | 'manual';

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  source: TimelineEventSource;
  title: string;
  titleRu: string;
  year: number | null;
  month?: number | null;
  day?: number | null;
  description?: string;
  relativeIds: string[];
  relativeNames: string[];
  createdAt: string;
};

export type ManualTimelineEvent = TimelineEvent & {
  source: 'manual';
};

export type CreateTimelineEventInput = {
  type: TimelineEventType;
  title: string;
  year: string;
  month?: string;
  day?: string;
  description: string;
  relativeIds: string[];
  relativeNames: string[];
};

export type TimelineEventTypeOption = {
  id: TimelineEventType;
  labelKz: string;
  labelRu: string;
  icon: string;
};

export const TIMELINE_EVENT_TYPES: TimelineEventTypeOption[] = [
  { id: 'birth', labelKz: 'Туған күн', labelRu: 'Рождение', icon: '🎂' },
  { id: 'marriage', labelKz: 'Үйлену', labelRu: 'Свадьба', icon: '💍' },
  { id: 'death', labelKz: 'Қайтыс болу', labelRu: 'Уход из жизни', icon: '🕊️' },
  { id: 'migration', labelKz: 'Көшу', labelRu: 'Переезд', icon: '🚚' },
  { id: 'home_built', labelKz: 'Үй салу', labelRu: 'Постройка дома', icon: '🏠' },
  { id: 'education', labelKz: 'Оқу', labelRu: 'Образование', icon: '🎓' },
  { id: 'work', labelKz: 'Жұмыс', labelRu: 'Работа', icon: '💼' },
  { id: 'custom', labelKz: 'Естелік', labelRu: 'Воспоминание', icon: '🌿' },
];

export type TimelineYearSection = {
  year: number | null;
  label: string;
  events: TimelineEvent[];
};

export function getTimelineEventTypeOption(type: TimelineEventType): TimelineEventTypeOption {
  return TIMELINE_EVENT_TYPES.find((option) => option.id === type) ?? TIMELINE_EVENT_TYPES[7];
}
