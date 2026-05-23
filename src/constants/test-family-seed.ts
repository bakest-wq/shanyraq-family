import type { CreateRelativeInput, RelativeGender, MaritalStatus } from '@/types/relative';
import { composeBirthdayIso } from '@/utils/birthday-parts';

export const TEST_FAMILY_SEED_MARKER = '[shanyraq:test-seed]';

export const TEST_FAMILY_RU = {
  zhuz: 'Ұлы жүз',
  ru: 'Арғын',
  tribeBranch: 'Қантық',
  ataLine: 'Қантық',
} as const;

type SeedPersonKey =
  | 'ata'
  | 'apa'
  | 'ake'
  | 'ana'
  | 'bauyrzhan'
  | 'zhubay'
  | 'ul'
  | 'kyzy'
  | 'apke'
  | 'zhien';

type SeedPersonDraft = {
  key: SeedPersonKey;
  input: CreateRelativeInput;
};

function birthday(day: number, month: number, year: number) {
  return {
    birthdayDay: day,
    birthdayMonth: month,
    birthdayYear: year,
    birthdayYearUnknown: false,
    birthday: composeBirthdayIso(day, month, year),
  };
}

function person(
  key: SeedPersonKey,
  draft: Omit<CreateRelativeInput, 'notes'> & { notes?: string },
): SeedPersonDraft {
  return {
    key,
    input: {
      ...draft,
      notes: draft.notes ? `${draft.notes} ${TEST_FAMILY_SEED_MARKER}` : TEST_FAMILY_SEED_MARKER,
    },
  };
}

function baseFields(options: {
  gender: RelativeGender;
  maritalStatus: MaritalStatus;
  withRu?: boolean;
}): Pick<CreateRelativeInput, 'gender' | 'maritalStatus' | 'zhuz' | 'ru' | 'tribeBranch' | 'ataLine'> {
  return {
    gender: options.gender,
    maritalStatus: options.maritalStatus,
    ...(options.withRu ? TEST_FAMILY_RU : {}),
  };
}

/** Ordered drafts — links are applied after all rows are created. */
export const TEST_FAMILY_SEED_DRAFTS: SeedPersonDraft[] = [
  person('ata', {
    firstName: 'Кенжебек',
    middleName: 'Сейітұлы',
    currentSurname: 'Сейітов',
    fullName: 'Кенжебек Сейітұлы Сейітов',
    displayName: 'Ата Кенжебек',
    relationship: 'Ата',
    phone: '+77001234501',
    ...birthday(15, 3, 1945),
    ...baseFields({ gender: 'male', maritalStatus: 'married', withRu: true }),
  }),
  person('apa', {
    firstName: 'Гулсим',
    middleName: 'Нұрланқызы',
    birthSurname: 'Қасымова',
    currentSurname: 'Сейітова',
    fullName: 'Гулсим Нұрланқызы Сейітова',
    displayName: 'Әже Гулсим',
    relationship: 'Апа',
    phone: '+77001234502',
    ...birthday(8, 7, 1948),
    ...baseFields({ gender: 'female', maritalStatus: 'married', withRu: true }),
  }),
  person('ake', {
    firstName: 'Асқар',
    middleName: 'Кенжебекұлы',
    currentSurname: 'Сейітов',
    fullName: 'Асқар Кенжебекұлы Сейітов',
    displayName: 'Әке Асқар',
    relationship: 'Әке',
    phone: '+77001234503',
    ...birthday(22, 1, 1970),
    ...baseFields({ gender: 'male', maritalStatus: 'married', withRu: true }),
  }),
  person('ana', {
    firstName: 'Айгул',
    middleName: 'Болатқызы',
    birthSurname: 'Омарова',
    currentSurname: 'Сейітова',
    fullName: 'Айгул Болатқызы Сейітова',
    displayName: 'Ана Айгул',
    relationship: 'Ана',
    phone: '+77001234504',
    ...birthday(3, 5, 1972),
    ...baseFields({ gender: 'female', maritalStatus: 'married' }),
  }),
  person('bauyrzhan', {
    firstName: 'Бауыржан',
    middleName: 'Асқарұлы',
    currentSurname: 'Сейітов',
    fullName: 'Бауыржан Асқарұлы Сейітов',
    displayName: 'Бауыржан',
    relationship: 'Мен',
    phone: '+77001234505',
    ...birthday(12, 9, 1995),
    ...baseFields({ gender: 'male', maritalStatus: 'married', withRu: true }),
  }),
  person('zhubay', {
    firstName: 'Дана',
    middleName: 'Ерланқызы',
    birthSurname: 'Қасымова',
    currentSurname: 'Сейітова',
    fullName: 'Дана Ерланқызы Сейітова',
    displayName: 'Дана',
    relationship: 'Жұбайы',
    phone: '+77001234506',
    ...birthday(20, 11, 1997),
    ...baseFields({ gender: 'female', maritalStatus: 'married' }),
  }),
  person('ul', {
    firstName: 'Нұрсұлтан',
    middleName: 'Бауыржанұлы',
    currentSurname: 'Сейітов',
    fullName: 'Нұрсұлтан Бауыржанұлы Сейітов',
    displayName: 'Нұрсұлтан',
    relationship: 'Ұлы',
    phone: '',
    ...birthday(5, 4, 2018),
    ...baseFields({ gender: 'male', maritalStatus: 'single' }),
  }),
  person('kyzy', {
    firstName: 'Айдана',
    middleName: 'Бауыржанқызы',
    currentSurname: 'Сейітова',
    fullName: 'Айдана Бауыржанқызы Сейітова',
    displayName: 'Айдана',
    relationship: 'Қызы',
    phone: '',
    ...birthday(30, 8, 2020),
    ...baseFields({ gender: 'female', maritalStatus: 'single' }),
  }),
  person('apke', {
    firstName: 'Әйгерім',
    middleName: 'Асқарқызы',
    currentSurname: 'Сейітова',
    fullName: 'Әйгерім Асқарқызы Сейітова',
    displayName: 'Әйгерім',
    relationship: 'Әпке',
    phone: '+77001234507',
    ...birthday(14, 2, 1998),
    ...baseFields({ gender: 'female', maritalStatus: 'single' }),
  }),
  person('zhien', {
    firstName: 'Арман',
    middleName: 'Ерланұлы',
    currentSurname: 'Қасымов',
    fullName: 'Арман Ерланұлы Қасымов',
    displayName: 'Арман',
    relationship: 'Жиен',
    phone: '',
    ...birthday(18, 6, 2022),
    ...baseFields({ gender: 'male', maritalStatus: 'single' }),
  }),
];

export type TestFamilySeedKey = SeedPersonKey;

export const TEST_FAMILY_SEED_LABELS: Record<SeedPersonKey, string> = {
  ata: 'Ата',
  apa: 'Әже',
  ake: 'Әке',
  ana: 'Ана',
  bauyrzhan: 'Бауыржан',
  zhubay: 'Жұбайы',
  ul: 'Ұлы',
  kyzy: 'Қызы',
  apke: 'Әпке',
  zhien: 'Жиен',
};
