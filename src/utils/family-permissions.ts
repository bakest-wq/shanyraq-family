import type { FamilyMemberRole } from '@/types/family';

export function isFamilyOwner(role: FamilyMemberRole | null | undefined): boolean {
  return role === 'owner';
}

export function canEditFamilyData(role: FamilyMemberRole | null | undefined): boolean {
  return role === 'owner';
}

export function canDeleteFamilyData(role: FamilyMemberRole | null | undefined): boolean {
  return role === 'owner';
}

export function canSuggestFamilyEdits(role: FamilyMemberRole | null | undefined): boolean {
  return role === 'member';
}

export function canViewFamilyData(_role: FamilyMemberRole | null | undefined): boolean {
  return true;
}
