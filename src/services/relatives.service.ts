import { getSupabaseClient } from '@/lib/supabase';
import { enrichRelativesWithLocalPhotos } from '@/utils/relative-photo-local';
import { CreateRelativeInput, ConnectParentsInput, Relative } from '@/types/relative';
import {
  getChildrenLinkedToParent,
  ParentLinkRole,
} from '@/utils/family-child-links';
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

    return enrichRelativesWithLocalPhotos((data ?? []).map(mapRelativeRow));
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

    if (!data) {
      return null;
    }

    const [relative] = await enrichRelativesWithLocalPhotos([mapRelativeRow(data)]);
    return relative ?? null;
  },

  async create(input: CreateRelativeInput, familyId: string): Promise<Relative> {
    const supabase = getSupabaseClient();
    const payload = mapRelativeToInsert(input, familyId);

    const { data, error } = await supabase.from('relatives').insert(payload).select('*').single();

    if (error) {
      handleSupabaseError(error, 'Failed to save relative.');
    }

    const [relative] = await enrichRelativesWithLocalPhotos([mapRelativeRow(data)]);
    return relative;
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

    const [relative] = await enrichRelativesWithLocalPhotos([mapRelativeRow(data)]);
    return relative;
  },

  async updatePhotoUrl(
    id: string,
    photoUrl: string | null,
    familyId: string,
  ): Promise<Relative> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('relatives')
      .update({ photo_url: photoUrl })
      .eq('id', id)
      .eq('family_id', familyId)
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'Failed to update photo.');
    }

    const [relative] = await enrichRelativesWithLocalPhotos([mapRelativeRow(data)]);
    return relative;
  },

  async delete(id: string, familyId: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('relatives').delete().eq('id', id).eq('family_id', familyId);

    if (error) {
      handleSupabaseError(error, 'Failed to delete relative.');
    }
  },

  async syncParentChildLinks(
    parentId: string,
    selectedChildIds: string[],
    role: ParentLinkRole,
    familyId: string,
    relatives: Relative[],
  ): Promise<number> {
    const supabase = getSupabaseClient();
    const selectedSet = new Set(selectedChildIds);
    const currentlyLinked = getChildrenLinkedToParent(parentId, relatives, role);
    const updates: Array<{ childId: string; fatherId?: string | null; motherId?: string | null }> =
      [];

    for (const childId of selectedChildIds) {
      const child = relatives.find((relative) => relative.id === childId);
      if (!child) {
        continue;
      }

      if (role === 'father' && child.fatherId !== parentId) {
        updates.push({ childId, fatherId: parentId });
      }

      if (role === 'mother' && child.motherId !== parentId) {
        updates.push({ childId, motherId: parentId });
      }
    }

    for (const child of currentlyLinked) {
      if (selectedSet.has(child.id)) {
        continue;
      }

      if (role === 'father' && child.fatherId === parentId) {
        updates.push({ childId: child.id, fatherId: null });
      }

      if (role === 'mother' && child.motherId === parentId) {
        updates.push({ childId: child.id, motherId: null });
      }
    }

    for (const update of updates) {
      const row: { father_id?: string | null; mother_id?: string | null } = {};

      if (update.fatherId !== undefined) {
        row.father_id = update.fatherId;
      }

      if (update.motherId !== undefined) {
        row.mother_id = update.motherId;
      }

      const { error } = await supabase
        .from('relatives')
        .update(row)
        .eq('id', update.childId)
        .eq('family_id', familyId);

      if (error) {
        handleSupabaseError(error, 'Failed to sync child links.');
      }
    }

    return updates.length;
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

  async patchRelativeLinks(
    id: string,
    patch: Partial<ConnectParentsInput>,
    familyId: string,
  ): Promise<Relative> {
    const supabase = getSupabaseClient();
    const row: {
      father_id?: string | null;
      mother_id?: string | null;
      spouse_id?: string | null;
    } = {};

    if (patch.fatherId !== undefined) {
      row.father_id = patch.fatherId;
    }

    if (patch.motherId !== undefined) {
      row.mother_id = patch.motherId;
    }

    if (patch.spouseId !== undefined) {
      row.spouse_id = patch.spouseId;
    }

    if (Object.keys(row).length === 0) {
      const existing = await this.getById(id, familyId);
      if (!existing) {
        throw new Error('Relative not found.');
      }

      return existing;
    }

    const { data, error } = await supabase
      .from('relatives')
      .update(row)
      .eq('id', id)
      .eq('family_id', familyId)
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'Failed to update family links.');
    }

    return mapRelativeRow(data);
  },
};
