import { AVATAR_COLORS, CreateRelativeInput, Relative } from '@/types/relative';
import type { RelativeInsert, RelativeRow, RelativeUpdate } from '@/types/database';

export function mapRelativeRow(row: RelativeRow): Relative {
  return {
    id: row.id,
    familyId: row.family_id ?? undefined,
    fullName: row.full_name,
    relationship: row.relationship,
    birthday: row.birthday ?? '',
    phone: row.phone ?? '',
    avatarColor: row.avatar_color,
    isDeceased: row.is_deceased,
    deathYear: row.death_year ?? undefined,
    duaText: row.dua_text ?? undefined,
    notes: row.notes ?? undefined,
    fatherId: row.father_id ?? undefined,
    motherId: row.mother_id ?? undefined,
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
  return {
    family_id: familyId ?? null,
    full_name: input.fullName.trim(),
    relationship: input.relationship.trim(),
    birthday: input.birthday.trim() || null,
    phone: input.phone?.trim() || null,
    avatar_color: input.avatarColor ?? pickAvatarColor(input.fullName),
    is_deceased: input.isDeceased ?? false,
    death_year: input.deathYear ?? null,
    dua_text: input.duaText?.trim() || null,
    notes: input.notes?.trim() || null,
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
