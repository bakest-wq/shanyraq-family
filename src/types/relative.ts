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
  birthdayDay?: number | null;
  birthdayMonth?: number | null;
  birthdayYear?: number | null;
  birthdayYearUnknown?: boolean;
  phone: string;
  avatarColor: string;
  photoUrl?: string;
  isDeceased: boolean;
  deathYear?: number;
  duaText?: string;
  notes?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  gender?: RelativeGender;
  maritalStatus?: MaritalStatus;
  zhuz?: string;
  ru?: string;
  ataLine?: string;
  tribeBranch?: string;
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
  birthdayDay?: number | null;
  birthdayMonth?: number | null;
  birthdayYear?: number | null;
  birthdayYearUnknown?: boolean;
  phone?: string;
  avatarColor?: string;
  photoUrl?: string;
  /** Local picker URI — saved after create/update, not sent to DB directly */
  pendingPhotoUri?: string;
  /** Form flag: user removed an existing photo */
  clearPhoto?: boolean;
  isDeceased?: boolean;
  deathYear?: number;
  duaText?: string;
  notes?: string;
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
  gender?: RelativeGender;
  maritalStatus?: MaritalStatus;
  zhuz?: string;
  ru?: string;
  ataLine?: string;
  tribeBranch?: string;
};

export type {
  RelationshipGroupId,
  RelationshipOption,
  RelationshipPreset,
} from '@/utils/relationship-presets';
export {
  RELATIONSHIP_GROUPS,
  RELATIONSHIP_OPTIONS,
  RELATIONSHIP_PRESETS,
  RELATIONSHIP_PRESET_RU,
  findRelationshipOption,
  getRelationshipLabel,
  getRelationshipRussian,
} from '@/utils/relationship-presets';

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
