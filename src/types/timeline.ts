export type TimelineEventType = 'birth' | 'marriage' | 'death' | 'anniversary';

export type TimelineEventSource = 'auto';

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  source: TimelineEventSource;
  title: string;
  year: number | null;
  month?: number | null;
  day?: number | null;
  description?: string;
  relativeIds: string[];
  relativeNames: string[];
  createdAt: string;
};

export type TimelineEventTypeOption = {
  id: TimelineEventType;
  label: string;
  icon: string;
};

export const TIMELINE_EVENT_TYPES: TimelineEventTypeOption[] = [
  { id: 'birth', label: 'Туған күн', icon: '🎂' },
  { id: 'marriage', label: 'Неке', icon: '💍' },
  { id: 'death', label: 'Қайтыс болу', icon: '🕊️' },
  { id: 'anniversary', label: 'Мереке', icon: '🌿' },
];

export type TimelineYearSection = {
  year: number | null;
  label: string;
  events: TimelineEvent[];
};

export function getTimelineEventTypeOption(type: TimelineEventType): TimelineEventTypeOption {
  return TIMELINE_EVENT_TYPES.find((option) => option.id === type) ?? TIMELINE_EVENT_TYPES[0];
}

export function isTimelineEventType(value: string): value is TimelineEventType {
  return TIMELINE_EVENT_TYPES.some((option) => option.id === value);
}
