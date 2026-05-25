/** In-memory session tracking for relative view/open frequency — no database. */

function buildSessionKey(rootPersonId: string, relativeId: string): string {
  return `${rootPersonId}:${relativeId}`;
}

const lastViewedAt = new Map<string, number>();
const openCounts = new Map<string, number>();

export function recordRelativeInteraction(rootPersonId: string, relativeId: string): void {
  if (!rootPersonId || !relativeId || rootPersonId === relativeId) {
    return;
  }

  const key = buildSessionKey(rootPersonId, relativeId);
  lastViewedAt.set(key, Date.now());
  openCounts.set(key, (openCounts.get(key) ?? 0) + 1);
}

export function getRelativeLastViewedAt(
  rootPersonId: string,
  relativeId: string,
): number | null {
  if (!rootPersonId || !relativeId) {
    return null;
  }

  return lastViewedAt.get(buildSessionKey(rootPersonId, relativeId)) ?? null;
}

export function getRelativeOpenCount(rootPersonId: string, relativeId: string): number {
  if (!rootPersonId || !relativeId) {
    return 0;
  }

  return openCounts.get(buildSessionKey(rootPersonId, relativeId)) ?? 0;
}

export function clearRelativeInteractionSession(): void {
  lastViewedAt.clear();
  openCounts.clear();
}
