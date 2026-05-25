import AsyncStorage from '@react-native-async-storage/async-storage';

import { relativesService } from '@/services/relatives.service';
import { invalidateKinshipCache } from '@/services/kinship/kinship-cache.service';
import { buildKinshipStructuralFingerprint } from '@/services/kinship/family-structural-fingerprint';
import type { EditActor } from '@/types/edit-history';
import type { Relative } from '@/types/relative';
import {
  GRAPH_VERSION_MAX,
  type GraphVersionEntry,
  type GraphVersionKind,
  type GraphVersionSnapshot,
  type RestoreGraphVersionResult,
} from '@/types/graph-version';
import { applyGraphSnapshot } from '@/utils/graph-restore';
import { canRestoreGraphVersion, summarizeGraphChange } from '@/utils/graph-version-change';

export { canRestoreGraphVersion } from '@/utils/graph-version-change';

function listStorageKey(familyId: string): string {
  return `@shanyraq/graph-versions:${familyId}`;
}

function snapshotStorageKey(familyId: string, versionId: string): string {
  return `@shanyraq/graph-version-snapshot:${familyId}:${versionId}`;
}

function createVersionId(): string {
  return `graph-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readEntries(familyId: string): Promise<GraphVersionEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(listStorageKey(familyId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as GraphVersionEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeEntries(familyId: string, entries: GraphVersionEntry[]): Promise<void> {
  await AsyncStorage.setItem(listStorageKey(familyId), JSON.stringify(entries.slice(0, GRAPH_VERSION_MAX)));
}

async function saveSnapshot(snapshot: GraphVersionSnapshot): Promise<void> {
  await AsyncStorage.setItem(
    snapshotStorageKey(snapshot.familyId, snapshot.versionId),
    JSON.stringify(snapshot),
  );
}

async function readSnapshot(
  familyId: string,
  versionId: string,
): Promise<GraphVersionSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(snapshotStorageKey(familyId, versionId));
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as GraphVersionSnapshot;
  } catch {
    return null;
  }
}

async function deleteSnapshot(familyId: string, versionId: string): Promise<void> {
  await AsyncStorage.removeItem(snapshotStorageKey(familyId, versionId));
}

async function trimSnapshots(familyId: string, keptIds: Set<string>): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const prefix = `@shanyraq/graph-version-snapshot:${familyId}:`;

  for (const key of keys) {
    if (!key.startsWith(prefix)) {
      continue;
    }

    const versionId = key.slice(prefix.length);
    if (!keptIds.has(versionId)) {
      await AsyncStorage.removeItem(key);
    }
  }
}

type RecordInput = {
  familyId: string;
  actor: EditActor;
  beforeRelatives: Relative[];
  afterRelatives: Relative[];
  summary?: string;
  kind?: GraphVersionKind;
  editEventId?: string;
  restoredFromVersionId?: string;
};

export const graphVersionService = {
  async list(
    familyId: string,
    filter?: { limit?: number; includeSafety?: boolean },
  ): Promise<GraphVersionEntry[]> {
    const entries = await readEntries(familyId);
    const visible = filter?.includeSafety
      ? entries
      : entries.filter((entry) => entry.kind !== 'safety');

    const limit = filter?.limit ?? visible.length;
    return visible.slice(0, limit);
  },

  async getById(familyId: string, versionId: string): Promise<GraphVersionEntry | null> {
    const entries = await readEntries(familyId);
    return entries.find((entry) => entry.id === versionId) ?? null;
  },

  /** Save a restorable snapshot when the structural graph changed. */
  async recordIfStructuralChange(input: RecordInput): Promise<GraphVersionEntry | null> {
    const beforeFingerprint = buildKinshipStructuralFingerprint(input.beforeRelatives);
    const afterFingerprint = buildKinshipStructuralFingerprint(input.afterRelatives);

    if (beforeFingerprint === afterFingerprint) {
      return null;
    }

    const versionId = createVersionId();
    const capturedAt = new Date().toISOString();
    const kind = input.kind ?? 'change';
    const summary =
      input.summary?.trim() ||
      summarizeGraphChange(input.beforeRelatives, input.afterRelatives);

    const snapshot: GraphVersionSnapshot = {
      versionId,
      familyId: input.familyId,
      capturedAt,
      relatives: input.beforeRelatives,
      structuralFingerprint: beforeFingerprint,
    };

    const entry: GraphVersionEntry = {
      id: versionId,
      familyId: input.familyId,
      at: capturedAt,
      actor: input.actor,
      kind,
      summary,
      relativeCount: input.beforeRelatives.length,
      structuralFingerprint: beforeFingerprint,
      editEventId: input.editEventId,
      restoredFromVersionId: input.restoredFromVersionId,
    };

    await saveSnapshot(snapshot);

    const existing = await readEntries(input.familyId);
    const next = [entry, ...existing].slice(0, GRAPH_VERSION_MAX);
    await writeEntries(input.familyId, next);

    const keptIds = new Set(next.map((item) => item.id));
    await trimSnapshots(input.familyId, keptIds);

    return entry;
  },

  async captureSafetySnapshot(
    familyId: string,
    actor: EditActor,
    relatives: Relative[],
    summary: string,
  ): Promise<GraphVersionEntry> {
    const versionId = createVersionId();
    const capturedAt = new Date().toISOString();
    const fingerprint = buildKinshipStructuralFingerprint(relatives);

    const snapshot: GraphVersionSnapshot = {
      versionId,
      familyId,
      capturedAt,
      relatives,
      structuralFingerprint: fingerprint,
    };

    const entry: GraphVersionEntry = {
      id: versionId,
      familyId,
      at: capturedAt,
      actor,
      kind: 'safety',
      summary,
      relativeCount: relatives.length,
      structuralFingerprint: fingerprint,
    };

    await saveSnapshot(snapshot);

    const existing = await readEntries(familyId);
    const next = [entry, ...existing].slice(0, GRAPH_VERSION_MAX);
    await writeEntries(familyId, next);

    const keptIds = new Set(next.map((item) => item.id));
    await trimSnapshots(familyId, keptIds);

    return entry;
  },

  async restoreVersion(
    familyId: string,
    versionId: string,
    actor: EditActor,
  ): Promise<RestoreGraphVersionResult> {
    const entry = await this.getById(familyId, versionId);
    if (!entry || !canRestoreGraphVersion(entry.kind)) {
      throw new Error('Бұл нұсқаны қалпына келтіру мүмкін емес.');
    }

    const snapshot = await readSnapshot(familyId, versionId);
    if (!snapshot || snapshot.relatives.length === 0) {
      throw new Error('Нұсқа табылмады.');
    }

    const currentRelatives = await relativesService.getAll(familyId);
    const safety = await this.captureSafetySnapshot(
      familyId,
      actor,
      currentRelatives,
      'Қалпына келтіруден бұрын сақталды',
    );

    const relativesRestored = await applyGraphSnapshot(familyId, snapshot.relatives);
    invalidateKinshipCache();

    const restoreLogId = createVersionId();
    const restoreEntry: GraphVersionEntry = {
      id: restoreLogId,
      familyId,
      at: new Date().toISOString(),
      actor,
      kind: 'restore',
      summary: `Қалпына келтірілді: ${entry.summary}`,
      relativeCount: snapshot.relatives.length,
      structuralFingerprint: snapshot.structuralFingerprint,
      restoredFromVersionId: versionId,
    };

    const existing = await readEntries(familyId);
    await writeEntries(familyId, [restoreEntry, ...existing]);

    return {
      versionId,
      relativesRestored,
      safetyVersionId: safety.id,
    };
  },

  async clearFamily(familyId: string): Promise<void> {
    const entries = await readEntries(familyId);
    await Promise.all(entries.map((entry) => deleteSnapshot(familyId, entry.id)));
    await AsyncStorage.removeItem(listStorageKey(familyId));
  },
};
