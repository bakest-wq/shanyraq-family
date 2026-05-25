import type { EditEvent } from '@/types/edit-history';

export function canRestoreEditEvent(event: EditEvent): boolean {
  if (event.action === 'restore') {
    return false;
  }

  if (event.entityType === 'relative') {
    return event.action === 'update' && Boolean(event.before);
  }

  if (event.entityType === 'memory') {
    if (event.action === 'delete' && event.before) {
      return true;
    }

    if (event.action === 'create') {
      return true;
    }
  }

  return false;
}
