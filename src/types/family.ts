export type FamilyMemberRole = 'owner' | 'member';

export type Family = {
  id: string;
  name: string;
  ownerName: string | null;
  inviteCode: string;
  createdAt: string;
};

export type FamilyMember = {
  id: string;
  familyId: string;
  relativeId: string | null;
  displayName: string;
  role: FamilyMemberRole;
  joinedAt: string;
};

/** Active family session cached on device. Supabase remains source of truth when configured. */
export type FamilySession = {
  familyId: string;
  familyName: string;
  /** Display name of the current member in this family space. */
  ownerName: string;
  inviteCode: string;
  role: FamilyMemberRole;
  memberId?: string;
  relativeId?: string | null;
};

export type CreateFamilyInput = {
  familyName: string;
  ownerName: string;
};

export type JoinFamilyInput = {
  inviteCode: string;
};

export type JoinFamilyPreview = {
  familyId: string;
  familyName: string;
  inviteCode: string;
  ownerName: string | null;
};

export type FinalizeJoinInput = {
  familyId: string;
  familyName: string;
  inviteCode: string;
  displayName: string;
  relativeId?: string | null;
};

export type UpdateFamilyMemberInput = {
  memberId: string;
  familyId: string;
  relativeId?: string | null;
  displayName?: string;
};
