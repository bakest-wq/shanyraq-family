export type Relative = {
  id: string;
  familyId?: string;
  fullName: string;
  relationship: string;
  birthday: string;
  phone: string;
  avatarColor: string;
  isDeceased: boolean;
  deathYear?: number;
  duaText?: string;
  notes?: string;
  fatherId?: string;
  motherId?: string;
  createdAt?: string;
};

export type ConnectParentsInput = {
  fatherId?: string | null;
  motherId?: string | null;
};

export type CreateRelativeInput = {
  fullName: string;
  relationship: string;
  birthday: string;
  phone?: string;
  avatarColor?: string;
  isDeceased?: boolean;
  deathYear?: number;
  duaText?: string;
  notes?: string;
};

export const RELATIONSHIP_PRESETS = [
  'Ата',
  'Апа',
  'Әке',
  'Ана',
  'Аға',
  'Әпке',
  'Бала',
  'Немере',
] as const;

export type RelationshipPreset = (typeof RELATIONSHIP_PRESETS)[number];

export const AVATAR_COLORS = [
  '#1B4332',
  '#2D6A4F',
  '#40916C',
  '#52796F',
  '#74A892',
  '#95B8A5',
  '#C9A227',
  '#5C6B5C',
] as const;
