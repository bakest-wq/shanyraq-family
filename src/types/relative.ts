export type RelativeGender = 'male' | 'female';

export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced';

export type Relative = {
  id: string;
  familyId?: string;
  fullName: string;
  firstName: string;
  middleName?: string;
  birthSurname?: string;
  currentSurname?: string;
  displayName: string;
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
  spouseId?: string;
  gender?: RelativeGender;
  maritalStatus?: MaritalStatus;
  createdAt?: string;
};

export type ConnectParentsInput = {
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
};

export type CreateRelativeInput = {
  fullName: string;
  firstName: string;
  middleName?: string;
  birthSurname?: string;
  currentSurname?: string;
  displayName?: string;
  relationship: string;
  birthday: string;
  phone?: string;
  avatarColor?: string;
  isDeceased?: boolean;
  deathYear?: number;
  duaText?: string;
  notes?: string;
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
  gender?: RelativeGender;
  maritalStatus?: MaritalStatus;
};

export const RELATIONSHIP_PRESETS = [
  'Мен',
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

export const GENDER_OPTIONS: { id: RelativeGender; label: string; sublabel: string }[] = [
  { id: 'male', label: 'Ер · Мужской', sublabel: 'male' },
  { id: 'female', label: 'Әйел · Женский', sublabel: 'female' },
];

export const MARITAL_STATUS_OPTIONS: {
  id: MaritalStatus;
  label: string;
  sublabel: string;
}[] = [
  { id: 'single', label: 'Бойдақ · Холост', sublabel: 'single' },
  { id: 'married', label: 'Некеде · В браке', sublabel: 'married' },
  { id: 'widowed', label: 'Жесір · Вдовец/а', sublabel: 'widowed' },
  { id: 'divorced', label: 'Ажырасқан · Разведён', sublabel: 'divorced' },
];

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
