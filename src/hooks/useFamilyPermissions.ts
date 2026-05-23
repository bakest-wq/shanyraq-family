import { useFamilyContext } from '@/providers/FamilyProvider';
import {
  canDeleteFamilyData,
  canEditFamilyData,
  canSuggestFamilyEdits,
  canViewFamilyData,
  isFamilyOwner,
} from '@/utils/family-permissions';

export function useFamilyPermissions() {
  const { session, isOwner } = useFamilyContext();
  const role = session?.role ?? null;

  return {
    role,
    isOwner,
    canView: canViewFamilyData(role),
    canEdit: canEditFamilyData(role),
    canDelete: canDeleteFamilyData(role),
    canSuggestEdits: canSuggestFamilyEdits(role),
  };
}
