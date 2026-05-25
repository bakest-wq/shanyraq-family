export type EditEntityType = 'relative' | 'memory';

export type EditAction = 'create' | 'update' | 'delete' | 'restore';

export type EditActor = {
  memberId?: string;
  displayName: string;
  relativeId?: string | null;
};

export type RelativeEditSnapshot = {
  fullName: string;
  displayName: string;
  relationship: string;
  birthday: string;
  birthdayDay?: number | null;
  birthdayMonth?: number | null;
  birthdayYear?: number | null;
  birthdayYearUnknown?: boolean;
  phone: string;
  notes?: string;
  isDeceased: boolean;
  deathYear?: number;
  duaText?: string;
  gender?: string;
  maritalStatus?: string;
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
  zhuz?: string;
  ru?: string;
};

export type MemoryEditSnapshot = {
  id: string;
  title: string;
  relativeId: string | null;
  relativeName: string;
  year: string;
  month?: string;
  day?: string;
  story: string;
  category: string;
  hasPhoto: boolean;
  createdAt: string;
};

export type EditSnapshot = RelativeEditSnapshot | MemoryEditSnapshot;

export type EditEvent = {
  id: string;
  familyId: string;
  entityType: EditEntityType;
  entityId: string;
  entityLabel: string;
  action: EditAction;
  actor: EditActor;
  at: string;
  summary: string;
  before?: EditSnapshot;
  after?: EditSnapshot;
  restoredFromEventId?: string;
};

export const EDIT_HISTORY_MAX_EVENTS = 200;
