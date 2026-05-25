import AsyncStorage from '@react-native-async-storage/async-storage';

import { archiveService } from '@/services/archive.service';
import { relativesService } from '@/services/relatives.service';
import type {
  EditAction,
  EditActor,
  EditEntityType,
  EditEvent,
  EditSnapshot,
  MemoryEditSnapshot,
  RelativeEditSnapshot,
} from '@/types/edit-history';
import { EDIT_HISTORY_MAX_EVENTS } from '@/types/edit-history';
import {
  snapshotMemory,
  snapshotRelative,
  snapshotToMemory,
  snapshotToRelativeInput,
  summarizeRelativeChanges,
} from '@/utils/edit-history-snapshot';
import { canRestoreEditEvent } from '@/utils/edit-history-restore';

export { canRestoreEditEvent } from '@/utils/edit-history-restore';

function storageKey(familyId: string): string {
  return `@shanyraq/edit-history:${familyId}`;
}

function createEventId(): string {
  return `edit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function actionLabel(action: EditAction): string {
  switch (action) {
    case 'create':
      return 'Қосылды';
    case 'update':
      return 'Өзгертілді';
    case 'delete':
      return 'Жойылды';
    case 'restore':
      return 'Қалпына келтірілді';
  }
}

async function readEvents(familyId: string): Promise<EditEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(familyId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as EditEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeEvents(familyId: string, events: EditEvent[]): Promise<void> {
  const trimmed = events.slice(0, EDIT_HISTORY_MAX_EVENTS);
  await AsyncStorage.setItem(storageKey(familyId), JSON.stringify(trimmed));
}

type AppendInput = {
  familyId: string;
  entityType: EditEntityType;
  entityId: string;
  entityLabel: string;
  action: EditAction;
  actor: EditActor;
  summary: string;
  before?: EditSnapshot;
  after?: EditSnapshot;
  restoredFromEventId?: string;
};

export const editHistoryService = {
  async append(input: AppendInput): Promise<EditEvent> {
    const event: EditEvent = {
      id: createEventId(),
      familyId: input.familyId,
      entityType: input.entityType,
      entityId: input.entityId,
      entityLabel: input.entityLabel,
      action: input.action,
      actor: input.actor,
      at: new Date().toISOString(),
      summary: input.summary,
      before: input.before,
      after: input.after,
      restoredFromEventId: input.restoredFromEventId,
    };

    const existing = await readEvents(input.familyId);
    await writeEvents(input.familyId, [event, ...existing]);
    return event;
  },

  async list(
    familyId: string,
    filter?: { entityId?: string; entityType?: EditEntityType; limit?: number },
  ): Promise<EditEvent[]> {
    const events = await readEvents(familyId);
    const filtered = events.filter((event) => {
      if (filter?.entityId && event.entityId !== filter.entityId) {
        return false;
      }

      if (filter?.entityType && event.entityType !== filter.entityType) {
        return false;
      }

      return true;
    });

    const limit = filter?.limit ?? filtered.length;
    return filtered.slice(0, limit);
  },

  async getById(familyId: string, eventId: string): Promise<EditEvent | null> {
    const events = await readEvents(familyId);
    return events.find((event) => event.id === eventId) ?? null;
  },

  async getLatestForEntity(
    familyId: string,
    entityType: EditEntityType,
    entityId: string,
  ): Promise<EditEvent | null> {
    const events = await this.list(familyId, { entityType, entityId, limit: 1 });
    return events[0] ?? null;
  },

  async logRelativeCreate(
    familyId: string,
    actor: EditActor,
    relative: Parameters<typeof snapshotRelative>[0],
  ): Promise<EditEvent> {
    const after = snapshotRelative(relative);

    return this.append({
      familyId,
      entityType: 'relative',
      entityId: relative.id,
      entityLabel: relative.displayName || relative.fullName,
      action: 'create',
      actor,
      summary: `${relative.displayName || relative.fullName} ${actionLabel('create').toLowerCase()}`,
      after,
    });
  },

  async logRelativeUpdate(
    familyId: string,
    actor: EditActor,
    before: Parameters<typeof snapshotRelative>[0],
    after: Parameters<typeof snapshotRelative>[0],
  ): Promise<EditEvent> {
    const beforeSnapshot = snapshotRelative(before);
    const afterSnapshot = snapshotRelative(after);

    return this.append({
      familyId,
      entityType: 'relative',
      entityId: after.id,
      entityLabel: after.displayName || after.fullName,
      action: 'update',
      actor,
      summary: summarizeRelativeChanges(beforeSnapshot, afterSnapshot),
      before: beforeSnapshot,
      after: afterSnapshot,
    });
  },

  async logRelativeDelete(
    familyId: string,
    actor: EditActor,
    relative: Parameters<typeof snapshotRelative>[0],
  ): Promise<EditEvent> {
    const before = snapshotRelative(relative);

    return this.append({
      familyId,
      entityType: 'relative',
      entityId: relative.id,
      entityLabel: relative.displayName || relative.fullName,
      action: 'delete',
      actor,
      summary: `${relative.displayName || relative.fullName} ${actionLabel('delete').toLowerCase()}`,
      before,
    });
  },

  async logMemoryCreate(
    familyId: string,
    actor: EditActor,
    memory: Parameters<typeof snapshotMemory>[0],
  ): Promise<EditEvent> {
    const after = snapshotMemory(memory);

    return this.append({
      familyId,
      entityType: 'memory',
      entityId: memory.id,
      entityLabel: memory.title,
      action: 'create',
      actor,
      summary: `«${memory.title}» ${actionLabel('create').toLowerCase()}`,
      after,
    });
  },

  async logMemoryDelete(
    familyId: string,
    actor: EditActor,
    memory: Parameters<typeof snapshotMemory>[0],
  ): Promise<EditEvent> {
    const before = snapshotMemory(memory);

    return this.append({
      familyId,
      entityType: 'memory',
      entityId: memory.id,
      entityLabel: memory.title,
      action: 'delete',
      actor,
      summary: `«${memory.title}» ${actionLabel('delete').toLowerCase()}`,
      before,
    });
  },

  async restoreEvent(familyId: string, eventId: string, actor: EditActor): Promise<EditEvent> {
    const source = await this.getById(familyId, eventId);
    if (!source || !canRestoreEditEvent(source)) {
      throw new Error('Бұл өзгерісті қалпына келтіру мүмкін емес.');
    }

    if (source.entityType === 'relative' && source.action === 'update' && source.before) {
      const snapshot = source.before as RelativeEditSnapshot;
      const input = snapshotToRelativeInput(snapshot);
      const updated = await relativesService.update(source.entityId, input, familyId);
      const afterSnapshot = snapshotRelative(updated);

      return this.append({
        familyId,
        entityType: 'relative',
        entityId: source.entityId,
        entityLabel: source.entityLabel,
        action: 'restore',
        actor,
        summary: `«${source.entityLabel}» бұрынғы нұсқасы қалпына келтірілді`,
        before: afterSnapshot,
        after: snapshot,
        restoredFromEventId: source.id,
      });
    }

    if (source.entityType === 'memory') {
      if (source.action === 'create') {
        await archiveService.remove(familyId, source.entityId);

        return this.append({
          familyId,
          entityType: 'memory',
          entityId: source.entityId,
          entityLabel: source.entityLabel,
          action: 'restore',
          actor,
          summary: `«${source.entityLabel}» қосу болдырылмады`,
          before: source.after,
          restoredFromEventId: source.id,
        });
      }

      if (source.action === 'delete' && source.before) {
        const memory = snapshotToMemory(source.before as MemoryEditSnapshot);
        await archiveService.restore(familyId, memory);

        return this.append({
          familyId,
          entityType: 'memory',
          entityId: source.entityId,
          entityLabel: source.entityLabel,
          action: 'restore',
          actor,
          summary: `«${source.entityLabel}» бұрынғы нұсқасы қалпына келтірілді`,
          after: source.before,
          restoredFromEventId: source.id,
        });
      }
    }

    throw new Error('Бұл өзгерісті қалпына келтіру мүмкін емес.');
  },
};
