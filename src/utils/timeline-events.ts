import { TIMELINE_COPY, TIMELINE_MILESTONES } from '@/constants/timeline-content';
import { Relative } from '@/types/relative';
import { TimelineEvent, TimelineYearSection } from '@/types/timeline';
import { resolveBirthdayParts } from '@/utils/birthday-parts';
import { getChildren } from '@/utils/shezhire-lineage';
import { getRelativeDisplayName } from '@/utils/relative-names';

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
    const parts = resolveBirthdayParts(relative);
    const birthYear = parts?.year ?? (relative.birthdayYearUnknown ? null : relative.birthdayYear ?? null);

    if (!birthYear) {
      return [];
    }

    const name = getRelativeDisplayName(relative);

    return [
      {
        id: `auto:birth:${relative.id}`,
        type: 'birth',
        source: 'auto',
        title: `${name} дүниеге келді`,
        year: birthYear,
        month: parts?.month ?? relative.birthdayMonth ?? null,
        day: parts?.day ?? relative.birthdayDay ?? null,
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
    const marriageYear = estimateMarriageYear(relative, spouse, relatives);

    return [
      {
        id: `auto:marriage:${pairKey}`,
        type: 'marriage',
        source: 'auto',
        title: `${nameA} пен ${nameB} отбасы құрды`,
        year: marriageYear,
        relativeIds: [relative.id, spouse.id],
        relativeNames: [nameA, nameB],
        createdAt: relative.createdAt ?? spouse.createdAt ?? '',
      },
    ];
  });
}

function estimateMarriageYear(
  spouseA: Relative,
  spouseB: Relative,
  relatives: Relative[],
): number | null {
  const childYears = [spouseA, spouseB]
    .flatMap((parent) => getChildren(parent, relatives, { includeDeceased: true }))
    .map((child) => resolveBirthdayParts(child)?.year ?? child.birthdayYear ?? null)
    .filter((year): year is number => year !== null);

  if (childYears.length === 0) {
    return null;
  }

  const earliestChildYear = Math.min(...childYears);
  const estimatedYear = earliestChildYear - 1;

  if (estimatedYear < 1900 || estimatedYear > new Date().getFullYear()) {
    return null;
  }

  return estimatedYear;
}

function buildAnniversaryEvents(
  relatives: Relative[],
  referenceDate = new Date(),
): TimelineEvent[] {
  const currentYear = referenceDate.getFullYear();
  const events: TimelineEvent[] = [];
  const seenPairs = new Set<string>();

  for (const relative of relatives) {
    const name = getRelativeDisplayName(relative);
    const parts = resolveBirthdayParts(relative);
    const birthYear =
      parts?.year ?? (relative.birthdayYearUnknown ? null : relative.birthdayYear ?? null);

    if (birthYear) {
      for (const age of TIMELINE_MILESTONES.jubileeAges) {
        const eventYear = birthYear + age;
        if (eventYear > currentYear) {
          continue;
        }

        if (relative.deathYear && eventYear > relative.deathYear) {
          continue;
        }

        events.push({
          id: `auto:anniversary:jubilee:${relative.id}:${age}`,
          type: 'anniversary',
          source: 'auto',
          title: `${name} — ${age} жас`,
          year: eventYear,
          month: parts?.month ?? relative.birthdayMonth ?? null,
          day: parts?.day ?? relative.birthdayDay ?? null,
          relativeIds: [relative.id],
          relativeNames: [name],
          createdAt: relative.createdAt ?? '',
        });
      }
    }

    if (relative.isDeceased && relative.deathYear) {
      for (const yearsSince of TIMELINE_MILESTONES.memorialYears) {
        const eventYear = relative.deathYear + yearsSince;
        if (eventYear > currentYear) {
          continue;
        }

        events.push({
          id: `auto:anniversary:memorial:${relative.id}:${yearsSince}`,
          type: 'anniversary',
          source: 'auto',
          title: `${name} — ${yearsSince} жыл еске алу`,
          year: eventYear,
          description: relative.duaText?.trim() || undefined,
          relativeIds: [relative.id],
          relativeNames: [name],
          createdAt: relative.createdAt ?? '',
        });
      }
    }
  }

  for (const relative of relatives) {
    if (!relative.spouseId) {
      continue;
    }

    const spouse = relatives.find((candidate) => candidate.id === relative.spouseId);
    if (!spouse) {
      continue;
    }

    const pairKey = [relative.id, spouse.id].sort().join(':');
    if (seenPairs.has(pairKey)) {
      continue;
    }

    const marriageYear = estimateMarriageYear(relative, spouse, relatives);
    if (!marriageYear) {
      continue;
    }

    seenPairs.add(pairKey);

    const nameA = getRelativeDisplayName(relative);
    const nameB = getRelativeDisplayName(spouse);

    for (const yearsSince of TIMELINE_MILESTONES.weddingAnniversaryYears) {
      const eventYear = marriageYear + yearsSince;
      if (eventYear > currentYear) {
        continue;
      }

      events.push({
        id: `auto:anniversary:wedding:${pairKey}:${yearsSince}`,
        type: 'anniversary',
        source: 'auto',
        title: `${nameA} пен ${nameB} — ${yearsSince} жыл неке`,
        year: eventYear,
        relativeIds: [relative.id, spouse.id],
        relativeNames: [nameA, nameB],
        createdAt: relative.createdAt ?? spouse.createdAt ?? '',
      });
    }
  }

  return events;
}

export function buildAutoTimelineEvents(
  relatives: Relative[],
  referenceDate = new Date(),
): TimelineEvent[] {
  return [
    ...buildBirthEvents(relatives),
    ...buildMarriageEvents(relatives),
    ...buildDeathEvents(relatives),
    ...buildAnniversaryEvents(relatives, referenceDate),
  ];
}

export function dedupeTimelineEvents(events: TimelineEvent[]): TimelineEvent[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();

  return events.filter((event) => {
    if (seenIds.has(event.id)) {
      return false;
    }

    const dedupeKey = [
      event.type,
      event.year ?? 'unknown',
      event.month ?? 'unknown',
      event.day ?? 'unknown',
      [...event.relativeIds].sort().join(':'),
      event.title,
    ].join('|');

    if (seenKeys.has(dedupeKey)) {
      return false;
    }

    seenIds.add(event.id);
    seenKeys.add(dedupeKey);
    return true;
  });
}

export function mergeTimelineEvents(
  relatives: Relative[],
  referenceDate = new Date(),
): TimelineEvent[] {
  const events = buildAutoTimelineEvents(relatives, referenceDate);
  return dedupeTimelineEvents(events).sort(compareEvents);
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
      label: TIMELINE_COPY.unknownYear,
      events: unknownEvents.sort(compareEvents),
    });
  }

  return sections;
}

export function formatTimelineEventDate(event: TimelineEvent): string | null {
  if (event.day && event.month) {
    return `${String(event.day).padStart(2, '0')}.${String(event.month).padStart(2, '0')}`;
  }

  if (event.month) {
    return `${event.month}-ай`;
  }

  return null;
}
