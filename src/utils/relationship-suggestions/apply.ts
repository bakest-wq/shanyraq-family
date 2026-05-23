import { relativesService } from '@/services/relatives.service';
import type { RelationshipSuggestion } from '@/utils/relationship-suggestions/types';

export async function applyRelationshipSuggestion(
  suggestion: RelationshipSuggestion,
  familyId: string,
): Promise<void> {
  if (suggestion.kind === 'note_shared_parents') {
    return;
  }

  if (suggestion.action.type === 'patch_links_pair') {
    await relativesService.patchRelativeLinks(
      suggestion.action.primaryId,
      suggestion.action.primaryPatch,
      familyId,
    );
    await relativesService.patchRelativeLinks(
      suggestion.action.secondaryId,
      suggestion.action.secondaryPatch,
      familyId,
    );
    return;
  }

  const { personId, patch } = suggestion.action;
  if (Object.keys(patch).length === 0) {
    return;
  }

  await relativesService.patchRelativeLinks(personId, patch, familyId);
}
