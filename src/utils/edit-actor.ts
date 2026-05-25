import type { FamilySession } from '@/types/family';
import type { EditActor } from '@/types/edit-history';

export function resolveEditActor(session: FamilySession | null | undefined): EditActor {
  const displayName = session?.ownerName?.trim() || 'Отбасы мүшесі';

  return {
    memberId: session?.memberId,
    displayName,
    relativeId: session?.relativeId ?? null,
  };
}
