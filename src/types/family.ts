export type FamilyMemberRole = 'owner' | 'member';

export type Family = {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
};

export type FamilyMember = {
  id: string;
  familyId: string;
  displayName: string;
  role: FamilyMemberRole;
  createdAt: string;
};

/** Local session stored in AsyncStorage until Supabase auth is wired. */
export type FamilySession = {
  familyId: string;
  familyName: string;
  ownerName: string;
  inviteCode: string;
  role: FamilyMemberRole;
};

export type CreateFamilyInput = {
  familyName: string;
  ownerName: string;
};

export type JoinFamilyInput = {
  inviteCode: string;
  memberName: string;
};
