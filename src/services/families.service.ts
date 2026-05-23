import { getSupabaseClient } from '@/lib/supabase';
import type {
  FamilyInsert,
  FamilyMemberInsert,
  FamilyMemberRow,
  FamilyMemberUpdate,
  FamilyRow,
  InviteCodeInsert,
} from '@/types/database';
import type { Family, FamilyMember, UpdateFamilyMemberInput } from '@/types/family';
import { normalizeInviteCode } from '@/utils/family-invite';

function handleSupabaseError(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message ?? fallback);
}

function mapFamilyRow(row: FamilyRow): Family {
  return {
    id: row.id,
    name: row.name,
    ownerName: row.owner_name,
    inviteCode: row.invite_code,
    createdAt: row.created_at,
  };
}

function mapFamilyMemberRow(row: FamilyMemberRow): FamilyMember {
  return {
    id: row.id,
    familyId: row.family_id,
    relativeId: row.relative_id,
    displayName: row.display_name,
    role: row.role,
    joinedAt: row.joined_at ?? row.created_at,
  };
}

/** Supabase API for families and members — ready for future RLS via auth.uid(). */
export const familiesService = {
  async getById(id: string): Promise<Family | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('families').select('*').eq('id', id).maybeSingle();

    if (error) {
      handleSupabaseError(error, 'Failed to load family.');
    }

    return data ? mapFamilyRow(data) : null;
  },

  async create(
    name: string,
    inviteCode: string,
    ownerName: string,
    id?: string,
  ): Promise<Family> {
    const supabase = getSupabaseClient();
    const payload: FamilyInsert = {
      ...(id ? { id } : {}),
      name: name.trim(),
      owner_name: ownerName.trim(),
      invite_code: inviteCode,
    };

    const { data, error } = await supabase.from('families').insert(payload).select('*').single();

    if (error) {
      handleSupabaseError(error, 'Failed to create family.');
    }

    await this.registerInviteCode(data.id, inviteCode);
    return mapFamilyRow(data);
  },

  async registerInviteCode(familyId: string, inviteCode: string): Promise<void> {
    const supabase = getSupabaseClient();
    const payload: InviteCodeInsert = {
      family_id: familyId,
      code: normalizeInviteCode(inviteCode),
      is_active: true,
    };

    const { error } = await supabase.from('invite_codes').insert(payload);

    if (error && !/duplicate|unique/i.test(error.message)) {
      handleSupabaseError(error, 'Failed to register invite code.');
    }
  },

  async getByInviteCode(inviteCode: string): Promise<Family | null> {
    const supabase = getSupabaseClient();
    const normalized = normalizeInviteCode(inviteCode);

    const { data: inviteRow, error: inviteError } = await supabase
      .from('invite_codes')
      .select('family_id, code, is_active')
      .eq('code', normalized)
      .eq('is_active', true)
      .maybeSingle();

    if (inviteError) {
      handleSupabaseError(inviteError, 'Failed to find invite code.');
    }

    if (inviteRow?.family_id) {
      return this.getById(inviteRow.family_id);
    }

    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('invite_code', normalized)
      .maybeSingle();

    if (error) {
      handleSupabaseError(error, 'Failed to find family by invite code.');
    }

    return data ? mapFamilyRow(data) : null;
  },

  async addMember(input: FamilyMemberInsert): Promise<FamilyMember> {
    const supabase = getSupabaseClient();
    const payload: FamilyMemberInsert = {
      ...input,
      joined_at: input.joined_at ?? new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('family_members')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'Failed to add family member.');
    }

    return mapFamilyMemberRow(data);
  },

  async updateMember(input: UpdateFamilyMemberInput): Promise<FamilyMember> {
    const supabase = getSupabaseClient();
    const patch: FamilyMemberUpdate = {};

    if (input.relativeId !== undefined) {
      patch.relative_id = input.relativeId;
    }

    if (input.displayName !== undefined) {
      patch.display_name = input.displayName.trim();
    }

    const { data, error } = await supabase
      .from('family_members')
      .update(patch)
      .eq('id', input.memberId)
      .eq('family_id', input.familyId)
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'Failed to update family member.');
    }

    return mapFamilyMemberRow(data);
  },

  async getMembers(familyId: string): Promise<FamilyMember[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId)
      .order('joined_at', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'Failed to load family members.');
    }

    return (data ?? []).map(mapFamilyMemberRow);
  },
};
