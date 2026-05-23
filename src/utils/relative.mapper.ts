import { AVATAR_COLORS, CreateRelativeInput, Relative } from '@/types/relative';
import type { RelativeInsert, RelativeRow, RelativeUpdate } from '@/types/database';
import { normalizeRelativeLinkId } from '@/utils/family-link-picker';
import { syncBirthdayFields } from '@/utils/birthday-parts';
import {
  composeDisplayName,
  composeFullName,
  getRelativeDisplayName,
  parseLegacyFullName,
} from '@/utils/relative-names';

export function mapRelativeRow(row: RelativeRow): Relative {
  const legacy = parseLegacyFullName(row.full_name);
  const firstName = row.first_name?.trim() || legacy.firstName;
  const middleName = row.middle_name?.trim() || legacy.middleName;
  const currentSurname = row.current_surname?.trim() || legacy.currentSurname;
  const composedFromParts = composeFullName({ firstName, middleName, currentSurname });
  const storedFull = row.full_name?.trim() ?? '';
  const fullName = composedFromParts || storedFull;
  const storedDisplay = row.display_name?.trim();
  const displayName =
    storedDisplay &&
    storedDisplay !== storedFull &&
    (!composedFromParts || storedDisplay !== composedFromParts)
      ? storedDisplay
      : composeDisplayName({ firstName, middleName, currentSurname, fullName });
  const birthdayFields = syncBirthdayFields({
    birthday: row.birthday ?? '',
    birthdayDay: row.birthday_day,
    birthdayMonth: row.birthday_month,
    birthdayYear: row.birthday_year,
    birthdayYearUnknown:
      row.birthday_day != null &&
      row.birthday_month != null &&
      row.birthday_year == null &&
      !row.birthday,
  });

  return {
    id: row.id,
    familyId: row.family_id ?? undefined,
    fullName,
    firstName,
    middleName,
    birthSurname: row.birth_surname ?? undefined,
    currentSurname,
    displayName,
    relationship: row.relationship,
    birthday: birthdayFields.birthday,
    birthdayDay: birthdayFields.birthdayDay,
    birthdayMonth: birthdayFields.birthdayMonth,
    birthdayYear: birthdayFields.birthdayYear,
    birthdayYearUnknown: birthdayFields.birthdayYearUnknown,
    phone: row.phone ?? '',
    avatarColor: row.avatar_color,
    photoUrl: row.photo_url ?? undefined,
    isDeceased: row.is_deceased,
    deathYear: row.death_year ?? undefined,
    duaText: row.dua_text ?? undefined,
    notes: row.notes ?? undefined,
    fatherId: normalizeRelativeLinkId(row.father_id) ?? undefined,
    motherId: normalizeRelativeLinkId(row.mother_id) ?? undefined,
    spouseId: normalizeRelativeLinkId(row.spouse_id) ?? undefined,
    gender: row.gender ?? undefined,
    maritalStatus: row.marital_status ?? undefined,
    zhuz: row.zhuz ?? undefined,
    ru: row.ru ?? undefined,
    ataLine: row.ata_line ?? undefined,
    tribeBranch: row.tribe_branch ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapRelativeToInsert(input: CreateRelativeInput, familyId?: string): RelativeInsert {
  return mapRelativePayload(input, familyId);
}

export function mapRelativeToUpdate(input: CreateRelativeInput, familyId?: string): RelativeUpdate {
  return mapRelativePayload(input, familyId);
}

function mapRelativePayload(input: CreateRelativeInput, familyId?: string): RelativeInsert {
  const fullName = composeFullName(input);
  const displayName = composeDisplayName({ ...input, fullName });
  const seedName = displayName || fullName || input.firstName;
  const birthdayFields = syncBirthdayFields(input);

  return {
    family_id: familyId ?? null,
    full_name: fullName,
    first_name: input.firstName.trim() || null,
    middle_name: input.middleName?.trim() || null,
    birth_surname: input.birthSurname?.trim() || null,
    current_surname: input.currentSurname?.trim() || null,
    display_name: displayName || null,
    relationship: input.relationship.trim(),
    birthday: birthdayFields.birthday.trim() || null,
    birthday_day: birthdayFields.birthdayDay,
    birthday_month: birthdayFields.birthdayMonth,
    birthday_year: birthdayFields.birthdayYear,
    phone: input.phone?.trim() || null,
    avatar_color: input.avatarColor ?? pickAvatarColor(seedName),
    photo_url: input.photoUrl ?? null,
    is_deceased: input.isDeceased ?? false,
    death_year: input.deathYear ?? null,
    dua_text: input.duaText?.trim() || null,
    notes: input.notes?.trim() || null,
    father_id: input.fatherId ?? null,
    mother_id: input.motherId ?? null,
    spouse_id: input.spouseId ?? null,
    gender: input.gender ?? null,
    marital_status: input.maritalStatus ?? null,
    zhuz: input.zhuz?.trim() || null,
    ru: input.ru?.trim() || null,
    ata_line: input.ataLine?.trim() || null,
    tribe_branch: input.tribeBranch?.trim() || null,
  };
}

export function pickAvatarColor(seed: string): string {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function filterLivingRelatives(relatives: Relative[]): Relative[] {
  return relatives.filter((relative) => !relative.isDeceased);
}

export function filterDeceasedRelatives(relatives: Relative[]): Relative[] {
  return relatives.filter((relative) => relative.isDeceased);
}

/** @deprecated Use getRelativeDisplayName */
export function getRelativeSortName(relative: Relative): string {
  return getRelativeDisplayName(relative);
}
