import { getSupabaseClient } from '@/lib/supabase';
import type { FamilyInsert, FamilyMemberInsert, FamilyRow } from '@/types/database';
import { Family } from '@/types/family';
import { normalizeInviteCode } from '@/utils/family-invite';

function handleSupabaseError(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message ?? fallback);
}

function mapFamilyRow(row: FamilyRow): Family {
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    createdAt: row.created_at,
  };
}

/** Supabase API for families — ready when backend migration is applied. */
export const familiesService = {
  async getById(id: string): Promise<Family | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('families').select('*').eq('id', id).maybeSingle();

    if (error) {
      handleSupabaseError(error, 'Failed to load family.');
    }

    return data ? mapFamilyRow(data) : null;
  },

  async create(name: string, inviteCode: string, id?: string): Promise<Family> {
    const supabase = getSupabaseClient();
    const payload: FamilyInsert = {
      ...(id ? { id } : {}),
      name: name.trim(),
      invite_code: inviteCode,
    };

    const { data, error } = await supabase.from('families').insert(payload).select('*').single();

    if (error) {
      handleSupabaseError(error, 'Failed to create family.');
    }

    return mapFamilyRow(data);
  },

  async getByInviteCode(inviteCode: string): Promise<Family | null> {
    const supabase = getSupabaseClient();
    const normalized = normalizeInviteCode(inviteCode);

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

  async addMember(input: FamilyMemberInsert): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('family_members').insert(input);

    if (error) {
      handleSupabaseError(error, 'Failed to add family member.');
    }
  },
};

