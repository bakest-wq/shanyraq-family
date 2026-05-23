import { getSupabaseClient } from '@/lib/supabase';
import { CreateRelativeInput, ConnectParentsInput, Relative } from '@/types/relative';
import {
  mapRelativeRow,
  mapRelativeToInsert,
  mapRelativeToUpdate,
} from '@/utils/relative.mapper';

function handleSupabaseError(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message ?? fallback);
}

export const relativesService = {
  async getAll(familyId: string): Promise<Relative[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('relatives')
      .select('*')
      .eq('family_id', familyId)
      .order('full_name', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'Failed to load relatives.');
    }

    return (data ?? []).map(mapRelativeRow);
  },

  async getById(id: string, familyId: string): Promise<Relative | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('relatives')
      .select('*')
      .eq('id', id)
      .eq('family_id', familyId)
      .maybeSingle();

    if (error) {
      handleSupabaseError(error, 'Failed to load relative.');
    }

    return data ? mapRelativeRow(data) : null;
  },

  async create(input: CreateRelativeInput, familyId: string): Promise<Relative> {
    const supabase = getSupabaseClient();
    const payload = mapRelativeToInsert(input, familyId);

    const { data, error } = await supabase.from('relatives').insert(payload).select('*').single();

    if (error) {
      handleSupabaseError(error, 'Failed to save relative.');
    }

    return mapRelativeRow(data);
  },

  async update(id: string, input: CreateRelativeInput, familyId: string): Promise<Relative> {
    const supabase = getSupabaseClient();
    const payload = mapRelativeToUpdate(input, familyId);

    const { data, error } = await supabase
      .from('relatives')
      .update(payload)
      .eq('id', id)
      .eq('family_id', familyId)
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'Failed to update relative.');
    }

    return mapRelativeRow(data);
  },

  async delete(id: string, familyId: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('relatives').delete().eq('id', id).eq('family_id', familyId);

    if (error) {
      handleSupabaseError(error, 'Failed to delete relative.');
    }
  },

  async connectParents(
    id: string,
    input: ConnectParentsInput,
    familyId: string,
  ): Promise<Relative> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('relatives')
      .update({
        father_id: input.fatherId ?? null,
        mother_id: input.motherId ?? null,
        spouse_id: input.spouseId ?? null,
      })
      .eq('id', id)
      .eq('family_id', familyId)
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'Failed to connect relatives.');
    }

    return mapRelativeRow(data);
  },
};
