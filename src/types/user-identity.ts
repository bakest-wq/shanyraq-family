/** App user profile — not the same as a Relative row in shezhire. */
export type UserIdentityProfile = {
  userName: string;
  relativeId: string;
  familyId: string;
};

export type SaveUserIdentityInput = {
  userName?: string;
  relativeId: string;
  familyId: string;
};
