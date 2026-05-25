import type { FamilyMemory } from '@/types/archive';
import type { Relative } from '@/types/relative';
import type { TimelineEvent } from '@/types/timeline';
import { BIRTHDAY_UPCOMING_DAYS } from '@/constants/birthday-content';
import {
  homeReminderBirthdayToday,
  homeReminderMemorial,
  HOME_COPY,
  homeSummaryDeceased,
  homeSummaryMemories,
  homeSummaryRelatives,
} from '@/constants/home-content';
import { kk, FAMILY_LANGUAGE } from '@/content/family-language';
import {
  buildBirthdayEntries,
  type BirthdayEntry,
} from '@/utils/birthday-calendar';
import { findOrphanRelatives } from '@/services/graph-integrity.service';
import { formatBirthdayCountdownKz } from '@/utils/dates';
import { getMemoryTypeOption } from '@/types/archive';
import { getRelativeDisplayName } from '@/utils/relative-names';

export type HomeMemoryHighlight = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  photoUri?: string;
};

export type HomeFamilySummary = {
  line: string;
  detail: string;
};

export type HomeReminder = {
  id: string;
  icon: string;
  message: string;
  route: '/calendar' | '/who-am-i' | '/(tabs)/shezhire' | '/add-memory' | '/(tabs)/memory' | '/backup-restore';
};

export function getHomeBirthdayHighlights(
  relatives: Relative[],
  options?: { limit?: number; referenceDate?: Date },
): BirthdayEntry[] {
  const limit = options?.limit ?? 3;
  const entries = buildBirthdayEntries(relatives, {
    includeDeceased: false,
    referenceDate: options?.referenceDate,
  });

  return entries
    .filter((entry) => entry.daysUntil >= 0 && entry.daysUntil <= BIRTHDAY_UPCOMING_DAYS)
    .slice(0, limit);
}

export function getBirthdaysToday(entries: BirthdayEntry[]): BirthdayEntry[] {
  return entries.filter((entry) => entry.daysUntil === 0);
}

export function getIncompleteLinkRelatives(relatives: Relative[]): Relative[] {
  return findOrphanRelatives(relatives).filter((relative) => !relative.isDeceased);
}

export function formatHomeBirthdayLine(entry: BirthdayEntry): string {
  if (entry.daysUntil === 0) {
    return HOME_COPY.birthdaysToday;
  }

  return formatBirthdayCountdownKz(entry.daysUntil);
}

export function getHomeRecentMemories(
  memories: FamilyMemory[],
  limit = 3,
): HomeMemoryHighlight[] {
  return [...memories]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((memory) => {
      const type = getMemoryTypeOption(memory.category);

      return {
        id: memory.id,
        title: memory.title,
        subtitle: memory.relativeName || type.label,
        icon: type.icon,
        photoUri: memory.photoUri,
      };
    });
}

export function getHomeFamilySummary(
  relatives: Relative[],
  memories: FamilyMemory[],
  deceasedCount: number,
): HomeFamilySummary {
  const livingCount = relatives.filter((relative) => !relative.isDeceased).length;

  if (relatives.length === 0) {
    return {
      line: HOME_COPY.summaryEmpty,
      detail: kk(FAMILY_LANGUAGE.empty.relativesHint),
    };
  }

  const parts = [
    homeSummaryRelatives(livingCount),
    homeSummaryMemories(memories.length),
  ];

  if (deceasedCount > 0) {
    parts.push(homeSummaryDeceased(deceasedCount));
  }

  return {
    line: parts.join(' · '),
    detail: HOME_COPY.summaryGrowing,
  };
}

export function getHomeGentleReminders(options: {
  birthdayHighlights: BirthdayEntry[];
  memories: FamilyMemory[];
  deceasedCount: number;
  hasLinkedIdentity: boolean;
  hasBackup?: boolean;
  limit?: number;
}): HomeReminder[] {
  const limit = options.limit ?? 3;
  const reminders: HomeReminder[] = [];

  for (const entry of getBirthdaysToday(options.birthdayHighlights)) {
    reminders.push({
      id: `birthday-today:${entry.relative.id}`,
      icon: '🎂',
      message: homeReminderBirthdayToday(getRelativeDisplayName(entry.relative)),
      route: '/calendar',
    });
  }

  if (!options.hasLinkedIdentity) {
    reminders.push({
      id: 'identity',
      icon: '👤',
      message: kk(FAMILY_LANGUAGE.home.reminderIdentity),
      route: '/who-am-i',
    });
  }

  if (options.memories.length === 0 && options.deceasedCount === 0) {
    reminders.push({
      id: 'first-memory',
      icon: '📖',
      message: kk(FAMILY_LANGUAGE.home.reminderFirstMemory),
      route: '/add-memory',
    });
  }

  if (options.deceasedCount > 0) {
    reminders.push({
      id: 'memorial',
      icon: '🕊️',
      message: homeReminderMemorial(options.deceasedCount),
      route: '/(tabs)/memory',
    });
  }

  if (options.hasBackup === false) {
    reminders.push({
      id: 'backup',
      icon: '🛡️',
      message: kk(FAMILY_LANGUAGE.home.reminderBackup),
      route: '/backup-restore',
    });
  }

  return reminders.slice(0, limit);
}

/** @deprecated Use getHomeRecentMemories instead. */
export type HomeActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  sortKey: number;
  route: '/timeline' | '/family-memories';
};

/** @deprecated Timeline activity moved off the home screen. */
export function getRecentFamilyActivity(
  _timelineEvents: TimelineEvent[],
  memories: FamilyMemory[],
  limit = 4,
): HomeActivityItem[] {
  return getHomeRecentMemories(memories, limit).map((memory, index) => ({
    id: memory.id,
    title: memory.title,
    subtitle: memory.subtitle,
    icon: memory.icon,
    sortKey: index,
    route: '/family-memories',
  }));
}
