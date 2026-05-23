import { Relative } from '@/types/relative';
import {
  ManualTimelineEvent,
  TimelineEvent,
  TimelineYearSection,
} from '@/types/timeline';
import { hasBirthdayYear, resolveBirthdayParts } from '@/utils/birthday-parts';
import { getRelativeDisplayName } from '@/utils/relative-names';

const UNKNOWN_YEAR_LABEL = 'Жыл белгісіз · Год не указан';

function eventSortKey(event: TimelineEvent): number {
  const year = event.year ?? 0;
  const month = event.month ?? 0;
  const day = event.day ?? 0;
  return year * 10000 + month * 100 + day;
}

function compareEvents(a: TimelineEvent, b: TimelineEvent): number {
  const byDate = eventSortKey(b) - eventSortKey(a);
  if (byDate !== 0) {
    return byDate;
  }

  return b.createdAt.localeCompare(a.createdAt);
}

function buildBirthEvents(relatives: Relative[]): TimelineEvent[] {
  return relatives.flatMap((relative) => {
    if (!hasBirthdayYear(relative)) {
      return [];
    }

    const parts = resolveBirthdayParts(relative);
    const name = getRelativeDisplayName(relative);

    return [
      {
        id: `auto:birth:${relative.id}`,
        type: 'birth',
        source: 'auto',
        title: `${name} дүниеге келді`,
        titleRu: `Рождение: ${name}`,
        year: parts?.year ?? relative.birthdayYear ?? null,
        month: parts?.month ?? relative.birthdayMonth ?? null,
        day: parts?.day ?? relative.birthdayDay ?? null,
        description: `${name} · ${relative.relationship}`,
        relativeIds: [relative.id],
        relativeNames: [name],
        createdAt: relative.createdAt ?? '',
      },
    ];
  });
}

function buildDeathEvents(relatives: Relative[]): TimelineEvent[] {
  return relatives.flatMap((relative) => {
    if (!relative.isDeceased || !relative.deathYear) {
      return [];
    }

    const name = getRelativeDisplayName(relative);

    return [
      {
        id: `auto:death:${relative.id}`,
        type: 'death',
        source: 'auto',
        title: `${name} дүниеден өтті`,
        titleRu: `Уход из жизни: ${name}`,
        year: relative.deathYear,
        description: relative.duaText?.trim() || undefined,
        relativeIds: [relative.id],
        relativeNames: [name],
        createdAt: relative.createdAt ?? '',
      },
    ];
  });
}

function buildMarriageEvents(relatives: Relative[]): TimelineEvent[] {
  const seenPairs = new Set<string>();

  return relatives.flatMap((relative) => {
    if (!relative.spouseId) {
      return [];
    }

    const spouse = relatives.find((candidate) => candidate.id === relative.spouseId);
    if (!spouse) {
      return [];
    }

    const pairKey = [relative.id, spouse.id].sort().join(':');
    if (seenPairs.has(pairKey)) {
      return [];
    }

    seenPairs.add(pairKey);

    const nameA = getRelativeDisplayName(relative);
    const nameB = getRelativeDisplayName(spouse);

    return [
      {
        id: `auto:marriage:${pairKey}`,
        type: 'marriage',
        source: 'auto',
        title: `${nameA} пен ${nameB} отбасы құрды`,
        titleRu: `Свадьба: ${nameA} и ${nameB}`,
        year: null,
        description: 'Жұбайы байланысы бойынша · По связи супругов',
        relativeIds: [relative.id, spouse.id],
        relativeNames: [nameA, nameB],
        createdAt: relative.createdAt ?? spouse.createdAt ?? '',
      },
    ];
  });
}

export function buildAutoTimelineEvents(relatives: Relative[]): TimelineEvent[] {
  return [
    ...buildBirthEvents(relatives),
    ...buildDeathEvents(relatives),
    ...buildMarriageEvents(relatives),
  ];
}

export function mergeTimelineEvents(
  relatives: Relative[],
  manualEvents: ManualTimelineEvent[],
): TimelineEvent[] {
  const autoEvents = buildAutoTimelineEvents(relatives);
  const merged = [...manualEvents, ...autoEvents];
  return merged.sort(compareEvents);
}

export function groupTimelineEventsByYear(events: TimelineEvent[]): TimelineYearSection[] {
  const buckets = new Map<number | null, TimelineEvent[]>();

  for (const event of events) {
    const key = event.year ?? null;
    const existing = buckets.get(key) ?? [];
    existing.push(event);
    buckets.set(key, existing);
  }

  const sections: TimelineYearSection[] = [];

  const knownYears = [...buckets.keys()]
    .filter((year): year is number => year !== null)
    .sort((a, b) => b - a);

  for (const year of knownYears) {
    const yearEvents = buckets.get(year) ?? [];
    sections.push({
      year,
      label: String(year),
      events: yearEvents.sort(compareEvents),
    });
  }

  const unknownEvents = buckets.get(null);
  if (unknownEvents?.length) {
    sections.push({
      year: null,
      label: UNKNOWN_YEAR_LABEL,
      events: unknownEvents.sort(compareEvents),
    });
  }

  return sections;
}
